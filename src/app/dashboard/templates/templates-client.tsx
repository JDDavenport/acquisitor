"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  MoreHorizontal,
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { createTemplate, updateTemplate, deleteTemplate } from "@/app/actions/templates";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const categoryColors: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-400",
  outreach: "bg-gold-500/10 text-gold-400",
  followup: "bg-purple-500/10 text-purple-400",
  negotiation: "bg-orange-500/10 text-orange-400",
  closing: "bg-emerald-500/10 text-emerald-400",
};

export default function TemplatesClient({ initialTemplates, userId }: { initialTemplates: Template[]; userId: string }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "general",
  });

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (template?: Template) => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category || "general",
      });
      setEditingId(template.id);
    } else {
      setFormData({
        name: "",
        subject: "",
        body: "",
        category: "general",
      });
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      category: "general",
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      toast("Error", { description: "All fields are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await updateTemplate(editingId, userId, formData);
        setTemplates(
          templates.map((t) =>
            t.id === editingId
              ? { ...t, ...formData, updatedAt: new Date() }
              : t
          )
        );
        toast("Success", { description: "Template updated successfully" });
      } else {
        const newTemplate = await createTemplate(userId, formData);
        const templateWithDates: Template = {
          ...newTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTemplates([...templates, templateWithDates]);
        toast("Success", { description: "Template created successfully" });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast("Error", { description: "Failed to save template", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setIsLoading(true);
    try {
      await deleteTemplate(id, userId);
      setTemplates(templates.filter((t) => t.id !== id));
      toast("Success", { description: "Template deleted successfully" });
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast("Error", { description: "Failed to delete template", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Filters and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <Input
            placeholder="Search templates by name or subject..."
            className="pl-10 bg-navy-800/50 border-navy-700/50 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Table */}
      <Card className="border-navy-700/50 bg-navy-800/30 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-navy-700/50 hover:bg-transparent">
                <TableHead className="text-navy-300 w-[250px]">Name</TableHead>
                <TableHead className="text-navy-300">Subject</TableHead>
                <TableHead className="text-navy-300 w-[100px]">Category</TableHead>
                <TableHead className="text-navy-300 w-[100px]">Created</TableHead>
                <TableHead className="text-navy-300 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-navy-400">
                    {templates.length === 0
                      ? "No templates yet. Create one to get started."
                      : "No templates match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id} className="group border-navy-700/30 hover:bg-navy-700/20">
                    <TableCell>
                      <p className="font-medium text-white">{template.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-navy-200 truncate max-w-xs">{template.subject}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${categoryColors[template.category || "general"] || categoryColors.general} border-0 text-xs`}
                      >
                        {template.category || "general"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-navy-400">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-navy-300 hover:text-white hover:bg-navy-700"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-navy-800 border-navy-700">
                          <DropdownMenuLabel className="text-navy-300">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-navy-700" />
                          <DropdownMenuItem
                            className="text-navy-100 focus:bg-navy-700 focus:text-white cursor-pointer"
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-navy-700" />
                          <DropdownMenuItem
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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

      {/* Create/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription className="text-navy-300">
              {editingId
                ? "Update your email template"
                : "Create a new email template for outreach campaigns"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-navy-200 block mb-1">
                Template Name
              </label>
              <Input
                placeholder="e.g., Initial Outreach"
                className="bg-navy-700/50 border-navy-600 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-navy-200 block mb-1">
                Category
              </label>
              <select
                className="w-full bg-navy-700/50 border border-navy-600 text-white rounded-md px-3 py-2 focus:border-gold-500/50 focus:ring-gold-500/20"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="outreach">Outreach</option>
                <option value="followup">Follow-up</option>
                <option value="negotiation">Negotiation</option>
                <option value="closing">Closing</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-navy-200 block mb-1">
                Subject Line
              </label>
              <Input
                placeholder="e.g., Acquisition Opportunity - {{company}}"
                className="bg-navy-700/50 border-navy-600 text-white placeholder:text-navy-400 focus:border-gold-500/50 focus:ring-gold-500/20"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-navy-200 block mb-1">
                Email Body
              </label>
              <textarea
                placeholder="Write your email template here... Use {{variable}} for dynamic content"
                className="w-full h-64 bg-navy-700/50 border border-navy-600 text-white placeholder:text-navy-400 rounded-md px-3 py-2 focus:border-gold-500/50 focus:ring-gold-500/20 font-mono text-sm resize-none"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
              <p className="text-xs text-navy-400 mt-2">
                💡 Tip: Use {"{name}"}, {"{company}"}, {"{revenue}"}, {"{deal_value}"} for dynamic variables
              </p>

              {/* Preview */}
              {formData.body && (
                <div className="mt-4 p-4 rounded-lg bg-navy-900/50 border border-navy-700/30">
                  <p className="text-xs font-semibold text-navy-400 mb-2 uppercase tracking-wider">Preview</p>
                  <p className="text-sm text-gold-400 mb-1 font-medium">
                    {formData.subject
                      .replace(/\{\{name\}\}/g, 'John Smith')
                      .replace(/\{\{company\}\}/g, 'Acme Corp')
                      .replace(/\{\{revenue\}\}/g, '$500,000')
                      .replace(/\{\{deal_value\}\}/g, '$750,000')}
                  </p>
                  <p className="text-sm text-navy-200 whitespace-pre-wrap">
                    {formData.body
                      .replace(/\{\{name\}\}/g, 'John Smith')
                      .replace(/\{\{company\}\}/g, 'Acme Corp')
                      .replace(/\{\{revenue\}\}/g, '$500,000')
                      .replace(/\{\{deal_value\}\}/g, '$750,000')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="border-navy-600 text-navy-200 hover:bg-navy-700 hover:text-white bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : editingId ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
