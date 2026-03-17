'use server';

import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface LeadScoreInput {
  businessName: string;
  industry?: string;
  location?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  revenue?: number;
  employees?: number;
  yearFounded?: number;
}

export interface LeadScoreResult {
  score: number;
  reasoning: string;
}

export async function scoreLead(lead: LeadScoreInput): Promise<LeadScoreResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const businessAge = lead.yearFounded ? new Date().getFullYear() - lead.yearFounded : undefined;

  const prompt = `You are an expert business acquisition analyst. Score this lead for acquisition attractiveness on a scale of 0-100.

Lead Information:
- Business Name: ${lead.businessName}
- Industry: ${lead.industry || 'Unknown'}
- Location: ${lead.location || 'Unknown'}
- Owner Name: ${lead.ownerName || 'Unknown'}
- Contact Email: ${lead.ownerEmail || 'Not provided'}
- Contact Phone: ${lead.ownerPhone || 'Not provided'}
- Annual Revenue: ${lead.revenue ? `$${lead.revenue.toLocaleString()}` : 'Unknown'}
- Employees: ${lead.employees || 'Unknown'}
- Business Age: ${businessAge ? `${businessAge} years` : 'Unknown'}

Scoring Criteria (consider these factors):
1. Industry Attractiveness (0-25 points):
   - Favorable industries: HVAC, plumbing, electrical, pest control, landscaping, professional services, B2B services
   - Avoid: Restaurants, retail, highly seasonal businesses, trendy/fad businesses
   - Recession-resistant, essential services score higher

2. Location Desirability (0-25 points):
   - Growing markets, affluent areas, business-friendly states score higher
   - Consider population trends, economic growth, competition density
   - Utah, Texas, Florida, Arizona are generally favorable

3. Business Maturity Signals (0-25 points):
   - Established businesses (10+ years) with stable history score higher
   - Strong revenue and employee count indicate stability
   - Avoid: Very new businesses, highly volatile sectors

4. Contact Completeness (0-25 points):
   - Complete contact info (name + email + phone) = full points
   - Partial contact info = reduced points
   - Missing owner name or contact methods reduces score significantly

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation highlighting key positive and negative factors>"
}

Be critical but fair. A good lead should score 70+. Average leads 50-69. Poor fits below 50.`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a business acquisition scoring engine. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)```/) || 
                      content.match(/```\n?([\s\S]*?)```/) ||
                      [null, content];
    const jsonString = jsonMatch[1]?.trim() || content.trim();
    
    const result = JSON.parse(jsonString) as LeadScoreResult;
    
    // Validate the result
    if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
      throw new Error('Invalid score returned from OpenAI');
    }
    
    if (!result.reasoning || typeof result.reasoning !== 'string') {
      result.reasoning = 'Score generated based on lead analysis.';
    }
    
    return {
      score: Math.round(result.score),
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Failed to parse scoring result from OpenAI');
  }
}
