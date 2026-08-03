import { NextResponse } from "next/server";
import { trackToolUsage } from "@/lib/analytics";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NARAROUTER_API_KEY = process.env.NARAROUTER_API_KEY;

let providerIndex = 0;

interface ProviderConfig {
  name: string;
  url: string;
  apiKey: string | undefined;
  model: string;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  if (GROQ_API_KEY) {
    providers.push({
      name: "Groq AI (Llama 3.1)",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
    });
  }

  if (NARAROUTER_API_KEY) {
    providers.push({
      name: "NaraRouter (Auto)",
      url: "https://router.bynara.id/v1/chat/completions",
      apiKey: NARAROUTER_API_KEY,
      model: "gpt-4o-mini",
    });
  }

  return providers;
}

function getNextProvider(): ProviderConfig | null {
  const providers = getProviders();
  if (providers.length === 0) return null;

  const provider = providers[providerIndex % providers.length];
  providerIndex++;
  return provider;
}

function parseJsonSafe(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const providers = getProviders();

  if (providers.length === 0) {
    return NextResponse.json(
      { error: "No AI providers configured. Set GROQ_API_KEY or NARAROUTER_API_KEY in your .env file." },
      { status: 503 }
    );
  }

  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Text must be at least 10 characters" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const prompt = `You are an expert AI content detector. Analyze the following text and determine if it was written by AI or a human.

Text to analyze:
"""${trimmedText}"""

Respond ONLY with valid JSON in this exact format:
{
  "aiProbability": <number 0-100>,
  "humanProbability": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation of why>",
  "indicators": ["<list of AI-like patterns found or empty array>"]
}`;

    let lastError: string | null = null;

    for (let attempt = 0; attempt < providers.length; attempt++) {
      const provider = getNextProvider();
      if (!provider) break;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              {
                role: "system",
                content: "You are an AI content detection expert. Analyze text for patterns typical of AI-generated content including: overly formal structure, repetitive phrasing, lack of personal voice, uniform sentence length, excessive use of transition words, and unnatural vocabulary. Always respond with valid JSON only.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const content = (data.choices?.[0]?.message?.content || "").trim();

          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            lastError = `Provider ${provider.name} returned non-JSON response`;
            continue;
          }

          const result = parseJsonSafe(jsonMatch[0]);
          const aiProbability = Math.min(100, Math.max(0, Number(result.aiProbability) || 50));
          const humanProbability = Math.min(100, Math.max(0, Number(result.humanProbability) || 50));
          const confidence = Math.min(100, Math.max(0, Number(result.confidence) || 0));
          const reasoning = String(result.reasoning || "AI detection analysis completed");
          const indicators = Array.isArray(result.indicators) ? result.indicators : [];

          trackToolUsage("detect").catch(() => {});

          return NextResponse.json({
            aiProbability,
            humanProbability,
            confidence,
            reasoning,
            indicators,
            poweredBy: provider.name,
          });
        }

        const rawText = await res.text();
        const error = parseJsonSafe(rawText);
        lastError = error.error?.message || error.detail?.message || `Provider ${provider.name} returned status ${res.status}`;

        if (res.status === 429) {
          console.log(`Rate limited on ${provider.name}, trying next provider...`);
          continue;
        }

        throw new Error(lastError || "Unknown error");
      } catch (e: any) {
        if (e.message?.includes("rate limit") || e.message?.includes("429")) {
          continue;
        }
        lastError = e.message || String(e);
        console.error(`Error with provider ${provider.name}:`, e);
      }
    }

    return NextResponse.json(
      { error: "All providers failed. " + (lastError || "Unknown error") },
      { status: 429 }
    );
  } catch (error: any) {
    console.error("Detect API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect text" },
      { status: 500 }
    );
  }
}
