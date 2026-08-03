/**
 * AI Content Detector Engine - Statistical analysis
 */

export interface DetectionResult {
  aiProbability: number;
  humanProbability: number;
  readabilityScore: number;
  avgSentenceLength: number;
  sentenceComplexity: number;
  vocabularyDiversity: number;
  toneAnalysis: {
    formal: number;
    casual: number;
    technical: number;
    emotional: number;
  };
  highlights: Array<{
    text: string;
    aiLikelihood: number;
    reason: string;
  }>;
  overallAssessment: string;
}

const AI_PATTERNS = [
  { pattern: /\b(furthermore|moreover|consequently|therefore|thus|hence|nonetheless)\b/gi, weight: 0.08 },
  { pattern: /\b(utilize|leverage|facilitate|implement|optimize|streamline)\b/gi, weight: 0.06 },
  { pattern: /\b(it is important to note that|it should be noted that|it is worth mentioning)\b/gi, weight: 0.12 },
  { pattern: /\b(in conclusion|to summarize|in summary|to conclude)\b/gi, weight: 0.08 },
  { pattern: /\b(overall|in general|broadly speaking|as a whole)\b/gi, weight: 0.05 },
  { pattern: /\b(needless to say|it goes without saying)\b/gi, weight: 0.1 },
  { pattern: /\b(delve|tapestry|showcase|testament|embark|underscore|paramount)\b/gi, weight: 0.06 },
  { pattern: /\b(navigate|realm|landscape|evoke|shed light|pave the way)\b/gi, weight: 0.05 },
];

const HUMAN_PATTERNS = [
  { pattern: /\b(honestly|frankly|personally|to be honest|between you and me)\b/gi, weight: -0.08 },
  { pattern: /\b(kind of|sort of|like|basically|you know|I mean)\b/gi, weight: -0.06 },
  { pattern: /[!?]{2,}/g, weight: -0.05 },
  { pattern: /\b(dude|man|buddy|pal|mate)\b/gi, weight: -0.04 },
  { pattern: /\.{3,}/g, weight: -0.03 },
  { pattern: /\b(anyway|whatever|basically|like I said)\b/gi, weight: -0.04 },
];

function calculateShannonEntropy(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;

  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  const total = words.length;
  let entropy = 0;
  Object.values(freq).forEach(count => {
    const p = count / total;
    entropy -= p * Math.log2(p);
  });

  return entropy;
}

function calculateBurstiness(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) return 0;

  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  return stdDev / Math.max(mean, 1);
}

function calculateVocabularyDiversity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
}

function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + (word.match(/[aeiouy]{1,2}/gi) || []).length;
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  return Math.max(0, Math.min(100, score));
}

function analyzeTone(text: string) {
  const lower = text.toLowerCase();

  const formalWords = ["furthermore", "moreover", "consequently", "therefore", "thus", "nonetheless", "nevertheless"];
  const casualWords = ["honestly", "frankly", "basically", "like", "kind of", "sort of", "you know"];
  const technicalWords = ["algorithm", "parameter", "implementation", "optimization", "framework", "architecture"];
  const emotionalWords = ["amazing", "terrible", "wonderful", "horrible", "love", "hate", "excited", "devastated"];

  const wordCount = text.split(/\s+/).length;

  return {
    formal: Math.min(100, (formalWords.filter(w => lower.includes(w)).length / wordCount) * 1000),
    casual: Math.min(100, (casualWords.filter(w => lower.includes(w)).length / wordCount) * 1000),
    technical: Math.min(100, (technicalWords.filter(w => lower.includes(w)).length / wordCount) * 1000),
    emotional: Math.min(100, (emotionalWords.filter(w => lower.includes(w)).length / wordCount) * 1000),
  };
}

function findHighlights(text: string): DetectionResult["highlights"] {
  const highlights: DetectionResult["highlights"] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  sentences.forEach(sentence => {
    let aiScore = 0;
    let reason = "";

    AI_PATTERNS.forEach(({ pattern, weight }) => {
      const matches = sentence.match(pattern);
      if (matches) {
        aiScore += weight * matches.length;
        if (!reason) reason = `Contains AI-typical phrasing: "${matches[0]}"`;
      }
    });

    const words = sentence.split(/\s+/);
    const wordSet = new Set(words.map(w => w.toLowerCase()));
    if (words.length > 10 && wordSet.size / words.length < 0.5) {
      aiScore += 0.1;
      if (!reason) reason = "Repetitive vocabulary pattern detected";
    }

    if (sentence.length > 80 && sentence.length < 120) {
      aiScore += 0.03;
      if (!reason) reason = "Uniform sentence length typical of AI";
    }

    if (aiScore > 0.15) {
      highlights.push({
        text: sentence.trim(),
        aiLikelihood: Math.min(100, Math.round(aiScore * 100)),
        reason: reason || "Multiple AI indicators detected",
      });
    }
  });

  return highlights.sort((a, b) => b.aiLikelihood - a.aiLikelihood).slice(0, 5);
}

export function analyzeText(text: string): DetectionResult {
  if (!text.trim()) {
    return {
      aiProbability: 0,
      humanProbability: 0,
      readabilityScore: 0,
      avgSentenceLength: 0,
      sentenceComplexity: 0,
      vocabularyDiversity: 0,
      toneAnalysis: { formal: 0, casual: 0, technical: 0, emotional: 0 },
      highlights: [],
      overallAssessment: "No text provided",
    };
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  const entropy = calculateShannonEntropy(text);
  const burstiness = calculateBurstiness(text);
  const vocabDiversity = calculateVocabularyDiversity(text);
  const readability = calculateReadability(text);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);

  let aiScore = 0;

  AI_PATTERNS.forEach(({ pattern, weight }) => {
    const matches = text.match(pattern);
    if (matches) aiScore += weight * matches.length;
  });

  HUMAN_PATTERNS.forEach(({ pattern, weight }) => {
    const matches = text.match(pattern);
    if (matches) aiScore += weight * matches.length;
  });

  if (entropy < 4.0) aiScore += 0.12;
  else if (entropy > 6.5) aiScore -= 0.08;

  if (burstiness < 0.3) aiScore += 0.08;
  else if (burstiness > 0.7) aiScore -= 0.08;

  if (vocabDiversity < 0.4) aiScore += 0.08;
  else if (vocabDiversity > 0.7) aiScore -= 0.08;

  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const lengthVariance = sentenceLengths.length > 1
    ? sentenceLengths.reduce((a, b) => a + Math.pow(b - avgSentenceLength, 2), 0) / sentenceLengths.length
    : 0;
  if (lengthVariance < 5) aiScore += 0.08;

  const aiProbability = Math.min(100, Math.max(0, Math.round(aiScore * 100)));
  const humanProbability = 100 - aiProbability;

  const sentenceComplexity = Math.min(100, Math.round(
    (avgSentenceLength / 20) * 50 + (vocabDiversity * 50)
  ));

  let overallAssessment = "";
  if (aiProbability > 70) {
    overallAssessment = "This text shows strong indicators of AI generation. The structure, vocabulary patterns, and sentence uniformity are highly consistent with AI-written content.";
  } else if (aiProbability > 40) {
    overallAssessment = "This text contains some AI-like patterns but also shows human characteristics. It may be AI-assisted or heavily edited AI content.";
  } else if (aiProbability > 20) {
    overallAssessment = "This text appears mostly human-written with minor AI-like elements. It could be lightly edited or naturally written.";
  } else {
    overallAssessment = "This text exhibits strong human writing characteristics including varied sentence structure, natural vocabulary patterns, and authentic tone.";
  }

  return {
    aiProbability,
    humanProbability,
    readabilityScore: Math.round(readability),
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    sentenceComplexity,
    vocabularyDiversity: Math.round(vocabDiversity * 100),
    toneAnalysis: analyzeTone(text),
    highlights: findHighlights(text),
    overallAssessment,
  };
}
