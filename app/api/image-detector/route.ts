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
      name: "Groq AI (Vision)",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: GROQ_API_KEY,
      model: "llama-3.2-90b-vision-preview",
    });
  }

  if (NARAROUTER_API_KEY) {
    providers.push({
      name: "NaraRouter (Vision)",
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
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    const prompt = `You are an expert AI image detector. Analyze this image carefully and determine if it was AI-generated or a real photograph.

Look for:
- Unnatural artifacts, distortions, or inconsistencies
- Overly perfect symmetry or uniformity
- Weird hands, faces, or objects
- Strange textures or patterns
- Signs of digital manipulation
- Watermarks or signatures from AI generators

Respond ONLY with valid JSON in this exact format:
{
  "aiProbability": <number 0-100>,
  "humanProbability": <number 0-100>,
  "confidence": "<low|medium|high>",
  "assessment": "<brief explanation of why>",
  "indicators": ["<list of AI-like patterns found or empty array>"],
  "entropy": <number 0-10>,
  "patterns": {
    "repetitiveStructures": <number 0-100>,
    "symmetryScore": <number 0-100>,
    "textureUniformity": <number 0-100>
  },
  "artifacts": {
    "watermarkPatterns": <boolean>,
    "noisePatterns": <boolean>,
    "compressionArtifacts": <boolean>
  }
}`;

    let lastError: string | null = null;

    for (let attempt = 0; attempt < providers.length; attempt++) {
      const provider = getNextProvider();
      if (!provider) break;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const requestBody: any = {
          model: provider.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        };

        const res = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
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
          const confidence = String(result.confidence || "medium");
          const assessment = String(result.assessment || "AI detection analysis completed");
          const indicators = Array.isArray(result.indicators) ? result.indicators : [];
          const entropy = Math.min(10, Math.max(0, Number(result.entropy) || 5));
          const patterns = result.patterns || {};
          const artifacts = result.artifacts || {};

          return NextResponse.json({
            aiProbability,
            humanProbability,
            confidence,
            assessment,
            indicators,
            entropy,
            patterns: {
              repetitiveStructures: Math.min(100, Math.max(0, Number(patterns.repetitiveStructures) || 0)),
              symmetryScore: Math.min(100, Math.max(0, Number(patterns.symmetryScore) || 0)),
              textureUniformity: Math.min(100, Math.max(0, Number(patterns.textureUniformity) || 0)),
            },
            artifacts: {
              watermarkPatterns: Boolean(artifacts.watermarkPatterns),
              noisePatterns: Boolean(artifacts.noisePatterns),
              compressionArtifacts: Boolean(artifacts.compressionArtifacts),
            },
            filename: file.name,
            size: file.size,
            poweredBy: provider.name,
          });

          trackToolUsage("image-detector").catch(() => {});
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
    console.error("Image detection API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect image" },
      { status: 500 }
    );
  }
}
