'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Search } from 'lucide-react';
import { discoverLeads } from '@/app/actions/discovery';

const STATES = [
  { code: 'utah', name: 'Utah' },
  { code: 'texas', name: 'Texas' },
  { code: 'california', name: 'California' },
  { code: 'colorado', name: 'Colorado' },
  { code: 'arizona', name: 'Arizona' },
  { code: 'florida', name: 'Florida' },
];

const INDUSTRIES = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'Pest Control',
  'Landscaping',
  'Software/IT',
  'Professional Services',
  'Healthcare',
  'Real Estate',
  'All Industries',
];

const SOURCES = [
  { id: 'utahCorps', name: 'Utah Corps Registry', icon: '🏢' },
  { id: 'bizBuySell', name: 'BizBuySell', icon: '💼' },
  { id: 'bizQuest', name: 'BizQuest', icon: '🎯' },
];

type SourceId = 'utahCorps' | 'bizBuySell' | 'bizQuest';

export default function DiscoverPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedSources, setSelectedSources] = useState<SourceId[]>(['utahCorps', 'bizBuySell', 'bizQuest']);
  const [selectedState, setSelectedState] = useState('utah');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<string | null>(null);

  const toggleSource = (sourceId: SourceId) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId) ? prev.filter((s) => s !== sourceId) : [...prev, sourceId]
    );
  };

  const handleDiscover = async () => {
    if (!session?.user?.id) {
      setError('Please log in to discover leads');
      return;
    }

    if (selectedSources.length === 0) {
      setError('Please select at least one source');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const discoveryResult = await discoverLeads(session.user.id, {
        sources: selectedSources,
        state: selectedState,
        industry: selectedIndustry !== 'All Industries' ? selectedIndustry : undefined,
        maxPages: 3,
      });

      setResult(discoveryResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Discovery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Discover Leads</h1>
        <p className="text-navy-300">Find and auto-score business leads from multiple sources</p>
      </div>

      {/* Discovery Controls */}
      <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gold-500">Search Configuration</CardTitle>
          <CardDescription>Choose your sources and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SOURCES.map((source) => (
                <div
                  key={source.id}
                  onClick={() => toggleSource(source.id as SourceId)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSources.includes(source.id as SourceId)
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-navy-700/50 bg-navy-800/30 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedSources.includes(source.id as SourceId)}
                      onCheckedChange={() => toggleSource(source.id as SourceId)}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{source.icon} {source.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">State/Region</label>
              <Select value={selectedState} onValueChange={(val) => {
                if (val) setSelectedState(val);
              }} disabled={isLoading}>
                <SelectTrigger className="bg-navy-800/50 border-navy-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-900 border-navy-700/50">
                  {STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">Industry Filter</label>
              <Select value={selectedIndustry} onValueChange={(val) => {
                if (val) setSelectedIndustry(val);
              }} disabled={isLoading}>
                <SelectTrigger className="bg-navy-800/50 border-navy-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-navy-900 border-navy-700/50">
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleDiscover}
            disabled={isLoading || selectedSources.length === 0}
            className="w-full h-11 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-navy-950 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering Leads...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Discover Leads
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className="border-gold-500/50 bg-gradient-to-br from-gold-500/10 to-navy-900/50">
            <CardHeader>
              <CardTitle className="text-gold-500">Discovery Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-navy-800/50">
                  <p className="text-sm text-navy-300">Total Found</p>
                  <p className="text-3xl font-bold text-gold-400">{result.totalFound}</p>
                </div>
                <div className="p-4 rounded-lg bg-navy-800/50">
                  <p className="text-sm text-navy-300">New Leads</p>
                  <p className="text-3xl font-bold text-green-400">{result.newLeads}</p>
                </div>
                <div className="p-4 rounded-lg bg-navy-800/50">
                  <p className="text-sm text-navy-300">Duplicates</p>
                  <p className="text-3xl font-bold text-yellow-400">{result.duplicatesSkipped}</p>
                </div>
                <div className="p-4 rounded-lg bg-navy-800/50">
                  <p className="text-sm text-navy-300">Scored</p>
                  <p className="text-3xl font-bold text-blue-400">{result.scored}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Breakdown */}
          <Card className="border-navy-700/50 bg-navy-900/50">
            <CardHeader>
              <CardTitle className="text-gold-500">Source Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.summary.map((summary: any) => (
                  <div key={summary.source} className="p-4 rounded-lg bg-navy-800/50 border border-navy-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{summary.source}</h4>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-400">{summary.scored} scored</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-navy-400">Found:</span>
                        <span className="ml-2 text-white font-medium">{summary.found}</span>
                      </div>
                      <div>
                        <span className="text-navy-400">New:</span>
                        <span className="ml-2 text-white font-medium">{summary.new}</span>
                      </div>
                      <div>
                        <span className="text-navy-400">Duplicates:</span>
                        <span className="ml-2 text-white font-medium">{summary.duplicates}</span>
                      </div>
                      <div>
                        <span className="text-navy-400">Failed:</span>
                        <span className="ml-2 text-white font-medium">{summary.failed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/dashboard/leads')}
              className="flex-1 h-11 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-navy-950 font-semibold"
            >
              View All Leads
            </Button>
            <Button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              variant="outline"
              className="flex-1 h-11 border-navy-700/50 text-gold-400 hover:bg-navy-800/50"
            >
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
