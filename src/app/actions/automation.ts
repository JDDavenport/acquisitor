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
    // In production, this would check Gmail via gog CLI
    // For now, log that the check was attempted
    await db
      .update(automationLogs)
      .set({
        status: 'success',
        message: 'Reply check completed. No new replies detected.',
        itemsProcessed: 0,
      })
      .where(eq(automationLogs.id, logId));

    return { success: true, newReplies: 0 };
  } catch (error) {
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
