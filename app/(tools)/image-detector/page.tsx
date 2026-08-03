"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  FileImage,
  Scan,
  Camera,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DetectionResult {
  aiProbability: number;
  humanProbability: number;
  confidence: string;
  entropy: number;
  patterns: {
    repetitiveStructures: number;
    symmetryScore: number;
    textureUniformity: number;
  };
  artifacts: {
    watermarkPatterns: boolean;
    noisePatterns: boolean;
    compressionArtifacts: boolean;
  };
  assessment: string;
  details: string[];
  filename: string;
  size: number;
}

export default function ImageDetectorPage() {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setFile(file);
    setResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/image-detector", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      toast.success("Image analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return "text-red-500";
    if (score > 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreBg = (score: number) => {
    if (score > 70) return "bg-red-500";
    if (score > 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Image Detector</h1>
        <p className="text-muted-foreground">
          Upload an image to detect if it was AI-generated or a real photograph
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          {image ? (
            <div className="relative inline-block">
              <img
                src={image}
                alt="Uploaded"
                className="max-h-64 max-w-full rounded-xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Drop your image here, or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analyze Button */}
      {image && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={cn(
              "px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2",
              isAnalyzing
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:opacity-90 shadow-lg shadow-pink-500/25"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Scan className="w-4 h-4" />
                Analyze Image
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Main Score Card */}
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Gauge */}
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
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
                </div>

                {/* Breakdown */}
                <div className="space-y-4">
                  <ScoreBar
                    label="AI Probability"
                    value={result.aiProbability}
                    color={getScoreBg(result.aiProbability)}
                  />
                  <ScoreBar
                    label="Real Photo Probability"
                    value={result.humanProbability}
                    color="bg-green-500"
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className={cn(
                      "font-medium capitalize",
                      result.confidence === "high" ? "text-green-600" : "text-yellow-600"
                    )}>
                      {result.confidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Entropy:</span>
                    <span className="font-medium">{result.entropy}</span>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <div className="flex items-start gap-3">
                  {result.aiProbability > 50 ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Assessment</h4>
                    <p className="text-sm text-muted-foreground">{result.assessment}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pattern Analysis */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Pattern Analysis
                </h4>
                <div className="space-y-4">
                  <PatternBar
                    label="Repetitive Structures"
                    value={result.patterns.repetitiveStructures}
                    description="AI often creates repeating patterns"
                  />
                  <PatternBar
                    label="Symmetry Score"
                    value={result.patterns.symmetryScore}
                    description="Unnatural symmetry suggests AI"
                  />
                  <PatternBar
                    label="Texture Uniformity"
                    value={result.patterns.textureUniformity}
                    description="Real photos have organic variation"
                  />
                </div>
              </div>

              {/* Artifacts Detected */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Artifacts Detected
                </h4>
                <div className="space-y-3">
                  <ArtifactItem
                    label="Watermark Patterns"
                    detected={result.artifacts.watermarkPatterns}
                    description="Subtle AI generator signatures"
                  />
                  <ArtifactItem
                    label="Noise Patterns"
                    detected={result.artifacts.noisePatterns}
                    description="Artificial noise vs organic grain"
                  />
                  <ArtifactItem
                    label="Compression Artifacts"
                    detected={result.artifacts.compressionArtifacts}
                    description="Natural camera compression"
                  />
                </div>
              </div>
            </div>

            {/* Details List */}
            {result.details.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Detailed Findings
                </h4>
                <ul className="space-y-2">
                  {result.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                        result.aiProbability > 50 ? "bg-yellow-500" : "bg-green-500"
                      )} />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* File Info */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>Analyzed: {result.filename} ({(result.size / 1024).toFixed(1)} KB)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      {!result && !image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          <InfoCard
            icon={Camera}
            title="Real Photos"
            description="Natural noise, organic textures, authentic compression artifacts"
          />
          <InfoCard
            icon={Sparkles}
            title="AI Generated"
            description="Perfect symmetry, repetitive patterns, uniform textures, subtle watermarks"
          />
          <InfoCard
            icon={FileImage}
            title="Supported Formats"
            description="JPG, PNG, GIF, WebP up to 10MB per image"
          />
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

function PatternBar({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            value > 70 ? "bg-red-500" : value > 40 ? "bg-yellow-500" : "bg-green-500"
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ArtifactItem({ label, detected, description }: { label: string; detected: boolean; description: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium",
        detected
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-green-500/10 text-green-600 dark:text-green-400"
      )}>
        {detected ? "Detected" : "Not Found"}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof Camera; title: string; description: string }) {
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
