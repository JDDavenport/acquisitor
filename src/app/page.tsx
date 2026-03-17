"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Sparkles,
  Search,
  BarChart3,
  Mail,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Building2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const features = [
  {
    icon: Search,
    title: "AI Lead Discovery",
    description: "Automatically scrape 50+ sources to find businesses matching your acquisition criteria. Never miss a deal again.",
  },
  {
    icon: BarChart3,
    title: "Intelligent Scoring",
    description: "Our ML models score leads 1-100 based on financial health, growth trajectory, and strategic fit.",
  },
  {
    icon: Mail,
    title: "Smart Outreach",
    description: "Generate personalized emails with AI. Track opens, clicks, and replies with built-in CRM integration.",
  },
  {
    icon: Target,
    title: "Deal Pipeline",
    description: "Visual Kanban board from sourcing to closing. Drag-and-drop deals through your acquisition workflow.",
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    description: "Real-time valuation multiples, industry benchmarks, and comparable transaction data at your fingertips.",
  },
  {
    icon: Shield,
    title: "Due Diligence Vault",
    description: "Secure document storage with checklists, task tracking, and team collaboration for every deal.",
  },
];

const stats = [
  { value: 2847, suffix: "+", label: "Deals Sourced" },
  { value: 200, suffix: "+", label: "Active Searchers" },
  { value: 94, suffix: "%", label: "Time Saved" },
  { value: 12, suffix: "x", label: "ROI Average" },
];

const testimonials = [
  {
    quote: "ACQUISITOR cut our deal sourcing time from 40 hours a week to 4. We closed our first acquisition within 90 days.",
    name: "Marcus Chen",
    title: "Search Fund Principal",
    avatar: "MC",
  },
  {
    quote: "The AI scoring alone is worth the subscription. It surfaces deals I would have completely missed.",
    name: "Sarah Williams",
    title: "Independent Sponsor",
    avatar: "SW",
  },
  {
    quote: "Finally, a platform built specifically for small business acquisitions. The pipeline management is incredible.",
    name: "David Park",
    title: "PE Associate",
    avatar: "DP",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-navy-800/50 bg-navy-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-navy-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ACQUISITOR</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-navy-300 hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-navy-300 hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-navy-300 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-navy-200 hover:text-white hover:bg-navy-800/50">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-navy-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gold-300">AI-Powered Deal Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Discover <span className="text-gradient-gold">Profitable</span>
            <br />
            Businesses to Acquire
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The intelligence platform for serious entrepreneurs acquiring businesses
            in the $200K–$5M range. Source deals, score opportunities, and close faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-base px-8 h-12">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-navy-400 text-white hover:bg-navy-800/50 hover:text-white bg-transparent h-12"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 via-navy-500/20 to-gold-500/20 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl overflow-hidden border border-navy-600/50 shadow-2xl">
              <div className="bg-navy-900/50 backdrop-blur-sm p-2">
                <div className="bg-navy-800 rounded-xl overflow-hidden">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2 bg-navy-900/80 rounded-lg p-4 border border-navy-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-white font-semibold">Deal Pipeline</div>
                        <div className="flex gap-2">
                          <div className="px-3 py-1 bg-navy-700 rounded text-xs text-navy-300">This Quarter</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {["Sourcing", "LOI", "Diligence", "Closing"].map((stage, i) => (
                          <div key={stage} className="bg-navy-800/50 rounded p-3 border border-navy-700/50">
                            <div className="text-xs text-navy-300 mb-2">{stage}</div>
                            <div className="space-y-2">
                              {i < 2 && (
                                <>
                                  <div className="h-12 bg-navy-700/50 rounded border-l-2 border-gold-500" />
                                  <div className="h-12 bg-navy-700/50 rounded" />
                                </>
                              )}
                              {i === 2 && <div className="h-12 bg-navy-700/50 rounded border-l-2 border-navy-400" />}
                              {i === 3 && <div className="h-12 bg-navy-700/50 rounded border-l-2 border-emerald-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-navy-900/80 rounded-lg p-4 border border-navy-700">
                        <div className="text-navy-300 text-sm mb-1">Pipeline Value</div>
                        <div className="text-2xl font-bold text-white font-data">$4.2M</div>
                        <div className="text-emerald-400 text-xs mt-1">+23% this month</div>
                      </div>
                      <div className="bg-navy-900/80 rounded-lg p-4 border border-navy-700">
                        <div className="text-navy-300 text-sm mb-1">Active Deals</div>
                        <div className="text-2xl font-bold text-white font-data">12</div>
                        <div className="text-navy-400 text-xs mt-1">3 need attention</div>
                      </div>
                      <div className="bg-navy-900/80 rounded-lg p-4 border border-navy-700">
                        <div className="text-navy-300 text-sm mb-1">Avg Deal Score</div>
                        <div className="text-2xl font-bold text-white font-data">78</div>
                        <div className="flex gap-1 mt-2">
                          <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                            <div className="w-[78%] h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-20 border-y border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-white font-data">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-navy-300 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
              <Zap className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-medium text-gold-300 uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="text-gradient-gold">Close Deals</span>
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto text-lg">
              From initial discovery to signed agreements — one platform for your entire acquisition workflow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl border border-navy-700/50 bg-navy-900/30 backdrop-blur-sm hover:border-gold-500/30 hover:bg-navy-800/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center mb-4 group-hover:border-gold-500/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-navy-300 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
              <Users className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-medium text-gold-300 uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by <span className="text-gradient-gold">200+ Searchers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl border border-navy-700/50 bg-navy-800/30"
              >
                <p className="text-navy-200 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-950 font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-navy-400 text-xs">{t.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your Next Acquisition?
            </h2>
            <p className="text-navy-300 text-lg mb-8 max-w-2xl mx-auto">
              Join 200+ business buyers who use ACQUISITOR to discover and close deals faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold text-base px-8 h-12">
                  Start Free — No Credit Card
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-navy-400 text-white hover:bg-navy-800/50 hover:text-white bg-transparent h-12">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-navy-950" />
              </div>
              <span className="text-lg font-bold text-white">ACQUISITOR</span>
            </div>
            <p className="text-navy-400 text-sm">© 2026 ACQUISITOR. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-navy-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-navy-400 hover:text-white text-sm transition-colors">Terms</a>
              <Link href="/login" className="text-navy-400 hover:text-white text-sm transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
