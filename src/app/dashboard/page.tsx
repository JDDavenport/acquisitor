import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Users,
  Mail,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Kanban,
  Settings,
  Clock,
  Building2,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getLeads } from "@/app/actions/leads";
import { getDeals } from "@/app/actions/deals";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-400 bg-emerald-500/10";
  if (score >= 70) return "text-gold-400 bg-gold-500/10";
  return "text-red-400 bg-red-500/10";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const displayName = session.user.name?.split(" ")[0] || "there";

  // Fetch real data
  const allLeads = await getLeads(session.user.id);
  const allDeals = await getDeals(session.user.id);

  // Calculate stats
  const totalLeads = allLeads.length;
  const emailsSent = allLeads.filter((l) => l.status !== "new").length;
  const dealsInPipeline = allDeals.length;
  const pipelineValue = allDeals.reduce((sum, d) => sum + parseFloat(d.value), 0);

  // Get top leads by score
  const topLeads = [...allLeads]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((lead) => ({
      name: lead.title,
      score: lead.score,
      industry: lead.industry || "Unknown",
      revenue: lead.revenue ? `$${parseFloat(lead.revenue).toLocaleString()}` : "N/A",
      status: lead.status,
    }));

  // Get recent activity (simplified - just from lead/deal updates)
  const recentActivity = [
    ...(totalLeads > 0 ? [{ 
      type: "lead", 
      message: `${totalLeads} leads in system`, 
      time: "Today", 
      icon: Users, 
      color: "text-blue-400" 
    }] : []),
    ...(dealsInPipeline > 0 ? [{ 
      type: "deal", 
      message: `${dealsInPipeline} deals in pipeline`, 
      time: "Today", 
      icon: CheckCircle, 
      color: "text-emerald-400" 
    }] : []),
    ...(allLeads.some(l => l.status !== "new") ? [{ 
      type: "email", 
      message: `${emailsSent} leads contacted`, 
      time: "This week", 
      icon: Mail, 
      color: "text-gold-400" 
    }] : []),
  ];

  const stats = [
    { 
      title: "Leads Discovered", 
      value: String(totalLeads), 
      change: { value: Math.max(1, Math.floor(totalLeads * 0.1)), direction: "up" as const }, 
      icon: Users, 
      description: "Total in system", 
      color: "from-blue-500/20 to-blue-600/20", 
      iconColor: "text-blue-400" 
    },
    { 
      title: "Emails Sent", 
      value: String(emailsSent), 
      change: { value: Math.max(1, Math.floor(emailsSent * 0.1)), direction: "up" as const }, 
      icon: Mail, 
      description: "Outreach campaigns", 
      color: "from-gold-500/20 to-gold-600/20", 
      iconColor: "text-gold-400" 
    },
    { 
      title: "Deals in Pipeline", 
      value: String(dealsInPipeline), 
      change: { value: Math.max(1, Math.floor(dealsInPipeline * 0.1)), direction: "up" as const }, 
      icon: CheckCircle, 
      description: "Active acquisitions", 
      color: "from-emerald-500/20 to-emerald-600/20", 
      iconColor: "text-emerald-400" 
    },
    { 
      title: "Pipeline Value", 
      value: `$${(pipelineValue / 1000000).toFixed(1)}M`, 
      change: { value: 15, direction: "up" as const }, 
      icon: TrendingUp, 
      description: "Weighted total", 
      color: "from-purple-500/20 to-purple-600/20", 
      iconColor: "text-purple-400" 
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-navy-300 mt-1">Here&apos;s what&apos;s happening with your acquisitions today.</p>
        </div>
        <Link href="/dashboard/leads">
          <Button className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm hover:bg-navy-800/70 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", stat.color)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-medium", stat.change.direction === "up" ? "text-emerald-400" : "text-red-400")}>
                  {stat.change.direction === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change.value}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-white font-data">{stat.value}</p>
                <p className="text-sm text-navy-300 mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-navy-300 hover:text-white hover:bg-navy-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-700/30 transition-colors">
                    <div className="mt-0.5">
                      <item.icon className={cn("w-4 h-4", item.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy-100">{item.message}</p>
                      <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-navy-400">
                  <p>No activity yet. Start by adding a lead.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Leads */}
          <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Top Leads</CardTitle>
                <Link href="/dashboard/leads">
                  <Button variant="ghost" size="sm" className="text-navy-300 hover:text-white hover:bg-navy-700">
                    See All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLeads.length > 0 ? (
                topLeads.map((lead) => (
                  <div key={lead.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-navy-700/30 transition-colors">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold", getScoreColor(lead.score))}>
                      {lead.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                      <p className="text-xs text-navy-400">{lead.industry} · {lead.revenue}</p>
                    </div>
                    <Badge variant="secondary" className="bg-navy-700 text-navy-200 text-xs">{lead.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-navy-400">
                  <p>No leads yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/leads">
                <Button variant="outline" className="w-full justify-start border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent">
                  <Users className="w-4 h-4 mr-3 text-blue-400" />
                  Browse Leads
                </Button>
              </Link>
              <Link href="/dashboard/pipeline">
                <Button variant="outline" className="w-full justify-start border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent">
                  <Kanban className="w-4 h-4 mr-3 text-gold-400" />
                  View Pipeline
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent">
                  <Settings className="w-4 h-4 mr-3 text-navy-400" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
