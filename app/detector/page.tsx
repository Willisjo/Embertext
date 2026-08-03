"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Type,
  Sparkles,
  Trash2,
  Hash,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DetectResult {
  aiProbability: number;
  humanProbability: number;
  confidence: number;
  reasoning: string;
  indicators: string[];
  poweredBy: string;
}

export default function DetectorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DetectResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }
    if (wordCount < 10) {
      toast.error("Please enter at least 10 words for accurate results");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success("Analysis complete!");
      } else {
        setError(data.error || "Failed to analyze text");
        toast.error(data.error || "Failed to analyze text");
      }
    } catch (e: any) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return "text-red-500";
    if (score > 40) return "text-yellow-500";
    if (score > 20) return "text-yellow-400";
    return "text-green-500";
  };

  const getScoreBg = (score: number) => {
    if (score > 70) return "bg-red-500";
    if (score > 40) return "bg-yellow-500";
    if (score > 20) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getBadge = (score: number) => {
    if (score > 70) return { label: "AI-Generated", color: "bg-red-500/10 text-red-600 dark:text-red-400" };
    if (score > 40) return { label: "Possibly AI", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" };
    if (score > 20) return { label: "Likely Human", color: "bg-yellow-400/10 text-yellow-600 dark:text-yellow-400" };
    return { label: "Human", color: "bg-green-500/10 text-green-600 dark:text-green-400" };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Content Detector</h1>
        <p className="text-muted-foreground">
          Analyze text to determine if it was written by AI or a human
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Input Text</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{wordCount} words</span>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type text to analyze..."
            className="w-full min-h-[200px] rounded-xl bg-muted/50 border-0 p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-muted-foreground/50 resize-y"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className={cn(
                "ml-auto flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-sm transition-all",
                isAnalyzing || !input.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/25"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Text
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <div className="glass-card rounded-2xl p-4 border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold text-sm">Error</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-6"
          >
            {/* Main Score Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                      <circle
                        cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${result.aiProbability * 2.51} 251`}
                        className={cn("transition-all duration-1000", getScoreColor(result.aiProbability))}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn("text-4xl font-bold", getScoreColor(result.aiProbability))}>
                        {result.aiProbability}%
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">AI Probability</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-medium", getBadge(result.aiProbability).color)}>
                      {getBadge(result.aiProbability).label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <ScoreBar label="AI Probability" value={result.aiProbability} color={getScoreBg(result.aiProbability)} />
                  <ScoreBar label="Human Probability" value={result.humanProbability} color="bg-green-500" />
                  <ScoreBar label="Confidence" value={result.confidence} color="bg-blue-500" />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <div className="flex items-start gap-3">
                  {result.aiProbability > 50 ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            {result.indicators.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  AI Indicators Found ({result.indicators.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.indicators.map((indicator, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      {!result && !error && !input && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          <InfoCard icon={Search} title="AI-Powered Analysis" description="Uses advanced AI models to detect AI-generated content with high accuracy." />
          <InfoCard icon={BarChart3} title="Detailed Metrics" description="Get AI probability score, confidence level, and reasoning behind the detection." />
          <InfoCard icon={Sparkles} title="Accurate Results" description="Leverages multiple AI providers for reliable and accurate detection results." />
        </motion.div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof Search; title: string; description: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

