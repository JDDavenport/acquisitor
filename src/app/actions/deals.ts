'use server';

import { db } from '@/lib/db';
import { deals, leads } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface CreateDealInput {
  leadId: string;
  title?: string;
  value?: number;
  probability?: number;
  expectedCloseDate?: Date;
  notes?: string;
}

export interface UpdateDealInput {
  title?: string;
  value?: number;
  stage?: string;
  probability?: number;
  expectedCloseDate?: Date;
  notes?: string;
}

export async function getDeals(
  userId: string,
  filters?: {
    stage?: string;
    search?: string;
  }
) {
  const conditions: any[] = [eq(deals.userId, userId)];

  if (filters?.stage) {
    conditions.push(eq(deals.stage, filters.stage as any));
  }

  const query = db.select().from(deals);
  
  if (conditions.length === 1) {
    return await query.where(conditions[0]);
  } else if (conditions.length > 1) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function createDeal(userId: string, leadId: string, data: CreateDealInput) {
  const id = nanoid();

  // Get the lead to use its title if no deal title provided
  const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  const leadData = lead[0];

  if (!leadData) throw new Error('Lead not found');

  const newDeal = {
    id,
    userId,
    leadId,
    title: data.title || `${leadData.title} - Deal`,
    value: data.value ? String(data.value) : '0',
    stage: 'sourcing' as const,
    probability: data.probability || 30,
    expectedCloseDate: data.expectedCloseDate,
    notes: data.notes,
  };

  await db.insert(deals).values(newDeal);
  return newDeal;
}

export async function updateDeal(id: string, data: UpdateDealInput) {
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.value !== undefined) updateData.value = String(data.value);
  if (data.stage !== undefined) updateData.stage = data.stage;
  if (data.probability !== undefined) updateData.probability = data.probability;
  if (data.expectedCloseDate !== undefined) updateData.expectedCloseDate = data.expectedCloseDate;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await db.update(deals).set(updateData).where(eq(deals.id, id));
  return { success: true };
}

export async function moveDealStage(id: string, newStage: string) {
  const stages = ['sourcing', 'screening', 'loi', 'diligence', 'closing', 'won', 'lost'];
  if (!stages.includes(newStage)) throw new Error('Invalid stage');

  // Calculate probability based on stage
  const probabilityMap: Record<string, number> = {
    sourcing: 10,
    screening: 25,
    loi: 50,
    diligence: 75,
    closing: 90,
    won: 100,
    lost: 0,
  };

  await db.update(deals).set({
    stage: newStage as any,
    probability: probabilityMap[newStage],
  }).where(eq(deals.id, id));

  return { success: true };
}

export async function deleteDeal(id: string) {
  await db.update(deals).set({ stage: 'lost' }).where(eq(deals.id, id));
  return { success: true };
}
