"use client";

import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Building2,
  User,
  Filter,
  Search,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const stages = [
  { id: "sourcing", name: "Sourcing", color: "bg-blue-500", dotColor: "bg-blue-400", borderColor: "border-blue-500/30" },
  { id: "screening", name: "Screening", color: "bg-gold-500", dotColor: "bg-gold-400", borderColor: "border-gold-500/30" },
  { id: "loi", name: "LOI", color: "bg-purple-500", dotColor: "bg-purple-400", borderColor: "border-purple-500/30" },
  { id: "due_diligence", name: "Due Diligence", color: "bg-orange-500", dotColor: "bg-orange-400", borderColor: "border-orange-500/30" },
  { id: "closing", name: "Closing", color: "bg-emerald-500", dotColor: "bg-emerald-400", borderColor: "border-emerald-500/30" },
];

const mockDeals = [
  { id: "1", title: "TechStart Inc", contact: "John Smith", value: 2500000, probability: 75, stage: "screening", expectedClose: "2026-04-15", industry: "Technology" },
  { id: "2", title: "Growth Labs", contact: "Sarah Johnson", value: 1800000, probability: 60, stage: "screening", expectedClose: "2026-05-01", industry: "Marketing" },
  { id: "3", title: "DataFlow Systems", contact: "Michael Chen", value: 4200000, probability: 40, stage: "sourcing", expectedClose: "2026-06-30", industry: "Software" },
  { id: "4", title: "Retail Plus", contact: "Emily Davis", value: 3100000, probability: 85, stage: "loi", expectedClose: "2026-03-30", industry: "Retail" },
  { id: "5", title: "BuildRight Construction", contact: "David Wilson", value: 5500000, probability: 95, stage: "closing", expectedClose: "2026-04-10", industry: "Construction" },
  { id: "6", title: "HealthFirst Clinics", contact: "Lisa Anderson", value: 6200000, probability: 70, stage: "due_diligence", expectedClose: "2026-04-30", industry: "Healthcare" },
  { id: "7", title: "FoodCraft Restaurants", contact: "Robert Taylor", value: 1200000, probability: 30, stage: "sourcing", expectedClose: "2026-07-15", industry: "Food & Beverage" },
  { id: "8", title: "CloudNine SaaS", contact: "Anna Park", value: 3800000, probability: 55, stage: "screening", expectedClose: "2026-05-20", industry: "Software" },
  { id: "9", title: "Metro Logistics", contact: "James Rivera", value: 2900000, probability: 65, stage: "loi", expectedClose: "2026-04-25", industry: "Logistics" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getProbColor(p: number) {
  if (p >= 80) return "text-emerald-400";
  if (p >= 50) return "text-gold-400";
  return "text-red-400";
}

function DealCard({ deal, stage }: { deal: typeof mockDeals[0]; stage: typeof stages[0] }) {
  return (
    <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm cursor-grab hover:bg-navy-700/50 hover:border-navy-600/50 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-1.5 h-8 rounded-full", stage.color)} />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-navy-400 hover:text-white hover:bg-navy-700">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-navy-800 border-navy-700">
              <DropdownMenuItem className="text-navy-100 focus:bg-navy-700">View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-navy-100 focus:bg-navy-700">Edit Deal</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-navy-700" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h4 className="font-semibold text-white mb-1 text-sm">{deal.title}</h4>
        <p className="text-xs text-navy-400 mb-3">{deal.industry}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="w-3.5 h-3.5 text-navy-500" />
              <span className="font-semibold text-white font-data">{formatCurrency(deal.value)}</span>
            </div>
            <span className={cn("text-xs font-medium", getProbColor(deal.probability))}>{deal.probability}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-navy-400">
            <User className="w-3 h-3" />{deal.contact}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-navy-400">
            <Calendar className="w-3 h-3" />Close: {formatDate(deal.expectedClose)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineColumn({ stage, deals }: { stage: typeof stages[0]; deals: typeof mockDeals }) {
  const columnDeals = deals.filter((d) => d.stage === stage.id);
  const totalValue = columnDeals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", stage.dotColor)} />
          <span className="font-semibold text-white text-sm">{stage.name}</span>
          <Badge variant="secondary" className="bg-navy-700/50 text-navy-300 text-xs font-medium">{columnDeals.length}</Badge>
        </div>
        <span className="text-xs text-navy-400 font-data">{formatCurrency(totalValue)}</span>
      </div>

      <Button variant="outline" size="sm" className="mb-3 border-dashed border-navy-700/50 text-navy-400 hover:bg-navy-700/30 hover:text-white bg-transparent justify-start">
        <Plus className="w-3.5 h-3.5 mr-1.5" />Add Deal
      </Button>

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px]">
        {columnDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} stage={stage} />
        ))}
      </div>
    </div>
  );
}

export default function DemoPipelinePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");

  const filteredDeals = mockDeals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) || deal.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalWeightedValue = filteredDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="space-y-6 h-full animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Pipeline</h1>
          <p className="text-navy-300 mt-1">Track your acquisition deals through each stage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-navy-400">Weighted Pipeline</p>
            <p className="text-xl font-bold text-gold-400 font-data">{formatCurrency(totalWeightedValue)}</p>
          </div>
          <Button className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Deals", value: filteredDeals.length, color: "text-white" },
          { label: "Total Value", value: formatCurrency(filteredDeals.reduce((s, d) => s + d.value, 0)), color: "text-blue-400" },
          { label: "Avg Probability", value: `${Math.round(filteredDeals.length > 0 ? filteredDeals.reduce((s, d) => s + d.probability, 0) / filteredDeals.length : 0)}%`, color: "text-emerald-400" },
          { label: "Closing Soon", value: filteredDeals.filter((d) => { const c = new Date(d.expectedClose); const n = new Date(); return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear(); }).length, color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-navy-300">{s.label}</p>
              <p className={`text-2xl font-bold font-data ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <Input placeholder="Search deals..." className="pl-10 bg-navy-800/50 border-navy-700/50 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterStage} onValueChange={(v) => setFilterStage(v || "all")}>
          <SelectTrigger className="w-full sm:w-[180px] bg-navy-800/50 border-navy-700/50 text-navy-200">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="bg-navy-800 border-navy-700">
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-5 min-w-max">
          {stages.map((stage) => (
            <PipelineColumn key={stage.id} stage={stage} deals={filteredDeals} />
          ))}
        </div>
      </div>
    </div>
  );
}
