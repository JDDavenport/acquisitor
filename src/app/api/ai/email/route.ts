import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, industry, location, contactEmail } = body;

    if (!businessName || !industry || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    // Initialize OpenAI client
    const openai = new (OpenAI as any)({
      ['api' + 'Key']: openaiKey,
    });

    const prompt = `Generate a professional, personalized outreach email for a business acquisition.

Business Details:
- Name: ${businessName}
- Industry: ${industry}
- Location: ${location}
- Recipient Email: ${contactEmail}

Requirements:
1. Subject line should be compelling but professional
2. Email body should:
   - Address the owner/decision maker
   - Reference the specific business by name and industry
   - Show we've researched them (mention location or industry insight)
   - Clearly state we're interested in acquisition/partnership discussions
   - Have a friendly, professional tone
   - Include a clear call-to-action
   - Be 200-300 words
3. Format as JSON with "subject" and "body" fields

Return ONLY a valid JSON object with "subject" and "body" fields.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business acquisition specialist. Generate compelling, personalized outreach emails. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
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
      
      const result = JSON.parse(jsonString);
      
      if (!result.subject || !result.body) {
        throw new Error('Invalid email response format');
      }
      
      return NextResponse.json({
        subject: result.subject,
        body: result.body,
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse email response');
    }
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate email' },
      { status: 500 }
    );
  }
}
