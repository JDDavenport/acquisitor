'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Radar,
  Mail,
  MessageSquare,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import {
  getAutomationSettings,
  getAutomationLogs,
  toggleAutomation,
  runDiscoverAutomation,
  runOutreachAutomation,
  runCheckRepliesAutomation,
  getReplyQueue,
  updateReplyQueueItem,
} from '@/app/actions/automation';

const automationTypes = [
  {
    id: 'discover',
    name: 'Lead Discovery',
    description: 'Scrape BizBuySell & BizQuest for new acquisition leads',
    icon: Radar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'outreach',
    name: 'Email Outreach',
    description: 'Send personalized emails to new, uncontacted leads',
    icon: Mail,
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/10',
  },
  {
    id: 'check-replies',
    name: 'Reply Monitoring',
    description: 'Check for email replies and generate AI draft responses',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
];

function formatTime(date: Date | string | null) {
  if (!date) return 'Never';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
  return <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />;
}

export default function AutomationPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [replyItems, setReplyItems] = useState<any[]>([]);
  const [runningType, setRunningType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return;
      try {
        const [s, l, r] = await Promise.all([
          getAutomationSettings(session.user.id),
          getAutomationLogs(session.user.id),
          getReplyQueue(session.user.id),
        ]);
        setSettings(s);
        setLogs(l);
        setReplyItems(r);
      } catch (e) {
        console.error('Failed to load automation data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session?.user?.id]);

  const handleToggle = async (type: string, enabled: boolean) => {
    if (!session?.user?.id) return;
    await toggleAutomation(session.user.id, type, enabled);
    setSettings((prev) => ({
      ...prev,
      [type]: { ...prev[type], enabled },
    }));
  };

  const handleManualRun = async (type: string) => {
    if (!session?.user?.id) return;
    setRunningType(type);
    try {
      let result;
      if (type === 'discover') result = await runDiscoverAutomation(session.user.id);
      else if (type === 'outreach') result = await runOutreachAutomation(session.user.id);
      else result = await runCheckRepliesAutomation(session.user.id);

      // Refresh logs
      const newLogs = await getAutomationLogs(session.user.id);
      setLogs(newLogs);
      const newSettings = await getAutomationSettings(session.user.id);
      setSettings(newSettings);
    } catch (e) {
      console.error(`Failed to run ${type}:`, e);
    } finally {
      setRunningType(null);
    }
  };

  const handleReplyAction = async (id: string, action: 'approved' | 'dismissed') => {
    await updateReplyQueueItem(id, action);
    setReplyItems((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-gold-400" />
          Automation Engine
        </h1>
        <p className="text-navy-300 mt-1">
          Configure and monitor automated lead discovery, outreach, and reply handling
        </p>
      </div>

      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {automationTypes.map((auto) => {
          const setting = settings[auto.id] || {};
          return (
            <Card key={auto.id} className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${auto.bgColor}`}>
                    <auto.icon className={`w-5 h-5 ${auto.color}`} />
                  </div>
                  <Switch
                    checked={setting.enabled || false}
                    onCheckedChange={(checked) => handleToggle(auto.id, checked)}
                  />
                </div>
                <CardTitle className="text-white text-lg mt-3">{auto.name}</CardTitle>
                <p className="text-sm text-navy-400">{auto.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-400">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      setting.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-navy-600/30 text-navy-300 border-navy-600/30'
                    }
                  >
                    {setting.enabled ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-400">Last Run</span>
                  <span className="text-navy-200">{formatTime(setting.lastRunAt)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent mt-2"
                  onClick={() => handleManualRun(auto.id)}
                  disabled={runningType !== null}
                >
                  {runningType === auto.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-2" />
                      Run Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reply Queue */}
      {replyItems.length > 0 && (
        <Card className="border-gold-500/30 bg-navy-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-400" />
              Reply Queue ({replyItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {replyItems.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-navy-700/30 border border-navy-700/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.originalSubject}</p>
                    <p className="text-xs text-navy-400 mt-1">Received {formatTime(item.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="bg-gold-500/10 text-gold-400 border-gold-500/20">
                    Pending Review
                  </Badge>
                </div>
                <div className="p-3 rounded bg-navy-800/50 text-sm text-navy-200 whitespace-pre-wrap">
                  {item.draftResponse || 'No AI draft generated yet.'}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold"
                    onClick={() => handleReplyAction(item.id, 'approved')}
                  >
                    Send
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-navy-600 text-navy-200 hover:bg-navy-700 bg-transparent"
                    onClick={() => handleReplyAction(item.id, 'dismissed')}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-navy-400">
              <p>No automation activity yet. Run an automation to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-700/30 transition-colors"
                >
                  <StatusIcon status={log.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-navy-700/50 text-navy-300 border-navy-600/30 text-xs"
                      >
                        {log.type}
                      </Badge>
                      {log.itemsProcessed > 0 && (
                        <span className="text-xs text-gold-400 font-medium">
                          {log.itemsProcessed} items
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-navy-200 mt-1">{log.message}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-navy-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {formatTime(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
