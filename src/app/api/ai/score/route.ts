import { scoreLead } from '@/app/actions/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await scoreLead({
      businessName: body.businessName,
      industry: body.industry,
      location: body.location,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      ownerPhone: body.ownerPhone,
      revenue: body.revenue,
      employees: body.employees,
      yearFounded: body.yearFounded,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to score lead' },
      { status: 500 }
    );
  }
}
