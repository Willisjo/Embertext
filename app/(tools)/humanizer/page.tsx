"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Type,
  Settings2,
  Loader2,
  BarChart3,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { type HumanizerMode, getModeDescription, humanizeText } from "@/lib/humanizer-engine";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const modes: { value: HumanizerMode; label: string; icon: string }[] = [
  { value: "standard", label: "Standard", icon: "✨" },
  { value: "academic", label: "Academic", icon: "🎓" },
  { value: "professional", label: "Professional", icon: "💼" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "simple", label: "Simple", icon: "📝" },
];

export default function HumanizerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<HumanizerMode>("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [improvement, setImprovement] = useState(0);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [poweredBy, setPoweredBy] = useState<string>("");

  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const charCount = input.length;

  const handleHumanize = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to humanize");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setOutput("");
    setPoweredBy("");
    setAiError(null);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 90));
    }, 100);

    try {
      const { result, improvement } = humanizeText(input, { mode });

      clearInterval(progressInterval);
      setProgress(100);
      setOutput(result);
      setImprovement(improvement);
      setPoweredBy("Local Engine");
      setIsProcessing(false);
      toast.success("Text humanized successfully!");
    } catch (e: any) {
      setAiError("Humanization failed. Please try again.");
      toast.error("Humanization failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  }, [input, mode]);

  const handleRetry = () => {
    setAiError(null);
    handleHumanize();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setImprovement(0);
    setProgress(0);
    setAiError(null);
    setPoweredBy("");
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-blue-600/10 to-violet-500/10 blur-3xl"
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-center mb-10"
      >
        <motion.div
          className="relative inline-block mb-6"
          animate={{ rotateY: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30"
            animate={{
              boxShadow: [
                "0 10px 30px -5px rgba(59,130,246,0.3)",
                "0 10px 40px -5px rgba(59,130,246,0.5)",
                "0 10px 30px -5px rgba(59,130,246,0.3)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="/icon.jpg" alt="Embertext" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 blur-lg -z-10"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Text Humanizer
          </span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground text-lg max-w-md mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          Transform text into natural, human-like writing
        </motion.p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Humanization Mode</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((m, index) => (
            <motion.button
              key={m.value}
              onClick={() => setMode(m.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                mode === m.value
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-card/80 border border-border/50 hover:bg-accent hover:border-blue-500/20 backdrop-blur-sm"
              )}
              title={getModeDescription(m.value)}
            >
              <span className="mr-1.5">{m.icon}</span>
              {m.label}
            </motion.button>
          ))}
        </div>
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground mt-2"
        >
          {getModeDescription(mode)}
        </motion.p>
      </motion.div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ y: -2 }}
        >
          <div className="glass-card rounded-2xl p-4 h-full flex flex-col transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Type className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Input Text</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-muted/50">{wordCount} words</span>
                <span className="px-2 py-0.5 rounded-md bg-muted/50">{charCount} chars</span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here..."
              className="flex-1 min-h-[300px] w-full resize-none rounded-xl bg-muted/30 border border-border/30 p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 focus:outline-none placeholder:text-muted-foreground/40 transition-all duration-200"
            />
            <div className="flex gap-2 mt-3">
              <motion.button
                onClick={handleClear}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/80 hover:text-foreground transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Output */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ y: -2 }}
        >
          <div className="glass-card rounded-2xl p-4 h-full flex flex-col transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Humanized Output</span>
              </div>
              {output && (
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-green-600 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full bg-green-500/10"
                  >
                    +{improvement}% human
                  </motion.span>
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                    title="Copy output"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Error State */}
            <AnimatePresence>
              {aiError && !output && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Humanization Failed</p>
                        <p className="text-xs text-muted-foreground mt-1">{aiError}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <motion.button
                        onClick={handleRetry}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isProcessing && !aiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{Math.round(progress)}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 min-h-[300px] rounded-xl bg-muted/20 border border-border/20 p-4 text-sm overflow-auto">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.p
                    key="output"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="whitespace-pre-wrap leading-relaxed"
                  >
                    {output}
                  </motion.p>
                ) : (
                  <motion.p
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-muted-foreground/40 italic"
                  >
                    Humanized text will appear here...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleHumanize}
              disabled={isProcessing || !input.trim()}
              whileHover={!isProcessing && input.trim() ? { scale: 1.02, y: -1 } : {}}
              whileTap={!isProcessing && input.trim() ? { scale: 0.98 } : {}}
              className={cn(
                "mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                isProcessing || !input.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_200%] animate-gradient text-white hover:shadow-lg hover:shadow-blue-500/30"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Humanize Text
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-6 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Humanization Stats</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Detection Improvement" value={`+${improvement}%`} />
            <StatCard label="Words Processed" value={wordCount.toString()} />
            <StatCard label="Mode Used" value={mode.charAt(0).toUpperCase() + mode.slice(1)} />
            <StatCard label="Engine" value={poweredBy.includes("Groq") ? "Groq" : poweredBy.includes("Nara") ? "NaraRouter" : "Local"} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/20"
    >
      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
