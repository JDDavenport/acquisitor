'use server';

import { scoreLead } from './ai';
import { createLead } from './leads';

export interface UtahCorporation {
  name: string;
  yearFounded?: number;
  location?: string;
  industry?: string;
}

export async function scrapeUtahCorps(userId: string, limit: number = 10) {
  // Simplified Utah corps scraper
  // In a production environment, you would scrape from:
  // https://search.le.utah.gov/search/
  // Or use the Utah Division of Corporations API

  // For now, return mock data that represents what would be scraped
  const mockCorps: UtahCorporation[] = [
    {
      name: 'Utah HVAC Solutions LLC',
      yearFounded: 2009,
      location: 'Salt Lake City, UT',
      industry: 'HVAC Services',
    },
    {
      name: 'Rocky Mountain Plumbing Inc',
      yearFounded: 2008,
      location: 'Provo, UT',
      industry: 'Plumbing Services',
    },
    {
      name: 'Beehive Electrical Services LLC',
      yearFounded: 2007,
      location: 'Ogden, UT',
      industry: 'Electrical Services',
    },
    {
      name: 'Utah Pest Control LLC',
      yearFounded: 2010,
      location: 'Lehi, UT',
      industry: 'Pest Control',
    },
    {
      name: 'Wasatch Landscaping Inc',
      yearFounded: 2006,
      location: 'Salt Lake City, UT',
      industry: 'Landscaping Services',
    },
  ];

  const results = [];

  for (const corp of mockCorps.slice(0, limit)) {
    try {
      // Score the lead with AI
      const scoreResult = await scoreLead({
        businessName: corp.name,
        industry: corp.industry,
        location: corp.location,
        yearFounded: corp.yearFounded,
      });

      // Create the lead if score is decent
      if (scoreResult.score >= 50) {
        const lead = await createLead(userId, {
          title: corp.name,
          industry: corp.industry,
          location: corp.location,
          source: 'utah_scraper',
          yearFounded: corp.yearFounded,
        });

        // Update the score
        const { updateLead } = await import('./leads');
        await updateLead(lead.id, { score: scoreResult.score });

        results.push({
          name: corp.name,
          score: scoreResult.score,
          reasoning: scoreResult.reasoning,
          leadId: lead.id,
        });
      }
    } catch (error) {
      console.error(`Failed to process ${corp.name}:`, error);
    }
  }

  return {
    count: results.length,
    results,
  };
}
