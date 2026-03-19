"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId }),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Subscribe to SSE events
  useEffect(() => {
    fetchNotifications();

    const eventSource = new EventSource("/api/events");

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_activity" || data.type === "email_opened" || data.type === "lead_discovered") {
          // Refresh notifications
          fetchNotifications();
        }
      } catch (error) {
        // Heartbeat message (just a comment), ignore
      }
    };

    eventSource.addEventListener("message", handleMessage);

    return () => {
      eventSource.close();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-navy-300 hover:text-white hover:bg-navy-800 relative group"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-navy-950 animate-pulse">
            {Math.min(unreadCount, 9)}
            {unreadCount > 9 && "+"}
          </div>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 border-navy-700/50 bg-navy-800/95 backdrop-blur-xl shadow-xl z-50 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-navy-700/50">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-navy-400 hover:text-white hover:bg-navy-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-navy-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-navy-400 text-sm">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-navy-700/50 transition-colors border-b border-navy-700/30 last:border-b-0",
                      !notif.read && "bg-navy-700/30"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn("text-xl flex-shrink-0", notif.color)}>
                        {notif.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {notif.title}
                        </p>
                        {notif.leadName && (
                          <p className="text-xs text-navy-300 mt-0.5">
                            {notif.leadName}
                            {notif.leadScore && ` • Score: ${notif.leadScore}`}
                          </p>
                        )}
                        {notif.description && (
                          <p className="text-xs text-navy-400 mt-1 truncate">
                            {notif.description}
                          </p>
                        )}
                        <p className="text-xs text-navy-500 mt-1">
                          {formatTime(new Date(notif.timestamp))}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-gold-500 rounded-full mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function formatTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
