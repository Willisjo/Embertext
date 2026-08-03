/**
 * AI Humanizer Engine - Client-side text transformation
 */

export type HumanizerMode = "standard" | "academic" | "professional" | "creative" | "simple";

interface HumanizerOptions {
  mode: HumanizerMode;
}

const SYNONYMS: Record<string, string[]> = {
  "utilize": ["use", "employ", "leverage", "make use of"],
  "demonstrate": ["show", "prove", "display", "illustrate"],
  "facilitate": ["help", "enable", "assist", "make easier"],
  "implement": ["carry out", "execute", "put into action", "apply"],
  "optimize": ["improve", "enhance", "refine", "make better"],
  "subsequently": ["then", "after that", "later", "next"],
  "furthermore": ["also", "in addition", "plus", "what's more"],
  "nevertheless": ["however", "still", "yet", "even so"],
  "consequently": ["so", "as a result", "therefore", "thus"],
  "additionally": ["also", "too", "as well", "besides"],
  "significant": ["important", "major", "big", "notable"],
  "approximately": ["about", "around", "roughly", "nearly"],
  "numerous": ["many", "lots of", "plenty of", "countless"],
  "sufficient": ["enough", "adequate", "plenty", "ample"],
  "initiate": ["start", "begin", "launch", "kick off"],
  "terminate": ["end", "finish", "stop", "conclude"],
  "ascertain": ["find out", "determine", "discover", "figure out"],
  "endeavor": ["try", "attempt", "effort", "shot"],
  "commence": ["start", "begin", "get going", "kick off"],
  "elucidate": ["explain", "clarify", "make clear", "spell out"],
};

const CONTRACTIONS: Record<string, string> = {
  "do not": "don't",
  "does not": "doesn't",
  "did not": "didn't",
  "is not": "isn't",
  "are not": "aren't",
  "was not": "wasn't",
  "were not": "weren't",
  "will not": "won't",
  "would not": "wouldn't",
  "could not": "couldn't",
  "should not": "shouldn't",
  "cannot": "can't",
  "have not": "haven't",
  "has not": "hasn't",
  "had not": "hadn't",
  "it is": "it's",
  "that is": "that's",
  "there is": "there's",
  "what is": "what's",
  "let us": "let's",
  "you are": "you're",
  "they are": "they're",
  "we are": "we're",
  "I am": "I'm",
  "he is": "he's",
  "she is": "she's",
};

const SENTENCE_STARTERS = [
  "Well,", "You know,", "Honestly,", "Actually,", "Basically,",
  "Look,", "I mean,", "The thing is,", "Here's the deal:", "Truth be told,",
  "Real talk:", "Let's be real,", "No cap,", "For real,",
];

const FILLERS = ["kind of", "sort of", "like", "basically", "pretty much", "honestly"];

function expandContractions(text: string): string {
  let result = text;
  Object.entries(CONTRACTIONS).forEach(([full, contraction]) => {
    const regex = new RegExp(`\b${full}\b`, "gi");
    result = result.replace(regex, contraction);
  });
  return result;
}

function replaceSynonyms(text: string, mode: HumanizerMode): string {
  let result = text;
  Object.entries(SYNONYMS).forEach(([word, alternatives]) => {
    const regex = new RegExp(`\b${word}\b`, "gi");
    if (regex.test(result)) {
      const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
      result = result.replace(regex, replacement);
    }
  });
  return result;
}

function varySentenceStructure(text: string, mode: HumanizerMode): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, index) => {
    if (sentence.length < 10) return sentence;

    if (index === 0 && Math.random() < 0.3 && mode !== "academic") {
      const starter = SENTENCE_STARTERS[Math.floor(Math.random() * SENTENCE_STARTERS.length)];
      sentence = `${starter} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
    }

    if (sentence.length > 80 && Math.random() < 0.2) {
      const midPoint = Math.floor(sentence.length / 2);
      const splitPoint = sentence.indexOf(", ", midPoint - 20) || sentence.indexOf(" and ", midPoint - 20);
      if (splitPoint > 0) {
        sentence = sentence.slice(0, splitPoint) + ". " + sentence.slice(splitPoint + 2).trim();
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      }
    }

    return sentence;
  }).join(" ");
}

function addNaturalVariations(text: string, mode: HumanizerMode): string {
  let result = text;

  if (mode === "standard" || mode === "creative" || mode === "simple") {
    const words = result.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (Math.random() < 0.02 && words[i].length > 3) {
        const filler = FILLERS[Math.floor(Math.random() * FILLERS.length)];
        words.splice(i, 0, filler);
        i++;
      }
    }
    result = words.join(" ");
  }

  result = result.replace(/very/gi, () => {
    const alternatives = ["really", "quite", "pretty", "fairly", "rather", "super"];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  });

  return result;
}

function adjustTone(text: string, mode: HumanizerMode): string {
  switch (mode) {
    case "academic":
      return text
        .replace(/I think/gi, "It is argued that")
        .replace(/I believe/gi, "The evidence suggests")
        .replace(/In my opinion/gi, "From an analytical perspective");
    case "professional":
      return text
        .replace(/I think/gi, "It is recommended")
        .replace(/I believe/gi, "Our analysis indicates")
        .replace(/In my opinion/gi, "Based on our assessment");
    case "creative":
      return text
        .replace(/I think/gi, "I feel like")
        .replace(/I believe/gi, "I'm convinced")
        .replace(/In my opinion/gi, "The way I see it");
    case "simple":
      return text
        .replace(/utilize/gi, "use")
        .replace(/demonstrate/gi, "show")
        .replace(/facilitate/gi, "help")
        .replace(/approximately/gi, "about")
        .replace(/significant/gi, "big")
        .replace(/nevertheless/gi, "but")
        .replace(/furthermore/gi, "also")
        .replace(/consequently/gi, "so");
    default:
      return text;
  }
}

function estimateDetectionImprovement(original: string, humanized: string): number {
  const originalWords = original.split(/\s+/).length;
  const humanizedWords = humanized.split(/\s+/).length;
  const lengthDiff = Math.abs(originalWords - humanizedWords) / originalWords;

  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const origAvgLen = originalSentences.reduce((a, b) => a + b.length, 0) / originalSentences.length;
  const humanAvgLen = humanizedSentences.reduce((a, b) => a + b.length, 0) / humanizedSentences.length;
  const variation = Math.abs(origAvgLen - humanAvgLen) / origAvgLen;

  const baseImprovement = 35;
  const variationBonus = Math.min(variation * 100, 30);
  const lengthBonus = Math.min(lengthDiff * 50, 15);

  return Math.min(Math.round(baseImprovement + variationBonus + lengthBonus), 85);
}

export function humanizeText(text: string, options: HumanizerOptions): { result: string; improvement: number } {
  if (!text.trim()) return { result: "", improvement: 0 };

  let result = text;
  result = expandContractions(result);
  result = replaceSynonyms(result, options.mode);
  result = varySentenceStructure(result, options.mode);
  result = addNaturalVariations(result, options.mode);
  result = adjustTone(result, options.mode);

  result = result
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

  const improvement = estimateDetectionImprovement(text, result);

  return { result, improvement };
}

export function getModeDescription(mode: HumanizerMode): string {
  const descriptions: Record<HumanizerMode, string> = {
    standard: "Balanced humanization with natural flow",
    academic: "Formal tone suitable for papers and research",
    professional: "Business-appropriate language",
    creative: "Expressive and engaging style",
    simple: "Easy-to-read, accessible language",
  };
  return descriptions[mode];
}
