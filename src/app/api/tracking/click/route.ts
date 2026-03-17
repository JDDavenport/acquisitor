import { trackLinkClick } from '@/app/actions/outreach';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const url = request.nextUrl.searchParams.get('url');

    if (!id || !url) {
      return NextResponse.json(
        { error: 'Missing id or url parameter' },
        { status: 400 }
      );
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);

    // Track the click in background
    trackLinkClick(id, decodedUrl).catch(console.error);

    // Redirect to the original URL
    return NextResponse.redirect(decodedUrl);
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: 'Tracking failed' },
      { status: 500 }
    );
  }
}
