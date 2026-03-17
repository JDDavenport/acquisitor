import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { scrapeUtahCorps } from '@/app/actions/scraper';

// Simple rate limiting: store last request time per user
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(userId) || 0;

  if (now - lastRequest < RATE_LIMIT_WINDOW) {
    return false;
  }

  rateLimitMap.set(userId, now);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Rate limited. Please wait 1 minute before scraping again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const limit = Math.min(body.limit || 10, 50); // Cap at 50

    const result = await scrapeUtahCorps(session.user.id, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scraper error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape leads' },
      { status: 500 }
    );
  }
}
