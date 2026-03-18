import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Plus,
  Mail,
  Trash2,
  Edit,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTemplates } from "@/app/actions/templates";
import TemplatesClient from "./templates-client";

export default async function TemplatesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const templates = await getTemplates(userId);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Email Templates</h1>
          <p className="text-navy-300 mt-1">Create and manage email templates for outreach</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm text-navy-300">Total Templates</p>
            <p className="text-2xl font-bold font-data text-white">{templates.length}</p>
          </CardContent>
        </Card>
        <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm text-navy-300">By Category</p>
            <p className="text-2xl font-bold font-data text-gold-400">{new Set(templates.map(t => t.category)).size}</p>
          </CardContent>
        </Card>
        <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm text-navy-300">Recent</p>
            <p className="text-2xl font-bold font-data text-emerald-400">{templates.slice(0, 5).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Component for CRUD */}
      <TemplatesClient initialTemplates={templates} userId={userId} />
    </div>
  );
}
