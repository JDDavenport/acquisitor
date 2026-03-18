'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getDealDetails, initializeChecklist, toggleChecklistItem, addChecklistItem, addDocument, deleteDocument, deleteChecklistItem } from '@/app/actions/diligence';
import { useSession } from '@/lib/auth-client';

interface DealDetailsState {
  deal: any;
  lead: any;
  activities: any[];
  documents: any[];
  checklist: any[];
}

const stageColors: Record<string, string> = {
  sourcing: 'bg-blue-500',
  screening: 'bg-gold-500',
  loi: 'bg-purple-500',
  diligence: 'bg-orange-500',
  closing: 'bg-emerald-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
};

const checklistCategories = ['Financial', 'Legal', 'Operations', 'HR'];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const dealId = params.id as string;

  const [details, setDetails] = useState<DealDetailsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [newChecklistItem, setNewChecklistItem] = useState<{ category: string; item: string }>({ category: 'Financial', item: '' });
  const [newDocument, setNewDocument] = useState<{ name: string; category: string; fileUrl: string }>({ name: '', category: '', fileUrl: '' });

  useEffect(() => {
    const loadDealDetails = async () => {
      try {
        const data = await getDealDetails(dealId);
        setDetails(data);
      } catch (error) {
        console.error('Failed to load deal details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDealDetails();
  }, [dealId]);

  const handleInitializeChecklist = async () => {
    if (!session?.data?.user?.id) return;

    try {
      await initializeChecklist(dealId, session.data.user.id);
      // Reload details
      const data = await getDealDetails(dealId);
      setDetails(data);
    } catch (error) {
      console.error('Failed to initialize checklist:', error);
    }
  };

  const handleToggleChecklistItem = async (id: string, completed: boolean) => {
    try {
      await toggleChecklistItem(id, !completed);
      if (details) {
        const updated = details.checklist.map(item =>
          item.id === id ? { ...item, completed: !completed } : item
        );
        setDetails({ ...details, checklist: updated });
      }
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!session?.data?.user?.id || !newChecklistItem.item) return;

    try {
      const result = await addChecklistItem(dealId, newChecklistItem.category, newChecklistItem.item, session.data.user.id);
      if (details) {
        setDetails({
          ...details,
          checklist: [
            ...details.checklist,
            {
              id: result.id,
              dealId,
              category: newChecklistItem.category,
              item: newChecklistItem.item,
              completed: false,
              assignedTo: session.data.user.id,
            },
          ],
        });
      }
      setNewChecklistItem({ category: 'Financial', item: '' });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleAddDocument = async () => {
    if (!session?.data?.user?.id || !newDocument.name || !newDocument.fileUrl) return;

    try {
      const result = await addDocument(dealId, session.data.user.id, {
        name: newDocument.name,
        category: newDocument.category,
        fileUrl: newDocument.fileUrl,
      });
      if (details) {
        setDetails({
          ...details,
          documents: [
            ...details.documents,
            {
              id: result.id,
              dealId,
              name: newDocument.name,
              category: newDocument.category,
              fileUrl: newDocument.fileUrl,
              uploadedBy: session.data.user.id,
              createdAt: new Date(),
            },
          ],
        });
      }
      setNewDocument({ name: '', category: '', fileUrl: '' });
    } catch (error) {
      console.error('Failed to add document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      if (details) {
        setDetails({
          ...details,
          documents: details.documents.filter(d => d.id !== id),
        });
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleDeleteChecklistItem = async (id: string) => {
    try {
      await deleteChecklistItem(id);
      if (details) {
        setDetails({
          ...details,
          checklist: details.checklist.filter(c => c.id !== id),
        });
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-navy-400">Loading deal details...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-navy-400">Deal not found</div>
      </div>
    );
  }

  const { deal, lead, activities, documents, checklist } = details;
  const checklistByCategory = checklistCategories.reduce((acc: any, cat) => {
    acc[cat] = checklist.filter((c: any) => c.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-navy-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
          {lead && <p className="text-navy-400 mt-1">{lead.title} • {lead.industry}</p>}
        </div>
        <Badge className={cn('text-white', stageColors[deal.stage] || 'bg-navy-700')}>
          {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-navy-700/50 bg-navy-800/30">
          <CardContent className="p-4">
            <p className="text-navy-400 text-sm">Deal Value</p>
            <p className="text-2xl font-bold text-gold-400">${parseFloat(deal.value).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-navy-700/50 bg-navy-800/30">
          <CardContent className="p-4">
            <p className="text-navy-400 text-sm">Probability</p>
            <p className="text-2xl font-bold text-white">{deal.probability}%</p>
          </CardContent>
        </Card>
        <Card className="border-navy-700/50 bg-navy-800/30">
          <CardContent className="p-4">
            <p className="text-navy-400 text-sm">Expected Close</p>
            <p className="text-lg font-bold text-white">
              {deal.expectedCloseDate
                ? new Date(deal.expectedCloseDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-navy-700/50 bg-navy-800/30">
          <CardContent className="p-4">
            <p className="text-navy-400 text-sm">Documents</p>
            <p className="text-2xl font-bold text-white">{documents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-navy-800/50 border-b border-navy-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="diligence">Diligence</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-navy-700/50">
            <CardHeader>
              <CardTitle className="text-white">Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-navy-400 text-sm">Title</label>
                  <p className="text-white font-medium">{deal.title}</p>
                </div>
                <div>
                  <label className="text-navy-400 text-sm">Value</label>
                  <p className="text-white font-medium">${parseFloat(deal.value).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-navy-400 text-sm">Stage</label>
                  <p className="text-white font-medium">{deal.stage}</p>
                </div>
                <div>
                  <label className="text-navy-400 text-sm">Probability</label>
                  <p className="text-white font-medium">{deal.probability}%</p>
                </div>
                <div>
                  <label className="text-navy-400 text-sm">Expected Close Date</label>
                  <p className="text-white font-medium">
                    {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-navy-400 text-sm">Lead</label>
                  <p className="text-white font-medium">{lead?.title || 'N/A'}</p>
                </div>
              </div>
              {deal.notes && (
                <div>
                  <label className="text-navy-400 text-sm">Notes</label>
                  <p className="text-white">{deal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="border-navy-700/50">
            <CardHeader>
              <CardTitle className="text-white">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-navy-400">No activities yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 pb-3 border-b border-navy-700/30">
                      <div className="text-navy-400 text-sm min-w-max">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-navy-400 text-sm mt-1">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diligence Tab */}
        <TabsContent value="diligence" className="space-y-6">
          {/* Documents Section */}
          <Card className="border-navy-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Documents</CardTitle>
                <Button variant="outline" size="sm" className="border-gold-500 text-gold-400 hover:bg-gold-500/10">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Document Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-navy-800/30 rounded-lg border border-navy-700/30">
                <Input
                  placeholder="Document name"
                  className="bg-navy-700/50 border-navy-600 text-white"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                />
                <Select value={newDocument.category || ''} onValueChange={(val: string | null) => setNewDocument({ ...newDocument, category: val ?? '' })}>
                  <SelectTrigger className="bg-navy-700/50 border-navy-600 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Document URL"
                    className="bg-navy-700/50 border-navy-600 text-white"
                    value={newDocument.fileUrl}
                    onChange={(e) => setNewDocument({ ...newDocument, fileUrl: e.target.value })}
                  />
                  <Button
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-600 text-navy-950"
                    onClick={handleAddDocument}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Documents List */}
              {documents.length === 0 ? (
                <p className="text-navy-400">No documents uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-navy-800/30 rounded-lg border border-navy-700/30"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Download className="w-4 h-4 text-gold-400" />
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-navy-400 text-sm">{doc.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist Section */}
          <Card className="border-navy-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Due Diligence Checklist</CardTitle>
                {checklist.length === 0 && (
                  <Button
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-600 text-navy-950"
                    onClick={handleInitializeChecklist}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Initialize from Template
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {checklistCategories.map((category) => (
                <div key={category}>
                  <h4 className="font-semibold text-white mb-3">{category}</h4>
                  <div className="space-y-2">
                    {checklistByCategory[category].map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-navy-800/30 group"
                      >
                        <button
                          onClick={() => handleToggleChecklistItem(item.id, item.completed)}
                          className="flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-gold-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-navy-500" />
                          )}
                        </button>
                        <span className={cn('flex-1 text-sm', item.completed ? 'text-navy-500 line-through' : 'text-white')}>
                          {item.item}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Custom Checklist Item */}
              <div className="pt-4 border-t border-navy-700/30 space-y-3">
                <h4 className="font-semibold text-white text-sm">Add Custom Item</h4>
                <div className="flex gap-2">
                  <Select value={newChecklistItem.category || ''} onValueChange={(val: string | null) => setNewChecklistItem({ ...newChecklistItem, category: val ?? 'Financial' })}>
                    <SelectTrigger className="w-32 bg-navy-700/50 border-navy-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {checklistCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="New item"
                    className="bg-navy-700/50 border-navy-600 text-white flex-1"
                    value={newChecklistItem.item}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, item: e.target.value })}
                  />
                  <Button
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-600 text-navy-950"
                    onClick={handleAddChecklistItem}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card className="border-navy-700/50">
            <CardHeader>
              <CardTitle className="text-white">Deal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this deal..."
                className="bg-navy-700/50 border-navy-600 text-white min-h-48"
                defaultValue={deal.notes || ''}
                readOnly
              />
              <Button className="mt-4 bg-gold-500 hover:bg-gold-600 text-navy-950" disabled>
                Save Notes (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
