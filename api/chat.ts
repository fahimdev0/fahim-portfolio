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
  temperature: number = 0.7
) {
  const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite"];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[Gemini Pipeline Chat API] Attempting generation with model: ${model}...`);
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
      console.log(`[Gemini Pipeline Chat API] Successfully completed generation via model: ${model}`);
      return text;
    } catch (e: any) {
      console.warn(`[Gemini Pipeline Chat API] Model ${model} failed: ${e.message}. Retrying fallback...`);
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

  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing required array 'messages' in body." });
  }

  if (isProxyAvailable()) {
    try {
      console.log(`[Serverless-Chat] Attempting deepseek-v4-pro via proxy...`);
      const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-v4-pro",
          messages: [
            { role: "system", content: systemPrompt || "You are Fahim AI Helper, an advanced intelligent assistant." },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy status ${response.status}`);
      }

      const data: any = await response.json();
      if (data?.error) {
        throw new Error(data.error.message || "Unknown proxy error");
      }

      recordProxySuccess();
      return res.status(200).json(data);
    } catch (error: any) {
      recordProxyFailure();
      console.warn(`[Serverless-Chat Fallback] Proxy failed: ${error.message}. Redirecting to Gemini fallback...`);
    }
  }

  // fallback to Gemini
  try {
    const mappedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const replyText = await generateWithGemini(
      mappedContents,
      systemPrompt || "You are Fahim AI Helper, an advanced intelligent assistant.",
      false, // isJson
      0.7
    );

    const formattedResponse = {
      choices: [
        {
          message: {
            role: "assistant",
            content: replyText
          }
        }
      ]
    };

    return res.status(200).json(formattedResponse);
  } catch (geminiError: any) {
    console.error("Both Serverless DeepSeek and Gemini fallback pipeline failed for chat:", geminiError);
    return res.status(500).json({ error: "Chat completely failed", details: geminiError.message });
  }
}
