'use server';

import { db } from '@/lib/db';
import { automationLogs, automationSettings, replyQueue, leads, activities } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Get automation settings for a user
export async function getAutomationSettings(userId: string) {
  const settings = await db
    .select()
    .from(automationSettings)
    .where(eq(automationSettings.userId, userId));

  // Return defaults if not configured
  const types = ['discover', 'outreach', 'check-replies'];
  const result: Record<string, any> = {};

  for (const type of types) {
    const existing = settings.find((s) => s.type === type);
    result[type] = existing || {
      id: null,
      type,
      enabled: false,
      lastRunAt: null,
      nextRunAt: null,
      config: null,
    };
  }

  return result;
}

// Toggle automation on/off
export async function toggleAutomation(userId: string, type: string, enabled: boolean) {
  const existing = await db
    .select()
    .from(automationSettings)
    .where(and(eq(automationSettings.userId, userId), eq(automationSettings.type, type)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(automationSettings)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(automationSettings.id, existing[0].id));
  } else {
    await db.insert(automationSettings).values({
      id: nanoid(),
      userId,
      type,
      enabled,
    });
  }

  return { success: true };
}

// Get automation logs
export async function getAutomationLogs(userId: string, limit: number = 50) {
  return await db
    .select()
    .from(automationLogs)
    .where(eq(automationLogs.userId, userId))
    .orderBy(desc(automationLogs.createdAt))
    .limit(limit);
}

// Log an automation run
export async function logAutomationRun(
  userId: string,
  type: string,
  status: 'success' | 'error' | 'running',
  message: string,
  itemsProcessed: number = 0
) {
  const id = nanoid();
  await db.insert(automationLogs).values({
    id,
    type,
    status,
    message,
    itemsProcessed,
    userId,
  });

  // Update last run time in settings
  await db
    .update(automationSettings)
    .set({ lastRunAt: new Date(), updatedAt: new Date() })
    .where(and(eq(automationSettings.userId, userId), eq(automationSettings.type, type)));

  return id;
}

// Get reply queue
export async function getReplyQueue(userId: string) {
  return await db
    .select()
    .from(replyQueue)
    .where(and(eq(replyQueue.userId, userId), eq(replyQueue.status, 'pending')))
    .orderBy(desc(replyQueue.createdAt));
}

// Update reply queue item
export async function updateReplyQueueItem(id: string, status: string, editedResponse?: string) {
  const updateData: any = { status, updatedAt: new Date() };
  if (editedResponse) updateData.draftResponse = editedResponse;

  await db.update(replyQueue).set(updateData).where(eq(replyQueue.id, id));
  return { success: true };
}

// Run discover automation
export async function runDiscoverAutomation(userId: string) {
  const { discoverLeads } = await import('./discovery');

  const logId = await logAutomationRun(userId, 'discover', 'running', 'Starting discovery...');

  try {
    const result = await discoverLeads(userId, {
      sources: ['bizBuySell', 'bizQuest'],
      state: 'utah',
      maxPages: 2,
    });

    await db
      .update(automationLogs)
      .set({
        status: 'success',
        message: `Discovered ${result.totalFound} leads, ${result.newLeads} new, ${result.duplicatesSkipped} duplicates`,
        itemsProcessed: result.newLeads,
      })
      .where(eq(automationLogs.id, logId));

    return { success: true, ...result };
  } catch (error) {
    await db
      .update(automationLogs)
      .set({
        status: 'error',
        message: error instanceof Error ? error.message : 'Discovery failed',
      })
      .where(eq(automationLogs.id, logId));

    return { success: false, error: error instanceof Error ? error.message : 'Discovery failed' };
  }
}

// Run outreach automation
export async function runOutreachAutomation(userId: string) {
  const { generateEmail, sendEmail } = await import('./outreach');

  const logId = await logAutomationRun(userId, 'outreach', 'running', 'Starting outreach...');

  try {
    // Find leads that haven't been contacted yet
    const newLeads = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, userId), eq(leads.status, 'new')))
      .limit(5);

    let sentCount = 0;
    for (const lead of newLeads) {
      if (!lead.contactEmail) continue;

      try {
        const email = await generateEmail(lead.id);
        await sendEmail(userId, lead.id, email.subject, email.body, email.htmlBody);
        sentCount++;
      } catch (e) {
        console.error(`Failed to send email to lead ${lead.id}:`, e);
      }
    }

    await db
      .update(automationLogs)
      .set({
        status: 'success',
        message: `Sent ${sentCount} outreach emails to new leads`,
        itemsProcessed: sentCount,
      })
      .where(eq(automationLogs.id, logId));

    return { success: true, sent: sentCount };
  } catch (error) {
    await db
      .update(automationLogs)
      .set({
        status: 'error',
        message: error instanceof Error ? error.message : 'Outreach failed',
      })
      .where(eq(automationLogs.id, logId));

    return { success: false, error: error instanceof Error ? error.message : 'Outreach failed' };
  }
}

// Run check-replies automation
export async function runCheckRepliesAutomation(userId: string) {
  const logId = await logAutomationRun(userId, 'check-replies', 'running', 'Checking for replies...');

  try {
    // Import required modules
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const OpenAI = await import('openai').then(m => m.default);
    
    const execAsync = promisify(exec);

    // Get Gmail credentials from environment
    const gogEmail = process.env.GOG_EMAIL || 'jddavenport46@gmail.com';
    const gogPassword = process.env.GOG_KEYRING_PASSWORD || 'password123';
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Search for unread replies in Gmail
    let emailOutput = '';
    try {
      const { stdout } = await execAsync(
        `GOG_KEYRING_PASSWORD="${gogPassword}" gog --account "${gogEmail}" gmail messages search "is:unread subject:re" --limit 20`,
        { maxBuffer: 1024 * 1024 * 10 }
      );
      emailOutput = stdout;
    } catch (err: any) {
      console.warn('Failed to search Gmail:', err.message);
      throw new Error('Failed to search Gmail for replies');
    }

    if (!emailOutput || emailOutput.trim() === '') {
      await db
        .update(automationLogs)
        .set({
          status: 'success',
          message: 'Reply check completed. No new replies detected.',
          itemsProcessed: 0,
        })
        .where(eq(automationLogs.id, logId));

      return { success: true, newReplies: 0 };
    }

    // Parse email output - extract sender emails
    const emailLines = emailOutput.split('\n').filter(line => line.trim().length > 0);
    const senderEmails = new Set<string>();
    
    for (const line of emailLines) {
      // Try to extract email from line - format varies but typically contains "from: email@domain.com"
      const emailMatch = line.match(/(?:from[:\s]+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch?.[1]) {
        senderEmails.add(emailMatch[1].toLowerCase());
      }
    }

    if (senderEmails.size === 0) {
      await db
        .update(automationLogs)
        .set({
          status: 'success',
          message: 'Reply check completed. No new replies detected.',
          itemsProcessed: 0,
        })
        .where(eq(automationLogs.id, logId));

      return { success: true, newReplies: 0 };
    }

    // Match replies to leads in database
    const matchedLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId));

    // Map sender emails to leads
    const emailToLead: Record<string, typeof leads.$inferSelect> = {};
    for (const lead of matchedLeads) {
      if (lead.contactEmail) {
        emailToLead[lead.contactEmail.toLowerCase()] = lead;
      }
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiKey });

    let processedCount = 0;

    // Process each reply sender
    for (const senderEmail of senderEmails) {
      const matchedLead = emailToLead[senderEmail];
      
      if (!matchedLead) {
        console.log(`No lead found for email ${senderEmail}, skipping`);
        continue;
      }

      try {
        // Check if we already have a pending reply for this lead
        const existingReply = await db
          .select()
          .from(replyQueue)
          .where(and(eq(replyQueue.leadId, matchedLead.id), eq(replyQueue.status, 'pending')))
          .limit(1);

        if (existingReply.length > 0) {
          console.log(`Pending reply already exists for lead ${matchedLead.id}`);
          continue;
        }

        // Get the actual email content using gog CLI
        let emailContent = '';
        try {
          const { stdout: msgStdout } = await execAsync(
            `GOG_KEYRING_PASSWORD="${gogPassword}" gog --account "${gogEmail}" gmail messages show --limit 1 "from:${senderEmail} is:unread subject:re"`,
            { maxBuffer: 1024 * 1024 * 10 }
          );
          emailContent = msgStdout;
        } catch (err) {
          console.warn(`Failed to fetch email from ${senderEmail}`);
          emailContent = '';
        }

        // Classify the reply with OpenAI
        const classificationPrompt = `You are an email classification AI. Analyze this business acquisition reply and classify it as one of: "interested", "not_interested", or "meeting_request".

From: ${senderEmail}
Subject: Re: Acquisition Opportunity

Email content:
${emailContent || 'Unable to fetch content'}

Respond with ONLY a JSON object in this exact format:
{
  "classification": "<interested|not_interested|meeting_request>",
  "confidence": <0-100>,
  "reasoning": "<brief reason for classification>"
}`;

        let classificationResult = { classification: 'interested', confidence: 50, reasoning: 'Unable to classify' };
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an email classification engine. Always respond with valid JSON only.',
              },
              {
                role: 'user',
                content: classificationPrompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 300,
          });

          const content = response.choices[0]?.message?.content;
          if (content) {
            try {
              const jsonMatch = content.match(/```json\n?([\s\S]*?)```/) || 
                               content.match(/```\n?([\s\S]*?)```/) ||
                               [null, content];
              const jsonString = jsonMatch[1]?.trim() || content.trim();
              classificationResult = JSON.parse(jsonString);
            } catch (parseErr) {
              console.warn('Failed to parse classification:', parseErr);
            }
          }
        } catch (aiErr) {
          console.warn('OpenAI classification failed:', aiErr);
        }

        // Generate draft response based on classification
        let draftResponse = '';
        const companyName = matchedLead.title;
        const contactName = matchedLead.contactName?.split(' ')[0] || 'there';

        if (classificationResult.classification === 'interested') {
          draftResponse = `Hi ${contactName},

Thank you for getting back to me! I'm excited to hear that you might be interested in exploring this opportunity further.

I'd love to schedule a time to discuss how we could work together. Are you available for a brief call this week or next week?

Looking forward to speaking with you!

Best regards`;
        } else if (classificationResult.classification === 'meeting_request') {
          draftResponse = `Hi ${contactName},

Absolutely! I'd be happy to set up a time to discuss this in more detail.

How about [suggest times]? I'm flexible and can work around your schedule.

Looking forward to our conversation!

Best regards`;
        } else {
          // not_interested
          draftResponse = `Hi ${contactName},

Thank you for considering this opportunity. I understand it might not be the right fit at this time.

If circumstances change in the future or you know of any other companies that might be interested, please don't hesitate to reach out.

Best regards`;
        }

        // Create reply queue entry
        const replyId = nanoid();
        await db.insert(replyQueue).values({
          id: replyId,
          leadId: matchedLead.id,
          originalSubject: `Re: Acquisition Opportunity for ${companyName}`,
          replyBody: emailContent,
          draftResponse,
          status: 'pending',
          userId,
        });

        processedCount++;
        console.log(`Created reply queue entry for ${matchedLead.title} (${senderEmail})`);
      } catch (entryErr) {
        console.error(`Error processing reply from ${senderEmail}:`, entryErr);
      }
    }

    // Update log with success
    await db
      .update(automationLogs)
      .set({
        status: 'success',
        message: `Processed ${processedCount} new replies. ${senderEmails.size - processedCount} replies skipped (no matching lead).`,
        itemsProcessed: processedCount,
      })
      .where(eq(automationLogs.id, logId));

    return { success: true, newReplies: processedCount };
  } catch (error) {
    console.error('checkRepliesAutomation error:', error);
    
    await db
      .update(automationLogs)
      .set({
        status: 'error',
        message: error instanceof Error ? error.message : 'Reply check failed',
      })
      .where(eq(automationLogs.id, logId));

    return { success: false, error: error instanceof Error ? error.message : 'Reply check failed' };
  }
}
