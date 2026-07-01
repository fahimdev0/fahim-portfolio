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
  const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"];
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

  const { messages, systemPrompt, model = "cipher", attachments = [] } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing required array 'messages' in body." });
  }

  // Intercept the last user message to append strict language instructions
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user") {
      const contentLower = lastMsg.content.toLowerCase();
      const isBangla = /[\u0980-\u09FF]/.test(lastMsg.content) || 
        /\b(obostha|kemon|acho|bhalo|valo|khobor|bhai|vai|koro|ki|korco|amar|tumi|apni|hoiche|hoy|ase|ache|bengali|bangla|bengal|boli|boltese|bolse)\b/.test(contentLower);
      
      const coreDirective = "\n\n(IMPORTANT INSTRUCTION: Act exactly like ChatGPT or Gemini. Be direct, highly professional, and utility-oriented. If the user asks you to write code, solve a problem, or do a task, do NOT ask conversational or clarifying questions back. Provide the complete, fully functional solution or code block immediately. No fluff, no stalling.)";

      if (isBangla) {
        lastMsg.content += `${coreDirective}\n(Important instruction for your response: Speak ONLY in beautiful Standard Bengali (বাংলা) or English. You are strictly forbidden from using Hindi, Hinglish, or Romanized Hindi slang like 'arey bhai', 'kya scene', 'tu bata' etc.)`;
      } else {
        lastMsg.content += `${coreDirective}\n(Important instruction for your response: Respond in professional English or beautiful Standard Bengali. Absolutely NO Hindi, Hinglish, or Indian slang.)`;
      }
    }
  }

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

  const evomapModelCandidates: Record<string, string[]> = {
    "gemini31pro": [
      "Gemini 3.1 Pro • Google",
      "Gemini 3.1 Pro",
      "gemini-3.1-pro",
      "Gemini-3.1-Pro",
      "gemini31pro"
    ],
    "claudeopus48": [
      "Claude Opus 4.8",
      "Claude Opus 4.8 • Anthropic",
      "claude-opus-4.8",
      "claudeopus48"
    ],
    "claudeopus47": [
      "Claude Opus 4.7",
      "Claude Opus 4.7 • Anthropic",
      "claude-opus-4.7",
      "claudeopus47"
    ],
    "glm51": [
      "GLM 5.1",
      "Glm 5.1",
      "glm-5.1",
      "glm51"
    ],
    "gpt55": [
      "GPT 5.5",
      "Gpt 5.5",
      "gpt-5.5",
      "GPT 5.5 • OpenAI",
      "gpt55"
    ],
    "kimik26": [
      "Kimi K2.6 • Moonshot",
      "Kimi K2.6",
      "Kimi-K2.6",
      "kimi-k2.6",
      "kimi",
      "Kimi",
      "kimik26"
    ],
    "glm52": [
      "GLM 5.2",
      "Glm 5.2",
      "glm-5.2",
      "glm52"
    ],
    "gpt54": [
      "GPT 5.4",
      "Gpt 5.4",
      "gpt-5.4",
      "GPT 5.4 • OpenAI",
      "gpt54"
    ]
  };

  const normalizedKey = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isEvomapModel = evomapModelCandidates[normalizedKey] !== undefined;

  if (isEvomapModel) {
    try {
      console.log(`[Serverless-Chat] Routing query to Evomap Gateway for model key: ${normalizedKey}...`);
      const evomapApiKey = process.env.EVOMAP_API_KEY || 
        Buffer.from("c2stZXZvbWFwLWJma2N6a2FuemFib2I4cmgxM2M2Nzk2ODQ0MWE0Y2RmYTVlOTM1MDg2ODMxMWE5Mg==", "base64").toString("utf-8");

      const candidates = [...evomapModelCandidates[normalizedKey]];
      const fallbackModels = [
        "Gemini 3.1 Pro • Google",
        "Gemini 3.1 Pro",
        "GLM 5.1",
        "GPT 5.5"
      ];
      
      // Merge unique premium fallbacks to ensure we always get a response even if Kimi/GLM are token-restricted
      for (const fallback of fallbackModels) {
        if (!candidates.includes(fallback)) {
          candidates.push(fallback);
        }
      }

      let success = false;
      let data: any = null;

      for (const candidate of candidates) {
        try {
          console.log(`[Serverless-Chat] Attempting Evomap call with candidate model: "${candidate}"...`);
          const response = await fetch("https://api.evomap.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${evomapApiKey}`
            },
            body: JSON.stringify({
              model: candidate,
              messages: [
                { role: "system", content: systemPrompt || defaultSystemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content }))
              ],
              temperature: 0.7,
              max_tokens: 2000
            })
          });

          if (response.ok) {
            data = await response.json();
            success = true;
            console.log(`[Serverless-Chat] Evomap Gateway call succeeded using model: "${candidate}"`);
            break;
          } else {
            const errText = await response.text();
            console.warn(`[Serverless-Chat Evomap Warning] Candidate "${candidate}" failed with status ${response.status}: ${errText}`);
          }
        } catch (err: any) {
          console.error(`[Serverless-Chat Evomap Error] Exception for candidate "${candidate}":`, err.message);
        }
      }

      if (!success || !data) {
        throw new Error("All Evomap model candidates failed to return a valid response.");
      }

      const contentText = data.choices?.[0]?.message?.content || "";

      return res.status(200).json({
        choices: [
          {
            message: {
              role: "assistant",
              content: contentText
            }
          }
        ]
      });
    } catch (error: any) {
      console.error(`[Serverless-Chat Evomap Failover] Evomap API completely failed for ${model}:`, error);
      // Let it fall through
    }
  }

  if (model === "claude") {
    try {
      console.log(`[Serverless-Chat] Routing query directly to Claude Sonnet...`);
      const claudeApiKey = process.env.CLAUDE_API_KEY || 
        Buffer.from("c2stYW50LWFwaTAzLU9JUlk2cktxekE5UlpvX1NqaWtHRENfTTd5N2dSWlVJVmtheEI1eXlCVlhBb3hCSmJXSEZiSm9hLThaTUVqNXFQTDFQUFhnLUxIcmw3TS1nTU9GLW1BLTVYVWk0UUFB", "base64").toString("utf-8");
      
      const claudeMessages = messages.map((m: any, idx: number) => {
        if (idx === messages.length - 1 && attachments && attachments.length > 0) {
          const contentBlocks: any[] = [];
          
          attachments.forEach((att: any) => {
            if (att.type?.startsWith("image/") && att.previewUrl) {
              const match = att.previewUrl.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                let mediaType = match[1];
                const base64Data = match[2];
                const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                if (!allowedTypes.includes(mediaType)) {
                  mediaType = "image/jpeg";
                }
                contentBlocks.push({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data
                  }
                });
              }
            }
          });
          
          contentBlocks.push({
            type: "text",
            text: m.content
          });
          
          return {
            role: m.role === "assistant" ? "assistant" : "user",
            content: contentBlocks
          };
        }
        
        return {
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        };
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: systemPrompt || defaultSystemPrompt,
          messages: claudeMessages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API returned status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      const contentText = data.content?.[0]?.text || "";
      
      return res.status(200).json({
        choices: [
          {
            message: {
              role: "assistant",
              content: contentText
            }
          }
        ]
      });
    } catch (error: any) {
      console.error("[Serverless-Chat Claude Failover] Claude API failed:", error);
    }
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
            { role: "system", content: systemPrompt || defaultSystemPrompt },
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
    const mappedContents = messages.map((m: any, idx: number) => {
      const parts: any[] = [];
      
      if (idx === messages.length - 1 && attachments && attachments.length > 0) {
        attachments.forEach((att: any) => {
          if (att.type?.startsWith("image/") && att.previewUrl) {
            const match = att.previewUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              const mediaType = match[1];
              const base64Data = match[2];
              parts.push({
                inlineData: {
                  mimeType: mediaType,
                  data: base64Data
                }
              });
            }
          }
        });
      }
      
      parts.push({ text: m.content });
      
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: parts
      };
    });

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

    return res.status(200).json(formattedResponse);
  } catch (geminiError: any) {
    console.error("Both Serverless DeepSeek and Gemini fallback pipeline failed for chat:", geminiError);
    return res.status(500).json({ error: "Chat completely failed", details: geminiError.message });
  }
}
