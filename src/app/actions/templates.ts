'use server';

import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface CreateTemplateInput {
  name: string;
  subject: string;
  body: string;
  category?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  category?: string;
}

export async function getTemplates(userId: string) {
  return await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.userId, userId))
    .orderBy(emailTemplates.createdAt);
}

export async function getTemplate(id: string, userId: string) {
  const result = await db
    .select()
    .from(emailTemplates)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function createTemplate(userId: string, data: CreateTemplateInput) {
  const id = nanoid();

  const newTemplate = {
    id,
    userId,
    name: data.name,
    subject: data.subject,
    body: data.body,
    category: data.category || 'general',
  };

  await db.insert(emailTemplates).values(newTemplate);
  return newTemplate;
}

export async function updateTemplate(id: string, userId: string, data: UpdateTemplateInput) {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.body !== undefined) updateData.body = data.body;
  if (data.category !== undefined) updateData.category = data.category;

  await db
    .update(emailTemplates)
    .set(updateData)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)));

  return { success: true };
}

export async function deleteTemplate(id: string, userId: string) {
  await db
    .delete(emailTemplates)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)));

  return { success: true };
}
