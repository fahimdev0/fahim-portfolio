import express from "express";
import path from "path";

// --- DEEPSEEK CONFIGURATION WITH DYNAMIC ENV & FALLBACKS ---
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-pwfmty9M7BTOBMfVZ4i8pnjKZ2SHqW7ysAHRnkFbFeIJ87pS";
const rawApiBase = process.env.DEEPSEEK_API_BASE || process.env.DEEPSEEK_API_URL || "https://ai.zkmjnic.tech/v1";
// Safe URL normalization to strip any trailing slashes
const DEEPSEEK_API_BASE = rawApiBase.endsWith("/") ? rawApiBase.slice(0, -1) : rawApiBase;

// --- CIRCUIT BREAKER FOR DEEPSEEK PROXY ---
let isProxyHealthy = true;
let lastProxyFailureTime = 0;
const PROXY_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes cooldown

/**
 * Checks if the proxy is deemed healthy. If it was marked unhealthy less than
 * PROXY_COOLDOWN_MS ago, this returns false, allowing us to completely bypass 
 * the slow failing request and route directly to Gemini.
 */
function isProxyAvailable(): boolean {
  if (!isProxyHealthy) {
    if (Date.now() - lastProxyFailureTime > PROXY_COOLDOWN_MS) {
      console.log("[Circuit Breaker] Proxy cooldown expired. Attempting a canary try...");
      return true; // Allow try/half-open state
    }
    return false;
  }
  return true;
}

function recordProxySuccess() {
  if (!isProxyHealthy) {
    console.log("[Circuit Breaker] Proxy successfully recovered. Closing circuit.");
  }
  isProxyHealthy = true;
}

function recordProxyFailure() {
  if (isProxyHealthy) {
    console.warn("[Circuit Breaker] Proxy tripped! Directing traffic directly to Gemini for the next 3 mins.");
  }
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
      console.log(`[Gemini Pipeline] Attempting generation with model: ${model}...`);
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
        throw new Error(`Model ${model} returned empty or invalid response structure: ${JSON.stringify(data)}`);
      }

      const text = data.candidates[0].content.parts[0].text;
      console.log(`[Gemini Pipeline] Successfully completed generation via model: ${model}`);
      return text;
    } catch (e: any) {
      console.warn(`[Gemini Pipeline] Model ${model} failed: ${e.message}. Retrying fallback...`);
      lastError = e;
    }
  }

  throw lastError || new Error("All Gemini fallback models exhausted and failed.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Translation
  app.post("/api/translate", async (req, res) => {
    const { text, style } = req.body;
    
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
        console.log(`[Translate] Attempting deepseek-v4-pro via proxy...`);
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
        return res.json(JSON.parse(cleanContent));
      } catch (error: any) {
        recordProxyFailure();
        console.warn(`[Translate Failover] Proxy failed: ${error.message}. Redirecting to Gemini fallback...`);
      }
    } else {
      console.log(`[Translate Circuit Open] Skipping proxy. Directing directly to Gemini pipeline...`);
    }

    // fallback / circuit-breaker directly calls Gemini
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

      return res.json(JSON.parse(cleanContent));
    } catch (geminiError: any) {
      console.error("Both DeepSeek proxy and whole Gemini fallback pipeline failed:", geminiError);
      return res.status(500).json({ error: "Translation completely failed", details: geminiError.message });
    }
  });

  // API Route for AI Helper Chat
  app.post("/api/chat", async (req, res) => {
    const { messages, systemPrompt } = req.body;
    
    if (isProxyAvailable()) {
      try {
        console.log(`[Chat] Attempting deepseek-v4-pro via proxy...`);
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
        return res.json(data);
      } catch (error: any) {
        recordProxyFailure();
        console.warn(`[Chat Failover] Proxy failed: ${error.message}. Redirecting to Gemini fallback...`);
      }
    } else {
      console.log(`[Chat Circuit Open] Skipping proxy. Directing directly to Gemini pipeline...`);
    }

    // fallback / circuit-breaker directly calls Gemini
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

      return res.json(formattedResponse);
    } catch (geminiError: any) {
      console.error("Both DeepSeek and Gemini fallback pipeline failed for chat:", geminiError);
      return res.status(500).json({ error: "Chat completely failed", details: geminiError.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
