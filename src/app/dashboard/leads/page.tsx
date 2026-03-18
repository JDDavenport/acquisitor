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
  Upload,
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
import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { getLeads, deleteLead, importLeadsCSV } from "@/app/actions/leads";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contacted: { label: "Contacted", className: "bg-gold-500/10 text-gold-400 border-gold-500/20" },
  evaluating: { label: "Evaluating", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  offer: { label: "Offer", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  diligence: { label: "Diligence", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  closed: { label: "Closed", className: "bg-navy-600/30 text-navy-300 border-navy-600/30" },
  archived: { label: "Archived", className: "bg-navy-600/30 text-navy-300 border-navy-600/30" },
};

function getScoreStyle(score: number) {
  if (score >= 90) return "text-emerald-400 bg-emerald-500/10";
  if (score >= 70) return "text-gold-400 bg-gold-500/10";
  return "text-red-400 bg-red-500/10";
}

export default function LeadsPage() {
  const session = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    async function loadLeads() {
      if (session?.data?.user?.id) {
        try {
          const allLeads = await getLeads(session.data.user.id);
          setLeads(allLeads);
        } catch (error) {
          console.error("Failed to load leads:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadLeads();
  }, [session?.data?.user?.id]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (lead.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (leadId: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(leadId);
        setLeads(leads.filter((l) => l.id !== leadId));
      } catch (error) {
        console.error("Failed to delete lead:", error);
      }
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast("Error", { description: "Please upload a CSV file", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importLeadsCSV(session?.data?.user?.id || "", text);
      
      // Reload leads
      const updatedLeads = await getLeads(session?.data?.user?.id || "");
      setLeads(updatedLeads);

      toast("Success", { description: `Imported ${result.count} lead${result.count !== 1 ? 's' : ''} successfully` });
    } catch (error) {
      console.error("Failed to import CSV:", error);
      toast("Error", { description: error instanceof Error ? error.message : "Failed to import CSV", variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const stats = [
    { label: "Total Leads", value: leads.length, color: "text-white" },
    { label: "Qualified", value: leads.filter((l) => l.status !== "new" && l.status !== "archived").length, color: "text-emerald-400" },
    { label: "In Progress", value: leads.filter((l) => ["contacted", "evaluating", "offer", "diligence"].includes(l.status)).length, color: "text-gold-400" },
    { label: "Avg Score", value: leads.length > 0 ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length) : 0, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hidden file input for CSV import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVImport}
        accept=".csv"
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Leads</h1>
          <p className="text-navy-300 mt-1">Manage and track your acquisition prospects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="border-navy-700 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? "Importing..." : "Import CSV"}
          </Button>
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
        {stats.map((s) => (
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
            <SelectItem value="evaluating">Evaluating</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="diligence">Diligence</SelectItem>
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
                <TableHead className="text-navy-300">Contact</TableHead>
                <TableHead className="text-navy-300">Score</TableHead>
                <TableHead className="text-navy-300">Status</TableHead>
                <TableHead className="text-navy-300">Industry</TableHead>
                <TableHead className="text-navy-300">Location</TableHead>
                <TableHead className="text-navy-300 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-navy-400">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-navy-400">
                    No leads found. {leads.length === 0 ? "Start by adding a lead." : "Try adjusting your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="group border-navy-700/30 hover:bg-navy-700/20">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{lead.title}</p>
                        <p className="text-sm text-navy-400">{lead.contactName || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.contactEmail && <p className="text-sm text-navy-200">{lead.contactEmail}</p>}
                        {lead.contactPhone && <p className="text-xs text-navy-400">{lead.contactPhone}</p>}
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
                      <Badge variant="outline" className={statusConfig[lead.status]?.className || statusConfig.new.className}>
                        {statusConfig[lead.status]?.label || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-navy-200">{lead.industry || "N/A"}</TableCell>
                    <TableCell className="text-navy-200">{lead.location || "N/A"}</TableCell>
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
                          <DropdownMenuItem 
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={() => handleDelete(lead.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
