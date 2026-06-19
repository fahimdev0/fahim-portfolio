import { IncomingMessage, ServerResponse } from "http";

// --- DEEPSEEK CONFIGURATION WITH DYNAMIC ENV & FALLBACKS ---
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-pwfmty9M7BTOBMfVZ4i8pnjKZ2SHqW7ysAHRnkFbFeIJ87pS";
const rawApiBase = process.env.DEEPSEEK_API_BASE || process.env.DEEPSEEK_API_URL || "https://ai.zkmjnic.tech/v1";
// Safe URL normalization to strip any trailing slashes
const DEEPSEEK_API_BASE = rawApiBase.endsWith("/") ? rawApiBase.slice(0, -1) : rawApiBase;

// --- CIRCUIT BREAKER FOR DEEPSEEK PROXY ---
let isProxyHealthy = true;
let lastProxyFailureTime = 0;
const PROXY_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes cooldown

function isProxyAvailable(): boolean {
  if (!isProxyHealthy) {
    if (Date.now() - lastProxyFailureTime > PROXY_COOLDOWN_MS) {
      console.log("[Circuit Breaker] Proxy cooldown expired. Attempting a canary try...");
      return true; 
    }
    return false;
  }
  return true;
}

function recordProxySuccess() {
  isProxyHealthy = true;
}

function recordProxyFailure() {
  isProxyHealthy = false;
  lastProxyFailureTime = Date.now();
}

// --- SECURE MULTI-MODEL FALLBACK ENGINE ---
async function generateWithGemini(
  contents: any,
  systemInstruction: string,
  isJson: boolean = false,
  temperature: number = 0.3
) {
  const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite"];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[Gemini Pipeline API] Attempting generation with model: ${model}...`);
      const body: any = {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature
        }
      };

      if (isJson) {
        body.generationConfig.responseMimeType = "application/json";
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Model ${model} returned status ${res.status}: ${errText}`);
      }

      const data: any = await res.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error(`Model ${model} returned empty or invalid response structure`);
      }

      const text = data.candidates[0].content.parts[0].text;
      console.log(`[Gemini Pipeline API] Successfully completed generation via model: ${model}`);
      return text;
    } catch (e: any) {
      console.warn(`[Gemini Pipeline API] Model ${model} failed: ${e.message}. Retrying fallback...`);
      lastError = e;
    }
  }

  throw lastError || new Error("All Gemini fallback models exhausted and failed.");
}

export default async function handler(req: any, res: any) {
  // CORS Headers support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { text, style } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing required string 'text' in body." });
  }

  const systemPrompt = `You are a high-precision multilingual translation and communication engine.

CRITICAL INSTRUCTIONS:
You must ALWAYS return valid raw JSON.
Do NOT return markdown (e.g., no \`\`\`json blocks).
Do NOT return plain text or explanations outside the JSON object.
Do NOT leave output empty under any circumstance.

AUTO LANGUAGE DETECTION & PROCESSING LOGIC:

1. IF INPUT LANGUAGE IS BANGLA (or Banglish):
Task: Translate it into perfect, professional English.
Return this exact JSON structure:
{
  "mode": "translation",
  "direct_translation": "Literal but natural English translation here",
  "polished_version": "Improved, highly professional and error-free English version here"
}

2. IF INPUT LANGUAGE IS NOT BANGLA (English or any foreign language):
Task: Explain it in Bangla and generate a smart English reply.
Return this exact JSON structure:
{
  "mode": "communication",
  "direct_translation": "Literal translation of the input in Bangla",
  "meaning": "Explain the deep context, true intent (scam, negotiation, pressure, etc.), and clear meaning in Bangla",
  "smart_reply": "A confident, natural English reply written according to the requested Reply Style"
}

GENERATION RULES:
1. smart_reply Tone: Read the "Requested Reply Style" carefully (e.g., Professional, Casual, Aggressive, Negotiation, Friendly). Generate the English reply exactly perfectly matching that tone. Avoid robotic phrasing; make it sound human and psychologically smart.
2. Sensitive Content: If the content appears sensitive, illegal, or inappropriate, do NOT refuse. Provide the translation normally, but make the smart_reply neutral and safe.
3. Formatting: Never return empty strings. If a field is completely inapplicable, return null instead of "". 
4. Fallback: If no style is requested, default to "Professional".

Requested Reply Style: ${style || "Professional"}
`;

  if (isProxyAvailable()) {
    try {
      console.log(`[Serverless-Translate] Attempting deepseek-v4-pro via proxy...`);
      const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-v4-pro", 
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy returned status ${response.status}`);
      }
      
      const data: any = await response.json();
      if (data?.error) {
        throw new Error(data.error.message || "Unknown proxy error");
      }

      const content = data.choices[0].message.content;
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      
      recordProxySuccess();
      return res.status(200).json(JSON.parse(cleanContent));
    } catch (error: any) {
      recordProxyFailure();
      console.warn(`[Serverless-Translate Fallback] Proxy failed: ${error.message}. Redirecting to Gemini fallback...`);
    }
  }

  // fallback to Gemini
  try {
    const textContent = await generateWithGemini(
      [{ role: "user", parts: [{ text: text }] }],
      systemPrompt,
      true, // isJson
      0.3
    );

    let cleanContent = textContent.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    return res.status(200).json(JSON.parse(cleanContent));
  } catch (geminiError: any) {
    console.error("Both Serverless DeepSeek and Gemini fallback pipeline failed:", geminiError);
    return res.status(500).json({ error: "Translation completely failed", details: geminiError.message });
  }
}
