'use server';

import { scoreLead, type LeadScoreResult } from './ai';
import { createLead, updateLead } from './leads';
import { scrapeBizBuySell } from './scrapers/bizbuysell';
import { scrapeBizQuest } from './scrapers/bizquest';
import { db } from '@/lib/db';
import { leads as leadsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface DiscoveryOptions {
  sources: ('utahCorps' | 'bizBuySell' | 'bizQuest')[];
  state?: string;
  industry?: string;
  maxPages?: number;
}

export interface DiscoveryResult {
  totalFound: number;
  newLeads: number;
  duplicatesSkipped: number;
  failedToScore: number;
  scored: number;
  summary: {
    source: string;
    found: number;
    new: number;
    duplicates: number;
    failed: number;
    scored: number;
  }[];
}

interface ScrapedLead {
  businessName: string;
  askingPrice?: number;
  revenue?: number;
  cashFlow?: number;
  description?: string;
  location?: string;
  industry?: string;
  listingUrl?: string;
  source: string;
}

// Fuzzy match for deduplication
function normalizeForDedupe(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDuplicate(newLead: ScrapedLead, existingLeads: ScrapedLead[]): boolean {
  const newNormName = normalizeForDedupe(newLead.businessName);
  const newNormLoc = normalizeForDedupe(newLead.location || '');

  return existingLeads.some((existing) => {
    const existingNormName = normalizeForDedupe(existing.businessName);
    const existingNormLoc = normalizeForDedupe(existing.location || '');

    // Match on normalized name + location
    return newNormName === existingNormName && newNormLoc === existingNormLoc;
  });
}

async function scrapeUtahCorps(): Promise<ScrapedLead[]> {
  // Mock implementation - in production, this would actually scrape
  const mockListings = [
    {
      businessName: 'Utah Tech Solutions Inc',
      revenue: 500000,
      askingPrice: 750000,
      description: 'Software development and IT consulting',
      location: 'Salt Lake City, UT',
      industry: 'Software/IT',
      listingUrl: 'https://example.com',
      source: 'utahCorps',
    },
    {
      businessName: 'Rocky Mountain HVAC',
      revenue: 400000,
      askingPrice: 600000,
      description: 'HVAC installation and maintenance',
      location: 'Provo, UT',
      industry: 'HVAC',
      listingUrl: 'https://example.com',
      source: 'utahCorps',
    },
  ];

  return mockListings;
}

export async function discoverLeads(
  userId: string,
  options: DiscoveryOptions
): Promise<DiscoveryResult> {
  const result: DiscoveryResult = {
    totalFound: 0,
    newLeads: 0,
    duplicatesSkipped: 0,
    failedToScore: 0,
    scored: 0,
    summary: [],
  };

  const state = options.state || 'utah';
  const maxPages = options.maxPages || 3;
  const allScrapedLeads: ScrapedLead[] = [];

  // Run scrapers in parallel
  const scraperPromises: Promise<ScrapedLead[]>[] = [];

  if (options.sources.includes('utahCorps')) {
    scraperPromises.push(
      scrapeUtahCorps().then((listings) =>
        listings.map((l) => ({ ...l, source: 'utahCorps' }))
      )
    );
  }

  if (options.sources.includes('bizBuySell')) {
    scraperPromises.push(
      scrapeBizBuySell(state, maxPages).then((listings) =>
        listings.map((l) => ({
          ...l,
          source: 'bizBuySell',
          businessName: l.businessName || 'Unknown',
        }))
      )
    );
  }

  if (options.sources.includes('bizQuest')) {
    scraperPromises.push(
      scrapeBizQuest(state, maxPages).then((listings) =>
        listings.map((l) => ({
          ...l,
          source: 'bizQuest',
          businessName: l.businessName || 'Unknown',
        }))
      )
    );
  }

  // Execute all scrapers
  const scraperResults = await Promise.allSettled(scraperPromises);

  const summaryMap = new Map<string, { found: number; new: number; duplicates: number; failed: number; scored: number }>();

  for (let i = 0; i < scraperResults.length; i++) {
    const scraperResult = scraperResults[i];
    const sourceIndex = i;
    let sourceName = '';

    if (options.sources[sourceIndex] === 'utahCorps') sourceName = 'Utah Corps';
    else if (options.sources[sourceIndex] === 'bizBuySell') sourceName = 'BizBuySell';
    else if (options.sources[sourceIndex] === 'bizQuest') sourceName = 'BizQuest';

    summaryMap.set(sourceName, { found: 0, new: 0, duplicates: 0, failed: 0, scored: 0 });

    if (scraperResult.status === 'fulfilled') {
      const listings = scraperResult.value;
      result.totalFound += listings.length;
      summaryMap.get(sourceName)!.found = listings.length;

      for (const listing of listings) {
        // Check for duplicates within this batch
        if (!isDuplicate(listing, allScrapedLeads)) {
          allScrapedLeads.push(listing);
        } else {
          result.duplicatesSkipped++;
          summaryMap.get(sourceName)!.duplicates++;
        }
      }
    } else {
      console.error(`Scraper failed for ${sourceName}:`, scraperResult.reason);
    }
  }

  // Deduplicate with existing leads in DB
  const existingLeads = await db.select().from(leadsTable).where(eq(leadsTable.userId, userId));
  const dbLeadNormalizations = existingLeads.map((l) => ({
    businessName: normalizeForDedupe(l.title),
    location: normalizeForDedupe(l.location || ''),
  }));

  const leadsToProcess: ScrapedLead[] = [];

  for (const scrapedLead of allScrapedLeads) {
    const normName = normalizeForDedupe(scrapedLead.businessName);
    const normLoc = normalizeForDedupe(scrapedLead.location || '');

    const isDuplicateInDB = dbLeadNormalizations.some(
      (dbLead) => dbLead.businessName === normName && dbLead.location === normLoc
    );

    if (!isDuplicateInDB) {
      leadsToProcess.push(scrapedLead);
      summaryMap.get(scrapedLead.source === 'utahCorps' ? 'Utah Corps' : scrapedLead.source === 'bizBuySell' ? 'BizBuySell' : 'BizQuest')!.new++;
    } else {
      result.duplicatesSkipped++;
    }
  }

  result.newLeads = leadsToProcess.length;

  // Score and save new leads
  for (const scrapedLead of leadsToProcess) {
    try {
      // Score the lead
      let scoreResult: LeadScoreResult = { score: 0, reasoning: '' };

      try {
        scoreResult = await scoreLead({
          businessName: scrapedLead.businessName,
          industry: scrapedLead.industry,
          location: scrapedLead.location,
          revenue: scrapedLead.revenue,
        });
      } catch (scoreError) {
        console.error(`Failed to score ${scrapedLead.businessName}:`, scoreError);
        result.failedToScore++;
        const sourceName =
          scrapedLead.source === 'utahCorps' ? 'Utah Corps' : scrapedLead.source === 'bizBuySell' ? 'BizBuySell' : 'BizQuest';
        summaryMap.get(sourceName)!.failed++;
        continue;
      }

      // Create lead in database
      const lead = await createLead(userId, {
        title: scrapedLead.businessName,
        description: scrapedLead.description,
        industry: scrapedLead.industry,
        location: scrapedLead.location,
        source: scrapedLead.source,
        revenue: scrapedLead.revenue,
        askingPrice: scrapedLead.askingPrice,
        profit: scrapedLead.cashFlow,
        website: scrapedLead.listingUrl,
      });

      // Update with score
      await updateLead(lead.id, { score: scoreResult.score });

      result.scored++;
      const sourceName =
        scrapedLead.source === 'utahCorps' ? 'Utah Corps' : scrapedLead.source === 'bizBuySell' ? 'BizBuySell' : 'BizQuest';
      summaryMap.get(sourceName)!.scored++;
    } catch (error) {
      console.error(`Failed to process lead ${scrapedLead.businessName}:`, error);
      result.failedToScore++;
      const sourceName =
        scrapedLead.source === 'utahCorps' ? 'Utah Corps' : scrapedLead.source === 'bizBuySell' ? 'BizBuySell' : 'BizQuest';
      summaryMap.get(sourceName)!.failed++;
    }
  }

  // Build summary
  result.summary = Array.from(summaryMap.entries()).map(([source, stats]) => ({
    source,
    ...stats,
  }));

  return result;
}
