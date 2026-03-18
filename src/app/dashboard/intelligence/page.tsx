'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/lib/auth-client';
import { getPortfolioStats, generateMarketBrief } from '@/app/actions/intelligence';
import { Sparkles, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

const INDUSTRY_MULTIPLES = [
  { industry: 'HVAC', revenueMultiple: 0.8, ebitdaMultiple: 4.5 },
  { industry: 'Plumbing', revenueMultiple: 0.9, ebitdaMultiple: 5.0 },
  { industry: 'Electrical', revenueMultiple: 0.85, ebitdaMultiple: 4.8 },
  { industry: 'Software', revenueMultiple: 3.5, ebitdaMultiple: 12.0 },
  { industry: 'Restaurant', revenueMultiple: 0.5, ebitdaMultiple: 3.0 },
  { industry: 'Fitness', revenueMultiple: 2.0, ebitdaMultiple: 6.5 },
  { industry: 'Staffing', revenueMultiple: 0.4, ebitdaMultiple: 4.0 },
  { industry: 'Marketing Agency', revenueMultiple: 1.5, ebitdaMultiple: 6.0 },
  { industry: 'Manufacturing', revenueMultiple: 0.6, ebitdaMultiple: 4.0 },
  { industry: 'Real Estate', revenueMultiple: 1.2, ebitdaMultiple: 5.5 },
];

interface PortfolioStats {
  totalPipelineValue: number;
  dealCount: number;
  averageDealSize: number;
  stageDistribution: Record<string, number>;
  topIndustries: Array<{ industry: string; count: number; value: number }>;
  byStage: Record<string, { count: number; value: number }>;
}

const stageColors: Record<string, string> = {
  sourcing: '#3b82f6',
  screening: '#fbbf24',
  loi: '#a855f7',
  diligence: '#f97316',
  closing: '#10b981',
  won: '#22c55e',
  lost: '#ef4444',
};

export default function IntelligencePage() {
  const session = useSession();
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [marketBrief, setMarketBrief] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [valuationInputs, setValuationInputs] = useState({
    revenue: '',
    ebitda: '',
    industry: 'Software',
  });
  const [valuationResult, setValuationResult] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!session?.data?.user?.id) return;

      try {
        const stats = await getPortfolioStats(session.data.user.id);
        setPortfolioStats(stats);
      } catch (error) {
        console.error('Failed to load portfolio stats:', error);
      }
    };

    loadStats();
  }, [session?.data?.user?.id]);

  const handleGenerateMarketBrief = async () => {
    if (!session?.data?.user?.id) return;

    setBriefLoading(true);
    try {
      const brief = await generateMarketBrief(session.data.user.id);
      setMarketBrief(brief);
    } catch (error) {
      console.error('Failed to generate market brief:', error);
      setMarketBrief('Unable to generate brief. Please try again later.');
    } finally {
      setBriefLoading(false);
    }
  };

  const handleCalculateValuation = () => {
    const revenue = parseFloat(valuationInputs.revenue) || 0;
    const ebitda = parseFloat(valuationInputs.ebitda) || 0;

    if (revenue === 0 && ebitda === 0) {
      setValuationResult(null);
      return;
    }

    const selectedMultiple = INDUSTRY_MULTIPLES.find((m) => m.industry === valuationInputs.industry);
    if (!selectedMultiple) return;

    // Calculate valuations using both revenue and EBITDA multiples
    const revenueValuation = revenue * selectedMultiple.revenueMultiple;
    const ebitdaValuation = ebitda * selectedMultiple.ebitdaMultiple;

    // Use average of both if available, otherwise use whichever is available
    let min, max;
    if (revenue > 0 && ebitda > 0) {
      const avg = (revenueValuation + ebitdaValuation) / 2;
      min = avg * 0.85;
      max = avg * 1.15;
    } else if (revenue > 0) {
      min = revenueValuation * 0.85;
      max = revenueValuation * 1.15;
    } else {
      min = ebitdaValuation * 0.85;
      max = ebitdaValuation * 1.15;
    }

    setValuationResult({ min, max });
  };

  const stageChartData = portfolioStats
    ? Object.entries(portfolioStats.byStage).map(([stage, data]) => ({
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        value: data.value,
        count: data.count,
        fill: stageColors[stage] || '#6b7280',
      }))
    : [];

  const industryChartData = portfolioStats ? portfolioStats.topIndustries : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Market Intelligence</h1>
        <p className="text-navy-400 mt-1">Valuation insights and portfolio analysis</p>
      </div>

      {/* Valuation Calculator */}
      <Card className="border-navy-700/50">
        <CardHeader>
          <CardTitle className="text-white">Valuation Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-navy-400 text-sm mb-2 block">Annual Revenue</label>
              <Input
                type="number"
                placeholder="$0"
                className="bg-navy-700/50 border-navy-600 text-white"
                value={valuationInputs.revenue}
                onChange={(e) => setValuationInputs({ ...valuationInputs, revenue: e.target.value })}
              />
            </div>
            <div>
              <label className="text-navy-400 text-sm mb-2 block">Annual EBITDA</label>
              <Input
                type="number"
                placeholder="$0"
                className="bg-navy-700/50 border-navy-600 text-white"
                value={valuationInputs.ebitda}
                onChange={(e) => setValuationInputs({ ...valuationInputs, ebitda: e.target.value })}
              />
            </div>
            <div>
              <label className="text-navy-400 text-sm mb-2 block">Industry</label>
              <Select value={valuationInputs.industry || ""} onValueChange={(val) => { if (val) setValuationInputs({ ...valuationInputs, industry: val }); }}>
                <SelectTrigger className="bg-navy-700/50 border-navy-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_MULTIPLES.map((m) => (
                    <SelectItem key={m.industry} value={m.industry}>
                      {m.industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-950 font-semibold"
                onClick={handleCalculateValuation}
              >
                Calculate
              </Button>
            </div>
          </div>

          {valuationResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-navy-800/30 rounded-lg border border-navy-700/30">
              <div>
                <p className="text-navy-400 text-sm">Low Estimate</p>
                <p className="text-2xl font-bold text-gold-400">
                  ${(valuationResult.min / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">High Estimate</p>
                <p className="text-2xl font-bold text-gold-400">
                  ${(valuationResult.max / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Industry Multiples */}
      <Card className="border-navy-700/50">
        <CardHeader>
          <CardTitle className="text-white">Industry Multiples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700/50">
                  <th className="text-left py-3 px-4 text-navy-400 font-semibold text-sm">Industry</th>
                  <th className="text-right py-3 px-4 text-navy-400 font-semibold text-sm">Revenue Multiple</th>
                  <th className="text-right py-3 px-4 text-navy-400 font-semibold text-sm">EBITDA Multiple</th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRY_MULTIPLES.map((m) => (
                  <tr
                    key={m.industry}
                    className={cn(
                      'border-b border-navy-700/20 hover:bg-navy-800/30 transition-colors',
                      valuationInputs.industry === m.industry && 'bg-gold-500/10'
                    )}
                  >
                    <td className="py-3 px-4 text-white font-medium">{m.industry}</td>
                    <td className="text-right py-3 px-4 text-navy-300">{m.revenueMultiple.toFixed(2)}x</td>
                    <td className="text-right py-3 px-4 text-navy-300">{m.ebitdaMultiple.toFixed(1)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Stats */}
      {portfolioStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats Cards */}
          <Card className="border-navy-700/50">
            <CardContent className="p-6">
              <p className="text-navy-400 text-sm mb-2">Total Pipeline Value</p>
              <p className="text-3xl font-bold text-gold-400">
                ${(portfolioStats.totalPipelineValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-navy-400 text-sm mt-2">{portfolioStats.dealCount} deals</p>
            </CardContent>
          </Card>

          <Card className="border-navy-700/50">
            <CardContent className="p-6">
              <p className="text-navy-400 text-sm mb-2">Average Deal Size</p>
              <p className="text-3xl font-bold text-gold-400">
                ${(portfolioStats.averageDealSize / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>

          <Card className="border-navy-700/50">
            <CardContent className="p-6">
              <p className="text-navy-400 text-sm mb-2">Top Industry</p>
              <p className="text-2xl font-bold text-white">
                {portfolioStats.topIndustries[0]?.industry || 'N/A'}
              </p>
              <p className="text-navy-400 text-sm mt-2">
                ${(portfolioStats.topIndustries[0]?.value / 1000000).toFixed(1)}M
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {portfolioStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pipeline by Stage */}
          <Card className="border-navy-700/50">
            <CardHeader>
              <CardTitle className="text-white">Pipeline by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {stageChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      formatter={(value: any) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-navy-400 text-center py-8">No deals yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top Industries */}
          <Card className="border-navy-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top Industries</CardTitle>
            </CardHeader>
            <CardContent>
              {industryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={industryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.industry} ($${(entry.value / 1000000).toFixed(1)}M)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {industryChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#fbbf24', '#a855f7', '#f97316', '#10b981', '#3b82f6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `$${(value / 1000000).toFixed(1)}M`}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-navy-400 text-center py-8">No deals yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Market Brief */}
      <Card className="border-navy-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              AI Market Brief
            </CardTitle>
            <Button
              size="sm"
              className="bg-gold-500 hover:bg-gold-600 text-navy-950"
              onClick={handleGenerateMarketBrief}
              disabled={briefLoading}
            >
              {briefLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Brief
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {marketBrief ? (
            <div className="space-y-4">
              <p className="text-white leading-relaxed">{marketBrief}</p>
              <div className="text-navy-400 text-sm">
                Generated using AI analysis of your portfolio and current market data
              </div>
            </div>
          ) : (
            <p className="text-navy-400">
              Click "Generate Brief" to get AI-powered market insights based on your portfolio composition and current industry trends.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
