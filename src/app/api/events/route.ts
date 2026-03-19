import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, leads } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Store active SSE connections per user
const userConnections = new Map<string, Set<ReadableStreamDefaultController<string>>>();

// Simulated event queue (in production, use a message queue like Redis)
const eventQueue = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Client is subscribing to SSE
    const userId = session.user.id;
    
    // Initialize event queue for this user if needed
    if (!eventQueue.has(userId)) {
      eventQueue.set(userId, []);
    }

    // Create SSE stream
    const stream = new ReadableStream<string>({
      async start(controller) {
        // Add this controller to active connections
        if (!userConnections.has(userId)) {
          userConnections.set(userId, new Set());
        }
        userConnections.get(userId)?.add(controller);

        // Send initial connection message
        controller.enqueue(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

        // Send any queued events
        const queue = eventQueue.get(userId) || [];
        for (const event of queue) {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        }
        eventQueue.set(userId, []); // Clear queue after sending

        // Send heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(`:${new Date().toISOString()}\n\n`);
          } catch (error) {
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // Cleanup on disconnect
        return () => {
          clearInterval(heartbeatInterval);
          userConnections.get(userId)?.delete(controller);
          if (userConnections.get(userId)?.size === 0) {
            userConnections.delete(userId);
          }
        };
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    return NextResponse.json({ error: 'Failed to establish SSE connection' }, { status: 500 });
  }
}

// Helper function to broadcast events to all connected clients of a user
export function broadcastEvent(userId: string, event: any) {
  const connections = userConnections.get(userId);
  
  if (!connections || connections.size === 0) {
    // Queue event if no active connections
    if (!eventQueue.has(userId)) {
      eventQueue.set(userId, []);
    }
    eventQueue.get(userId)?.push({
      ...event,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const message = `data: ${JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  })}\n\n`;

  for (const controller of connections) {
    try {
      controller.enqueue(message);
    } catch (error) {
      console.error('Failed to send SSE message:', error);
      connections.delete(controller);
    }
  }
}

// GET endpoint to fetch recent events (for dashboard load)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch recent activities
    const recentActivities = await db
      .select({
        id: activities.id,
        type: activities.type,
        title: activities.title,
        leadId: activities.leadId,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(10);

    // Fetch recent leads
    const recentLeads = await db
      .select({
        id: leads.id,
        title: leads.title,
        score: leads.score,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt))
      .limit(5);

    return NextResponse.json({
      activities: recentActivities.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        leadId: a.leadId,
        time: a.createdAt,
      })),
      leads: recentLeads.map((l) => ({
        id: l.id,
        title: l.title,
        score: l.score,
        time: l.createdAt,
      })),
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
