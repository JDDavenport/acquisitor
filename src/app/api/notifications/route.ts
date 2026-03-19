import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities, leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// In-memory notification state (in production, use a database)
const notificationRead = new Map<string, Set<string>>();

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'document';
  title: string;
  description?: string | null;
  leadId?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description?: string;
  leadId?: string;
  leadName?: string;
  leadScore?: number | null;
  icon: string;
  color: string;
  timestamp: Date;
  read: boolean;
}

function getNotificationDetails(activity: Activity, leadName?: string, leadScore?: number | null) {
  const baseNotification = {
    id: activity.id,
    title: activity.title,
    description: activity.description || undefined,
    leadId: activity.leadId || undefined,
    leadName,
    leadScore,
    timestamp: activity.createdAt,
    read: false,
  };

  switch (activity.type) {
    case 'email':
      return {
        ...baseNotification,
        type: 'email_sent',
        icon: '✉️',
        color: 'text-blue-400 bg-blue-500/10',
      };
    case 'call':
      return {
        ...baseNotification,
        type: 'call_logged',
        icon: '📞',
        color: 'text-emerald-400 bg-emerald-500/10',
      };
    case 'meeting':
      return {
        ...baseNotification,
        type: 'meeting_scheduled',
        icon: '📅',
        color: 'text-purple-400 bg-purple-500/10',
      };
    case 'note':
      return {
        ...baseNotification,
        type: 'note_added',
        icon: '📝',
        color: 'text-gold-400 bg-gold-500/10',
      };
    case 'task':
      return {
        ...baseNotification,
        type: 'task_created',
        icon: '✓',
        color: 'text-indigo-400 bg-indigo-500/10',
      };
    case 'document':
      return {
        ...baseNotification,
        type: 'document_uploaded',
        icon: '📄',
        color: 'text-red-400 bg-red-500/10',
      };
    default:
      return {
        ...baseNotification,
        type: 'activity',
        icon: '•',
        color: 'text-navy-400 bg-navy-500/10',
      };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const limit = request.nextUrl.searchParams.get('limit') || '20';

    // Fetch recent activities
    const recentActivities = await db
      .select({
        id: activities.id,
        type: activities.type,
        title: activities.title,
        description: activities.description,
        leadId: activities.leadId,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(parseInt(limit));

    // Fetch lead details for each activity
    const notifications: Notification[] = [];
    const readSet = notificationRead.get(userId) || new Set();

    for (const activity of recentActivities) {
      let leadData: { title: string; score: number | null } | undefined;

      if (activity.leadId) {
        const leadResult = await db
          .select({ title: leads.title, score: leads.score })
          .from(leads)
          .where(eq(leads.id, activity.leadId))
          .limit(1);
        leadData = leadResult[0];
      }

      const notification = getNotificationDetails(
        activity as Activity,
        leadData?.title,
        leadData?.score
      );

      notifications.push({
        ...notification,
        read: readSet.has(activity.id),
      } as Notification);
    }

    // Calculate unread count
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    if (!notificationRead.has(userId)) {
      notificationRead.set(userId, new Set());
    }

    const userRead = notificationRead.get(userId)!;

    if (body.action === 'mark_read') {
      // Mark specific notification as read
      if (body.notificationId) {
        userRead.add(body.notificationId);
      }
    } else if (body.action === 'mark_all_read') {
      // Mark all as read
      const allNotifications = await db
        .select({ id: activities.id })
        .from(activities)
        .where(eq(activities.userId, userId))
        .limit(100);

      for (const notif of allNotifications) {
        userRead.add(notif.id);
      }
    }

    notificationRead.set(userId, userRead);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
