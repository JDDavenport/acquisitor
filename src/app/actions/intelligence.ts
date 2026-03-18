'use server';

import { db } from '@/lib/db';
import { deals, leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface PortfolioStats {
  totalPipelineValue: number;
  dealCount: number;
  averageDealSize: number;
  stageDistribution: Record<string, number>;
  topIndustries: Array<{ industry: string; count: number; value: number }>;
  byStage: Record<string, { count: number; value: number }>;
}

export async function getPortfolioStats(userId: string): Promise<PortfolioStats> {
  // Get all deals for the user
  const userDeals = await db
    .select({
      dealId: deals.id,
      dealTitle: deals.title,
      dealValue: deals.value,
      dealStage: deals.stage,
      leadId: deals.leadId,
    })
    .from(deals)
    .where(eq(deals.userId, userId));

  if (!userDeals.length) {
    return {
      totalPipelineValue: 0,
      dealCount: 0,
      averageDealSize: 0,
      stageDistribution: {},
      topIndustries: [],
      byStage: {},
    };
  }

  // Get lead info for industries
  const leadIds = userDeals.map(d => d.leadId).filter(Boolean);
  let leadsByIndustry: Record<string, any> = {};

  if (leadIds.length > 0) {
    const leadsData = await db
      .select()
      .from(leads)
      .where(sql`${leads.id} = ANY(${sql.raw(`ARRAY[${leadIds.map(id => `'${id}'`).join(',')}]`)})`)
      .catch(() => []);

    for (const lead of leadsData) {
      leadsByIndustry[lead.id] = lead;
    }
  }

  // Calculate stats
  const totalValue = userDeals.reduce((sum, d) => sum + (parseFloat(d.dealValue as string) || 0), 0);
  const stageDistribution: Record<string, number> = {};
  const byStage: Record<string, { count: number; value: number }> = {};
  const industryMap: Record<string, { count: number; value: number }> = {};

  for (const deal of userDeals) {
    // Stage distribution
    stageDistribution[deal.dealStage] = (stageDistribution[deal.dealStage] || 0) + 1;

    // By stage with values
    if (!byStage[deal.dealStage]) {
      byStage[deal.dealStage] = { count: 0, value: 0 };
    }
    byStage[deal.dealStage].count += 1;
    byStage[deal.dealStage].value += parseFloat(deal.dealValue as string) || 0;

    // Industry mapping
    const lead = deal.leadId ? leadsByIndustry[deal.leadId] : undefined;
    const industry = lead?.industry || 'Unknown';
    if (!industryMap[industry]) {
      industryMap[industry] = { count: 0, value: 0 };
    }
    industryMap[industry].count += 1;
    industryMap[industry].value += parseFloat(deal.dealValue as string) || 0;
  }

  // Top industries
  const topIndustries = Object.entries(industryMap)
    .map(([industry, data]) => ({
      industry,
      count: data.count,
      value: data.value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    totalPipelineValue: totalValue,
    dealCount: userDeals.length,
    averageDealSize: totalValue / userDeals.length,
    stageDistribution,
    topIndustries,
    byStage,
  };
}

export async function generateMarketBrief(userId: string): Promise<string> {
  try {
    // Get portfolio stats to inform the brief
    const stats = await getPortfolioStats(userId);

    // Get user's deals and leads for context
    const userDeals = await db.select().from(deals).where(eq(deals.userId, userId)).limit(10);

    const leadIds = userDeals.map(d => d.leadId).filter(Boolean);
    let leadsContext = '';

    if (leadIds.length > 0) {
      try {
        const leadsData = await db
          .select()
          .from(leads)
          .where(sql`${leads.id} = ANY(${sql.raw(`ARRAY[${leadIds.map(id => `'${id}'`).join(',')}]`)})`)
          .catch(() => []);

        const industries = leadsData
          .map(l => l.industry)
          .filter((i): i is string => i !== null && i !== undefined)
          .reduce((acc: Record<string, number>, ind: string) => {
            acc[ind] = (acc[ind] || 0) + 1;
            return acc;
          }, {});

        const locations = leadsData
          .map(l => l.location)
          .filter((l): l is string => l !== null && l !== undefined)
          .reduce((acc: Record<string, number>, loc: string) => {
            acc[loc] = (acc[loc] || 0) + 1;
            return acc;
          }, {});

        leadsContext = `Portfolio focus: ${Object.entries(industries)
          .map(([ind, count]) => `${ind} (${count})`)
          .join(', ')}. Locations: ${Object.keys(locations).join(', ')}`;
      } catch (e) {
        leadsContext = 'Portfolio analysis available';
      }
    }

    // Call OpenAI to generate brief
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a market analyst providing brief, actionable market intelligence for an M&A platform. Keep analysis to 150-200 words, focus on trends and opportunities.',
          },
          {
            role: 'user',
            content: `Generate a market brief for this acquisitor portfolio: ${leadsContext}. Total pipeline: $${stats.totalPipelineValue.toLocaleString()}. Focus on industry trends, M&A activity, and valuation insights.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      return 'Unable to generate market brief at this time. Check your OpenAI API configuration.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate brief';
  } catch (error) {
    console.error('Error generating market brief:', error);
    return 'Unable to generate market brief. Please try again later.';
  }
}
