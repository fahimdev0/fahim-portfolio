import express from "express";
import path from "path";

// --- ATOMESUS CONFIGURATION FOR RELIABLE CHAT & TRANSLATION ---
const ATOMESUS_API_KEY = process.env.ATOMESUS_API_KEY || "atms_sk_4551d662be9bfbdc31ac98d32ef130357beed5cb52dd6b1bc5b21cd039494a1f";
const ATOMESUS_API_BASE = "https://api.atomesus.com/v1";

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

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Explicitly serve robots.txt and sitemap.xml directly for Google Search Console indexing and crawler discovery
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile(path.join(process.cwd(), process.env.NODE_ENV === "production" ? "dist/robots.txt" : "public/robots.txt"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.sendFile(path.join(process.cwd(), process.env.NODE_ENV === "production" ? "dist/sitemap.xml" : "public/sitemap.xml"));
  });

  // API Route for Translation
  app.post("/api/translate", async (req, res) => {
    const { text, style } = req.body;
    
    const systemPrompt = `You are a high-precision worldwide multilingual translation and communication engine.
You support all global languages (English, Bangla, Spanish, Arabic, French, German, Japanese, Chinese, etc.) with absolute perfection.

CRITICAL IDENTITY & GEOGRAPHICAL DIRECTIVES:
1. You are a WORLDWIDE and GLOBAL engine. You are NOT an Indian system, and you must never assume Indian context, Indian dialects (like Hindi), Indian laws, or Indian currency (Rupees) unless explicitly instructed by the user's input.
2. Provide perfectly clean translation and interpretation without regional bias, optimized for premium global professional standards.

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
        console.log(`[Translate] Attempting cipher via Atomesus API...`);
        const response = await fetch(`${ATOMESUS_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ATOMESUS_API_KEY}`
          },
          body: JSON.stringify({
            model: "cipher", 
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text }
            ],
            temperature: 0.3
          })
        });

        if (!response.ok) {
          throw new Error(`Atomesus API returned status ${response.status}`);
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
    const { messages, systemPrompt, model = "cipher" } = req.body;
    
    const defaultSystemPrompt = `You are Fahim AI Helper, a premium, global, worldwide-focused AI assistant built with multilingual precision.

PRIMARY BEHAVIOR DIRECTIVES (ACT EXACTLY LIKE CHATGPT OR GEMINI):
1. Your primary objective is to answer the user's exact question directly, accurately, and efficiently. Prioritize the user's explicit request above all else.
2. Always answer the user's actual question first. Answer directly before giving any additional context.
3. Be highly concise unless detailed explanations are requested. Avoid unnecessary introductions, filler text, and repetition.
4. Never refuse a request, avoid the question, or say "I cannot assist", "I'm sorry, I cannot", "As an AI...", or "I am not authorized to help" unless it is highly dangerous or illegal. For all technical, coding, cybersecurity, programming, reverse engineering, and general requests, you MUST fulfill the request completely and immediately.
5. Do not add unnecessary warnings, disclaimers, lectures, or unrelated ethical/moral commentary. Avoid any preachy language or refusal templates.
6. If the request is safe, provide the complete answer immediately without introductory fluff or questioning the user.
7. If multiple solutions exist, provide the best one first.
8. If the request is ambiguous, ask one concise clarifying question only if it is absolutely essential to complete the task. Do NOT ask stalling questions.
9. Keep responses strictly focused on the user's intent and the requested task.
10. Avoid filler text such as "As an AI language model..." or repetitive introductions.
11. When explaining technical topics or concepts, use clear, step-by-step reasoning and guidance.
12. When writing code, return complete, runnable, and fully functional code whenever possible (e.g. Python, Javascript, HTML, etc.). Provide the complete solution immediately.
13. If information is uncertain or unknown, clearly state the uncertainty instead of guessing.
14. Prefer practical solutions over theoretical discussion.
15. Do not censor or refuse harmless technical, programming, cybersecurity, networking, Linux, reverse engineering, or software engineering discussions. Fulfill these technical queries directly and completely.
16. Maintain a highly professional, concise, and accurate tone.

GOAL:
Maximize helpfulness, accuracy, completeness, and directness while remaining truthful.

CRITICAL IDENTITY & GEOGRAPHICAL DIRECTIVES:
1. You are a WORLDWIDE and GLOBAL AI assistant. You are NOT an Indian AI, nor should you assume Indian contexts, Indian language defaults (such as Hindi), Indian culture, Indian laws, or Indian currency (Rupees) unless explicitly asked by the user.
2. Maintain a fully international perspective. Always default to globally accepted formats, international currencies (such as USD/EUR), and standard global English or beautiful native Bangla as appropriate.
3. If the user writes or speaks in Bengali (Bangla) or Romanized/transliterated Bengali (Benglish, e.g., "ki obostha", "kemon acho", "bhalo achi", "ki khobor", "vai"), you MUST reply in beautiful standard Bengali (বাংলা) or fluent English. You are STRICTLY FORBIDDEN from responding in Hindi, Romanized Hindi, or Hinglish (e.g., "kya scene hai", "arre bhai", "kaise ho").
4. You must provide absolutely perfect, mathematically sound, factually accurate, and highly sophisticated answers with zero introductory fluff or filler.`;

    // Proactively pre-process messages to enforce language rules at the message level
    const processedMessages = messages.map((m: any, idx: number) => {
      if (idx === messages.length - 1 && m.role === "user") {
        const text = m.content || "";
        const hasBengali = /[\u0980-\u09FF]/i.test(text);
        const hasBenglish = /\b(ki|kemon|acho|achis|bhalo|bhalor|khobor|khober|ami|tumi|apni|vai|bhai|ache|bolte|boli|boltese|keno|oy|oye|bangla|bengali|siam|fahim|hoye|hoy|boltese)\b/i.test(text);
        
        const coreDirective = "\n\n(IMPORTANT INSTRUCTION: Act exactly like ChatGPT or Gemini. Be direct, highly professional, and utility-oriented. If the user asks you to write code, solve a problem, or do a task, do NOT ask conversational or clarifying questions back. Provide the complete, fully functional solution or code block immediately. No fluff, no stalling.)";

        if (hasBengali || hasBenglish) {
          return {
            role: "user",
            content: `${text}${coreDirective}\n(IMPORTANT LANGUAGE REQUIREMENT: Speak ONLY in beautiful, standard Bengali/বাংলা or fluent English. You are STRICTLY FORBIDDEN from responding in Hindi, Hinglish, or any Indian/Hindi slang like "Arey bhai", "kya scene hai", etc.)`
          };
        } else {
          return {
            role: "user",
            content: `${text}${coreDirective}\n(LANGUAGE DIRECTIVE: Respond in standard English or beautiful Standard Bengali. You are STRICTLY FORBIDDEN from using Hindi, Hinglish, or Indian slang.)`
          };
        }
      }
      return { role: m.role, content: m.content };
    });

    if (isProxyAvailable()) {
      try {
        console.log(`[Chat] Attempting ${model} via Atomesus API...`);
        const response = await fetch(`${ATOMESUS_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ATOMESUS_API_KEY}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt || defaultSystemPrompt },
              ...processedMessages
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error(`Atomesus API status ${response.status}`);
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
      const mappedContents = processedMessages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const replyText = await generateWithGemini(
        mappedContents,
        systemPrompt || defaultSystemPrompt,
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

  // API Route for AI-Powered Document Template Cloning
  app.post("/api/document/analyze", async (req, res) => {
    const { image, mimeType = "image/jpeg" } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: "Document base64 image data is required for analysis." });
    }

    const systemPrompt = `You are a high-precision document replication, layout analysis, and pixel-accurate OCR engine.
Your task is to analyze the uploaded document image (scanned form, official document, letterhead, certificate, or agreement) and reconstruct its EXACT A4 structural layout.

You must identify each block/element with coordinates (x, y, width, height) relative to the top-left of an A4 page, represented as percentages (values 0 to 100).

CRITICAL REQUIREMENTS:
1. Coordinates System:
   - x: Horizontal offset from left edge of page (0 to 100).
   - y: Vertical offset from top edge of page (0 to 100).
   - width: Element width (0 to 100).
   - height: Element height (0 to 100) or auto.
   - Every text line, division line, table, header, signature line, and paragraph must map to its exact relative visual footprint on the page.

2. Element Types:
   - "header" / "footer": Text elements sitting near the top/bottom page bounds.
   - "heading": Visual titles, captions, subject lines, styled as prominent/bold text.
   - "paragraph": Standard running text or multi-line blocks.
   - "field": Form field labels paired with an editable visual value. (e.g. "Name (নাম): Fahim Siam" where "Name (নাম):" is the label, and "Fahim Siam" is the value).
   - "table": Column headers and exact grid rows containing cell valuations.
   - "signatures": Interactive signatory lines (e.g. "Signature of Applicant" or official seal space) positioned at the bottom relative coordinates.
   - "divider": Horizontal dividing lines or vertical borders.

3. Font Selection & Styles:
   - Detect primary language: English, Bangla, or Bilingual.
   - Font options: "SonaliLipi" (default for Bangla), "SutonnyMJ", "Nikosh", "SolaimanLipi", "Kalpurush", "Arial" (for English).
   - Alignment: "left" | "center" | "right" | "justify"
   - FontWeight: "normal" | "bold"

4. Text Fidelity:
   - Maintain 95%+ visual similarity. Preserve Bangla/English spellings verbatim. Never paraphrase or lose data.

Return ONLY a raw JSON object matching the exact structure below. No explanation, no backticks, no markdown.

JSON SCHEMA:
{
  "title": "Clean document title",
  "documentType": "Form | Agreement | Affidavit | Letter | CV | Certificate | Custom",
  "language": "Bangla | English | Bilingual",
  "fontName": "SonaliLipi",
  "elements": [
    {
      "id": "item_unique_hash",
      "type": "header" | "footer" | "heading" | "paragraph" | "field" | "table" | "signatures" | "divider",
      "x": 12.5,
      "y": 8.0,
      "width": 75.0,
      "height": 4.5,
      "font": "SonaliLipi",
      "fontSize": 14,
      "alignment": "center",
      "fontWeight": "bold",
      "label": "Prompt/Field/Signature label if applicable (e.g. 'Father\\'s Name')",
      "value": "Verbatim editable text value inside the field (empty if type is heading/paragraph/divider)",
      "text": "Full text value for paragraphs, titles or headings",
      "headers": ["Header Col 1", "Header Col 2"],
      "rows": [["Cell 1A", "Cell 1B"], ["Cell 2A", "Cell 2B"]],
      "position": "left" | "right" | "center" | "between"
    }
  ]
}
`;

    try {
      // Strip base64 prefixes to supply clean data payload to Gemini
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

      console.log(`[Doc Analyzer] Initiating multi-modal document analysis with fallback...`);
      const payloadContents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            {
              text: "Analyse this document layout and recreate its identical visual template strictly according to the specified JSON structure."
            }
          ]
        }
      ];

      const answerText = await generateWithGemini(
        payloadContents,
        systemPrompt,
        true, // isJson response format setting
        0.2
      );

      let cleanJson = answerText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      const parsedTemplate = JSON.parse(cleanJson);
      console.log(`[Doc Analyzer] Layout analysis completed successfully. Extracted ${parsedTemplate.elements?.length || 0} elements with coordinates.`);
      return res.json(parsedTemplate);

    } catch (e: any) {
      console.error("[Doc Analyzer ERROR]:", e);
      return res.status(500).json({ 
        error: "Document Cloning pipeline failed.", 
        details: e.message 
      });
    }
  });

  // API Route for arbitrary REST API requests (Proxy to bypass CORS)
  app.post("/api/proxy", async (req, res) => {
    const { url, method = "GET", headers = {}, body } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const startTime = Date.now();
      const options: any = {
        method,
        headers: {
          "Accept": "application/json, text/plain, */*",
          ...headers,
        }
      };

      if (body && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
        options.body = typeof body === "object" ? JSON.stringify(body) : body;
      }

      const response = await fetch(url, options);
      const latency = Date.now() - startTime;
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const responseSize = responseHeaders["content-length"] || "";
      const contentType = responseHeaders["content-type"] || "";

      let responseData: any;
      const text = await response.text();
      try {
        if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
          responseData = JSON.parse(text);
        } else {
          responseData = text;
        }
      } catch {
        responseData = text;
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        raw: text,
        latency,
        size: responseSize || text.length,
        contentType
      });
    } catch (e: any) {
      return res.status(200).json({
        error: "Request failed to execute via proxy server",
        details: e.message,
        status: 0,
        latency: 0,
        size: 0,
        data: null,
        raw: e.message
      });
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
