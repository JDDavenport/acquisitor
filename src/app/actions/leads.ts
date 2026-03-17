'use server';

import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, and, or, like, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface CreateLeadInput {
  title: string;
  description?: string;
  industry?: string;
  location?: string;
  source?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  revenue?: number;
  profit?: number;
  askingPrice?: number;
  employees?: number;
  yearFounded?: number;
}

export interface UpdateLeadInput {
  title?: string;
  description?: string;
  industry?: string;
  location?: string;
  source?: string;
  status?: string;
  score?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  revenue?: number;
  profit?: number;
  askingPrice?: number;
  employees?: number;
  yearFounded?: number;
}

export async function getLeads(
  userId: string,
  filters?: {
    status?: string;
    industry?: string;
    scoreMin?: number;
    scoreMax?: number;
    search?: string;
  }
) {
  const conditions: any[] = [eq(leads.userId, userId)];

  if (filters?.status) {
    conditions.push(eq(leads.status, filters.status as any));
  }

  if (filters?.industry) {
    conditions.push(eq(leads.industry, filters.industry));
  }

  if (filters?.scoreMin !== undefined) {
    conditions.push((leads.score as any) >= filters.scoreMin);
  }

  if (filters?.scoreMax !== undefined) {
    conditions.push((leads.score as any) <= filters.scoreMax);
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(leads.title, searchTerm),
        like(leads.description, searchTerm),
        like(leads.contactEmail, searchTerm),
        like(leads.contactName, searchTerm)
      )
    );
  }

  const query = db.select().from(leads);
  
  if (conditions.length === 1) {
    return await query.where(conditions[0]);
  } else if (conditions.length > 1) {
    return await query.where(and(...conditions));
  }
  
  return await query;
}

export async function createLead(userId: string, data: CreateLeadInput) {
  const id = nanoid();

  const newLead = {
    id,
    userId,
    title: data.title,
    description: data.description,
    industry: data.industry,
    location: data.location,
    source: data.source || 'manual',
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    website: data.website,
    revenue: data.revenue ? String(data.revenue) : '0',
    profit: data.profit ? String(data.profit) : '0',
    askingPrice: data.askingPrice ? String(data.askingPrice) : '0',
    employees: data.employees || 0,
    yearFounded: data.yearFounded,
    status: 'new' as const,
    score: 0,
  };

  await db.insert(leads).values(newLead);
  return newLead;
}

export async function updateLead(id: string, data: UpdateLeadInput) {
  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.score !== undefined) updateData.score = data.score;
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.revenue !== undefined) updateData.revenue = String(data.revenue);
  if (data.profit !== undefined) updateData.profit = String(data.profit);
  if (data.askingPrice !== undefined) updateData.askingPrice = String(data.askingPrice);
  if (data.employees !== undefined) updateData.employees = data.employees;
  if (data.yearFounded !== undefined) updateData.yearFounded = data.yearFounded;

  await db.update(leads).set(updateData).where(eq(leads.id, id));
  return { success: true };
}

export async function deleteLead(id: string) {
  // Soft delete via archiving
  await db.update(leads).set({ status: 'archived' }).where(eq(leads.id, id));
  return { success: true };
}

export async function importLeadsCSV(userId: string, csvData: string) {
  const lines = csvData.split('\n').filter((line) => line.trim());
  if (lines.length < 2) throw new Error('CSV must have header and at least one row');

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const importedLeads = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    if (values.every((v) => !v)) continue; // Skip empty rows

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const lead = await createLead(userId, {
      title: row.title || row.company || row.name || 'Untitled',
      description: row.description,
      industry: row.industry,
      location: row.location || row.city,
      source: 'csv_import',
      contactName: row.contact_name || row.name,
      contactEmail: row.email || row.contact_email,
      contactPhone: row.phone || row.contact_phone,
      website: row.website,
      revenue: parseFloat(row.revenue) || 0,
      askingPrice: parseFloat(row.asking_price) || 0,
      employees: parseInt(row.employees) || 0,
      yearFounded: parseInt(row.year_founded) || undefined,
    });

    importedLeads.push(lead);
  }

  return { count: importedLeads.length, leads: importedLeads };
}
