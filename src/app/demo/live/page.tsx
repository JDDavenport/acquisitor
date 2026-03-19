"use client";

import { useState } from "react";
import { Mail, Zap, CheckCircle2, ArrowRight, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Stage = "input" | "discovering" | "scoring" | "drafting" | "complete" | "error";

interface DiscoveredBusiness {
  name: string;
  industry: string;
  location: string;
  yearFounded?: number;
  score?: number;
  reasoning?: string;
  email?: string;
}

interface DemoResult {
  discovered: DiscoveredBusiness;
  email?: {
    subject: string;
    body: string;
  };
}

const stageLabels = {
  input: "Start",
  discovering: "🔍 Discovering",
  scoring: "⚡ Analyzing",
  drafting: "✉️ Drafting",
  complete: "✅ Complete",
  error: "❌ Error",
};

function StageIndicator({ stage, label, isActive, isComplete }: { stage: Stage; label: string; isActive: boolean; isComplete: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${isActive ? "text-gold-400 font-semibold" : isComplete ? "text-emerald-400 font-semibold" : "text-navy-400"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
          isActive
            ? "bg-gold-500 text-navy-950 scale-110"
            : isComplete
              ? "bg-emerald-500 text-white"
              : "bg-navy-700 text-navy-300"
        }`}
      >
        {isComplete ? <CheckCircle2 className="w-5 h-5" /> : "•"}
      </div>
      <span>{label}</span>
    </div>
  );
}

function ScoreCard({ score, reasoning }: { score: number; reasoning: string }) {
  const getScoreGradient = (s: number) => {
    if (s >= 90) return "from-emerald-500 to-emerald-600";
    if (s >= 70) return "from-gold-500 to-gold-600";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return "Excellent";
    if (s >= 70) return "Strong";
    return "Moderate";
  };

  return (
    <div className="space-y-4">
      <div className={`relative w-48 h-48 mx-auto bg-gradient-to-br ${getScoreGradient(score)} p-1 rounded-full`}>
        <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-white font-data">{score}</div>
            <div className="text-gold-400 text-sm mt-2">{getScoreLabel(score)}</div>
          </div>
        </div>
      </div>
      <div className="bg-navy-800/50 border border-navy-700/50 rounded-lg p-4">
        <p className="text-sm text-navy-300 italic">{reasoning}</p>
      </div>
    </div>
  );
}

export default function LiveDemoPage() {
  const [stage, setStage] = useState<Stage>("input");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("HVAC Services");
  const [state, setState] = useState("UT");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState("");

  const handleStartDemo = async () => {
    if (!email || !industry || !state) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setStage("discovering");
    setResult(null);

    try {
      // Step 1: Run scraper
      const scraperRes = await fetch("/api/scraper/utah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 1 }),
      });

      if (!scraperRes.ok) throw new Error("Scraper failed");
      const scraperData = await scraperRes.json();

      if (!scraperData.results || scraperData.results.length === 0) {
        throw new Error("No businesses discovered");
      }

      const discovered = scraperData.results[0];

      setStage("scoring");

      // Simulate scoring animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStage("drafting");

      // Generate email
      const emailRes = await fetch("/api/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: discovered.name,
          industry,
          location: state,
          contactEmail: email,
        }),
      });

      const emailData = emailRes.ok ? await emailRes.json() : null;

      setResult({
        discovered: { ...discovered, email },
        email: emailData,
      });

      setStage("complete");
    } catch (err) {
      console.error("Demo error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  };

  const isStageComplete = (s: Stage) => {
    const stageOrder = ["input", "discovering", "scoring", "drafting", "complete"];
    return stageOrder.indexOf(s) < stageOrder.indexOf(stage);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Demo: The Full Pipeline</h1>
        <p className="text-navy-300">See how Acquisitor discovers, scores, and reaches out to businesses in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Progress */}
        <div className="lg:col-span-1 space-y-6">
          {/* Input Card */}
          {stage === "input" || stage === "error" ? (
            <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">Let's Find a Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-navy-300 block mb-2">Your Email</label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={stage !== "input"}
                    className="bg-navy-900/50 border-navy-700/50 text-white placeholder:text-navy-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-navy-300 block mb-2">Target Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={stage !== "input"}
                    className="w-full px-3 py-2 bg-navy-900/50 border border-navy-700/50 rounded-lg text-white text-sm focus:border-gold-500/50 focus:ring-gold-500/20 outline-none transition-colors"
                  >
                    <option value="HVAC Services">HVAC Services</option>
                    <option value="Plumbing Services">Plumbing Services</option>
                    <option value="Electrical Services">Electrical Services</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Landscaping Services">Landscaping Services</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-navy-300 block mb-2">State</label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    disabled={stage !== "input"}
                    placeholder="UT"
                    maxLength={2}
                    className="bg-navy-900/50 border-navy-700/50 text-white placeholder:text-navy-400"
                  />
                </div>

                {error && (
                  <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleStartDemo}
                  disabled={stage !== "input"}
                  className="w-full bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold"
                >
                  {stage === "input" ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Discovery
                    </>
                  ) : (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Progress */}
          <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">Pipeline Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StageIndicator
                stage="discovering"
                label="Discover Businesses"
                isActive={stage === "discovering"}
                isComplete={isStageComplete("discovering")}
              />
              <StageIndicator
                stage="scoring"
                label="AI Scoring"
                isActive={stage === "scoring"}
                isComplete={isStageComplete("scoring")}
              />
              <StageIndicator
                stage="drafting"
                label="Generate Outreach"
                isActive={stage === "drafting"}
                isComplete={isStageComplete("drafting")}
              />
              <StageIndicator
                stage="complete"
                label="Ready to Send"
                isActive={stage === "complete"}
                isComplete={isStageComplete("complete")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discovering Stage */}
          {(stage === "discovering" || stage === "scoring" || stage === "drafting" || stage === "complete") && (
            <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm animate-pulse">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin text-gold-400" />
                  Discovering Businesses...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-navy-700/50 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-navy-700/50 rounded-full w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scoring Stage */}
          {result && (stage === "scoring" || stage === "drafting" || stage === "complete") && (
            <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Business Discovered
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{result.discovered.name}</h3>
                  <p className="text-sm text-navy-300 mt-1">
                    {result.discovered.industry} • {result.discovered.location}
                  </p>
                  {result.discovered.yearFounded && (
                    <p className="text-xs text-navy-400 mt-1">Founded {result.discovered.yearFounded}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Stage */}
          {result && (stage === "scoring" || stage === "drafting" || stage === "complete") && (
            <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm border-gold-500/30 bg-gold-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gold-400" />
                  AI Acquisition Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.discovered.score !== undefined && result.discovered.reasoning ? (
                  <ScoreCard score={result.discovered.score} reasoning={result.discovered.reasoning} />
                ) : (
                  <div className="space-y-3">
                    <div className="h-48 bg-navy-700/50 rounded-full animate-pulse" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email Draft Stage */}
          {result && (stage === "drafting" || stage === "complete") && (
            <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm border-blue-500/30 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  Personalized Outreach Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.email ? (
                  <>
                    <div className="bg-navy-900/50 border border-navy-700/50 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-navy-400 uppercase">Subject</span>
                        <p className="text-sm text-white font-medium mt-1">{result.email.subject}</p>
                      </div>
                      <div className="h-px bg-navy-700/50" />
                      <div>
                        <span className="text-xs font-semibold text-navy-400 uppercase">Message</span>
                        <p className="text-sm text-navy-200 mt-2 whitespace-pre-wrap">{result.email.body}</p>
                      </div>
                    </div>
                    {stage === "complete" && (
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email Now
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-navy-700/50 rounded-full w-full animate-pulse" />
                    <div className="h-4 bg-navy-700/50 rounded-full w-5/6 animate-pulse" />
                    <div className="h-20 bg-navy-700/50 rounded-lg animate-pulse mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Complete State */}
          {stage === "complete" && result && (
            <Card className="border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-400">Pipeline Complete!</h3>
                  <p className="text-sm text-navy-300">
                    Your business discovery and outreach email are ready. This entire process took just seconds.
                  </p>
                  <div className="pt-2 text-xs text-navy-400">
                    <p>This is what Acquisitor does automatically for your entire target market — every day.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
