"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Star,
  Building2,
  ArrowUpDown,
  Download,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const mockLeads = [
  { id: "1", name: "Michael Chen", company: "DataFlow Systems", email: "michael@dataflow.io", phone: "+1 (555) 456-7890", score: 95, status: "new", industry: "Software", revenue: "$4.2M", location: "Austin, TX", lastContact: "1 day ago" },
  { id: "2", name: "John Smith", company: "TechStart Inc", email: "john@techstart.com", phone: "+1 (555) 123-4567", score: 92, status: "qualified", industry: "Technology", revenue: "$2.5M", location: "San Francisco, CA", lastContact: "2 days ago" },
  { id: "3", name: "Lisa Anderson", company: "HealthFirst Clinics", email: "lisa@healthfirst.com", phone: "+1 (555) 345-6789", score: 88, status: "qualified", industry: "Healthcare", revenue: "$6.2M", location: "Miami, FL", lastContact: "3 days ago" },
  { id: "4", name: "Sarah Johnson", company: "Growth Labs", email: "sarah@growthlabs.com", phone: "+1 (555) 987-6543", score: 87, status: "contacted", industry: "Marketing", revenue: "$1.8M", location: "New York, NY", lastContact: "5 days ago" },
  { id: "5", name: "Emily Davis", company: "Retail Plus", email: "emily@retailplus.com", phone: "+1 (555) 234-5678", score: 72, status: "proposal", industry: "Retail", revenue: "$3.1M", location: "Chicago, IL", lastContact: "1 week ago" },
  { id: "6", name: "David Wilson", company: "BuildRight Construction", email: "david@buildright.com", phone: "+1 (555) 876-5432", score: 65, status: "closed", industry: "Construction", revenue: "$5.5M", location: "Denver, CO", lastContact: "2 weeks ago" },
  { id: "7", name: "Robert Taylor", company: "FoodCraft Restaurants", email: "robert@foodcraft.com", phone: "+1 (555) 567-8901", score: 58, status: "new", industry: "Food & Beverage", revenue: "$1.2M", location: "Seattle, WA", lastContact: "Just now" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contacted: { label: "Contacted", className: "bg-gold-500/10 text-gold-400 border-gold-500/20" },
  qualified: { label: "Qualified", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  proposal: { label: "Proposal", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  closed: { label: "Closed", className: "bg-navy-600/30 text-navy-300 border-navy-600/30" },
};

function getScoreStyle(score: number) {
  if (score >= 90) return "text-emerald-400 bg-emerald-500/10";
  if (score >= 70) return "text-gold-400 bg-gold-500/10";
  return "text-red-400 bg-red-500/10";
}

export default function DemoLeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Leads</h1>
          <p className="text-navy-300 mt-1">Manage and track your acquisition prospects</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: mockLeads.length, color: "text-white" },
          { label: "Qualified", value: mockLeads.filter((l) => l.status === "qualified").length, color: "text-emerald-400" },
          { label: "In Progress", value: mockLeads.filter((l) => ["contacted", "proposal"].includes(l.status)).length, color: "text-gold-400" },
          { label: "Avg Score", value: Math.round(mockLeads.reduce((a, l) => a + l.score, 0) / mockLeads.length), color: "text-blue-400" },
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
          <Input
            placeholder="Search leads by name, company, or email..."
            className="pl-10 bg-navy-800/50 border-navy-700/50 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
          <SelectTrigger className="w-full sm:w-[180px] bg-navy-800/50 border-navy-700/50 text-navy-200">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-navy-800 border-navy-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-navy-700/50 bg-navy-800/30 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-navy-700/50 hover:bg-transparent">
                <TableHead className="text-navy-300 w-[250px]">
                  <div className="flex items-center gap-1 cursor-pointer">Name <ArrowUpDown className="w-3 h-3" /></div>
                </TableHead>
                <TableHead className="text-navy-300">Company</TableHead>
                <TableHead className="text-navy-300">Score</TableHead>
                <TableHead className="text-navy-300">Status</TableHead>
                <TableHead className="text-navy-300">Industry</TableHead>
                <TableHead className="text-navy-300">Revenue</TableHead>
                <TableHead className="text-navy-300">Last Contact</TableHead>
                <TableHead className="text-navy-300 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="group border-navy-700/30 hover:bg-navy-700/20">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-sm text-navy-400">{lead.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-navy-500" />
                      <span className="text-navy-200">{lead.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreStyle(lead.score)}`}>
                        {lead.score}
                      </div>
                      {lead.score >= 90 && <Star className="w-4 h-4 text-gold-400 fill-gold-400" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[lead.status].className}>
                      {statusConfig[lead.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-navy-200">{lead.industry}</TableCell>
                  <TableCell className="font-medium text-white font-data">{lead.revenue}</TableCell>
                  <TableCell className="text-navy-400">{lead.lastContact}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-navy-300 hover:text-white hover:bg-navy-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-navy-800 border-navy-700">
                        <DropdownMenuLabel className="text-navy-300">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-navy-700" />
                        <DropdownMenuItem className="text-navy-100 focus:bg-navy-700 focus:text-white"><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-navy-100 focus:bg-navy-700 focus:text-white"><Edit className="w-4 h-4 mr-2" />Edit Lead</DropdownMenuItem>
                        <DropdownMenuItem className="text-navy-100 focus:bg-navy-700 focus:text-white"><Mail className="w-4 h-4 mr-2" />Send Email</DropdownMenuItem>
                        <DropdownMenuItem className="text-navy-100 focus:bg-navy-700 focus:text-white"><Phone className="w-4 h-4 mr-2" />Call</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-navy-700" />
                        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
