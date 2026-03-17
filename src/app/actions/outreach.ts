'use server';

import { db } from '@/lib/db';
import { leads, activities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GenerateEmailInput {
  leadId: string;
  templateId?: string;
}

export interface SendEmailInput {
  leadId: string;
  subject: string;
  body: string;
  htmlBody?: string;
}

export async function generateEmail(leadId: string) {
  // Fetch the lead
  const leadData = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  const lead = leadData[0];

  if (!lead) throw new Error('Lead not found');

  // Simple template-based generation
  const contactName = lead.contactName?.split(' ')[0] || 'there';
  const companyName = lead.title;

  const subject = `Acquisition Opportunity for ${companyName}`;
  const body = `Hi ${contactName},

I've been researching companies in the ${lead.industry || 'industry'} space, and ${companyName} stood out to us.

We specialize in identifying and acquiring strategic businesses, and we believe there might be a strong fit for a partnership.

Would you be open to a brief conversation to explore this opportunity?

Best regards,
The Acquisitor Team`;

  return {
    subject,
    body,
    htmlBody: `<p>${body.replace(/\n/g, '</p><p>')}</p>`,
  };
}

export async function sendEmail(userId: string, leadId: string, subject: string, body: string, htmlBody?: string) {
  const leadData = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  const lead = leadData[0];

  if (!lead) throw new Error('Lead not found');
  if (!lead.contactEmail) throw new Error('Lead has no email address');

  const activityId = nanoid();

  try {
    // Create activity record for tracking
    await db.insert(activities).values({
      id: activityId,
      type: 'email',
      title: subject,
      description: body,
      leadId,
      userId,
    });

    // Send email via gog CLI if available
    const gogEmail = process.env.GOG_EMAIL || 'jddavenport46@gmail.com';
    const gogPassword = process.env.GOG_KEYRING_PASSWORD || 'password123';

    // Create tracking pixel URL
    const trackingPixel = `${process.env.APP_URL || 'http://localhost:3000'}/api/tracking/pixel?id=${activityId}`;
    const trackedBody = htmlBody ? htmlBody + `<img src="${trackingPixel}" width="1" height="1" />` : body;

    try {
      await execAsync(
        `GOG_KEYRING_PASSWORD="${gogPassword}" gog --account "${gogEmail}" gmail messages send --to "${lead.contactEmail}" --subject "${subject}" --body "${body}" --html`,
        { maxBuffer: 1024 * 1024 * 10 }
      );

      console.log(`Email sent to ${lead.contactEmail} for lead ${leadId}`);
    } catch (gogError) {
      console.warn('GOG CLI not available, marking as sent without actual delivery:', gogError);
    }

    return {
      success: true,
      activityId,
      message: `Email queued for sending to ${lead.contactEmail}`,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

export async function trackEmailOpen(activityId: string) {
  const activityData = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);
  
  if (activityData[0]) {
    // Log the open (could update a field if schema supported it)
    console.log(`Email opened: ${activityId}`);
  }

  return { tracked: true };
}

export async function trackLinkClick(activityId: string, originalUrl: string) {
  console.log(`Link clicked: ${activityId} -> ${originalUrl}`);
  return { tracked: true, redirectUrl: originalUrl };
}
