'use server';

import { db } from '@/lib/db';
import { deals, leads, activities, documents, diligenceChecklist, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const DEFAULT_CHECKLIST_TEMPLATE = [
  {
    category: 'Financial',
    items: [
      'Tax returns (3 years)',
      'P&L statements',
      'Balance sheets',
      'Cash flow statements',
      'AR/AP aging reports',
      'Debt schedule',
    ],
  },
  {
    category: 'Legal',
    items: [
      'Business licenses',
      'Contracts',
      'Leases',
      'Litigation history',
      'IP/trademarks',
      'Insurance policies',
    ],
  },
  {
    category: 'Operations',
    items: [
      'Employee roster',
      'Org chart',
      'Standard operating procedures',
      'Vendor list',
      'Customer list',
      'Equipment inventory',
    ],
  },
  {
    category: 'HR',
    items: [
      'Employment agreements',
      'Benefits documentation',
      'Pending claims',
      'Non-competes',
      'Key person risk assessment',
    ],
  },
];

export interface DealDetails {
  deal: any;
  lead: any;
  activities: any[];
  documents: any[];
  checklist: any[];
}

export async function getDealDetails(dealId: string): Promise<DealDetails> {
  // Get deal
  const dealData = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (!dealData.length) throw new Error('Deal not found');

  const deal = dealData[0];

  // Get lead
  let lead = null;
  if (deal.leadId) {
    const leadData = await db.select().from(leads).where(eq(leads.id, deal.leadId)).limit(1);
    lead = leadData[0] || null;
  }

  // Get activities
  const activitiesData = await db.select().from(activities).where(eq(activities.dealId, dealId));

  // Get documents
  const documentsData = await db.select().from(documents).where(eq(documents.dealId, dealId));

  // Get checklist
  const checklistData = await db.select().from(diligenceChecklist).where(eq(diligenceChecklist.dealId, dealId));

  return {
    deal,
    lead,
    activities: activitiesData,
    documents: documentsData,
    checklist: checklistData,
  };
}

export async function initializeChecklist(dealId: string, userId: string) {
  // Check if checklist already exists
  const existing = await db.select().from(diligenceChecklist).where(eq(diligenceChecklist.dealId, dealId)).limit(1);
  if (existing.length > 0) {
    return { success: false, message: 'Checklist already initialized' };
  }

  const items: any[] = [];
  for (const categoryData of DEFAULT_CHECKLIST_TEMPLATE) {
    for (const item of categoryData.items) {
      items.push({
        id: nanoid(),
        dealId,
        category: categoryData.category,
        item,
        completed: false,
        assignedTo: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  await db.insert(diligenceChecklist).values(items);
  return { success: true };
}

export async function addChecklistItem(dealId: string, category: string, item: string, userId: string) {
  const id = nanoid();

  await db.insert(diligenceChecklist).values({
    id,
    dealId,
    category,
    item,
    completed: false,
    assignedTo: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { id, success: true };
}

export async function toggleChecklistItem(id: string, completed: boolean) {
  await db.update(diligenceChecklist).set({
    completed,
    updatedAt: new Date(),
  }).where(eq(diligenceChecklist.id, id));

  return { success: true };
}

export async function updateChecklistItem(id: string, data: { notes?: string; assignedTo?: string }) {
  const updateData: any = {};

  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  updateData.updatedAt = new Date();

  await db.update(diligenceChecklist).set(updateData).where(eq(diligenceChecklist.id, id));

  return { success: true };
}

export interface AddDocumentInput {
  name: string;
  category?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

export async function addDocument(dealId: string, uploadedBy: string, data: AddDocumentInput) {
  const id = nanoid();

  await db.insert(documents).values({
    id,
    dealId,
    name: data.name,
    category: data.category,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    uploadedBy,
    createdAt: new Date(),
  });

  return { id, success: true };
}

export async function deleteDocument(id: string) {
  await db.delete(documents).where(eq(documents.id, id));
  return { success: true };
}

export async function deleteChecklistItem(id: string) {
  await db.delete(diligenceChecklist).where(eq(diligenceChecklist.id, id));
  return { success: true };
}
