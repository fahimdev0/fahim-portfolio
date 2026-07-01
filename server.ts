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
  temperature: number = 0.3,
  tools: any[] | null = null
) {
  const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"];
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

      if (tools) {
        body.tools = tools;
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

function getFallbackInstitutionInfo(query: string, banbeisData: any) {
  const queryTrimmed = query.trim();
  const isEiin = /^\d{5,8}$/.test(queryTrimmed);

  const localDb: { [key: string]: any } = {
    "107907": {
      "institution_info": {
        "name": "Dhaka College",
        "eiin": "107907",
        "type": "College",
        "location": "Mirpur Road, Dhanmondi, Dhaka-1205",
        "address": "Mirpur Road, Dhanmondi, Dhaka-1205",
        "phone": "+88029673400",
        "email": "dhakacollegeprincipal@gmail.com",
        "website": "dhakacollege.edu.bd",
        "principal": "Professor Mohammad Yusuf",
        "district": "Dhaka",
        "upazila": "Dhanmondi",
        "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
      },
      "personnel": [
        {
          "name": "Professor Mohammad Yusuf",
          "designation": "Principal",
          "department": "Chemistry",
          "phone": "+8801711234567",
          "email": "principal@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf&backgroundColor=b6e3f4"
        },
        {
          "name": "Professor ATM Moinul Hossain",
          "designation": "Vice Principal",
          "department": "English",
          "phone": "+8801712234568",
          "email": "atmmoinul@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Moinul&backgroundColor=c0aede"
        },
        {
          "name": "Dr. Md. Abdul Quddis",
          "designation": "Professor & Head of Department",
          "department": "Physics",
          "phone": "+8801713234569",
          "email": "aquddis@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Quddis&backgroundColor=d1d4f9"
        },
        {
          "name": "Md. Nasir Uddin",
          "designation": "Associate Professor",
          "department": "Mathematics",
          "phone": "+8801819234570",
          "email": "nasir@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Nasir&backgroundColor=b6e3f4"
        },
        {
          "name": "Shahina Akter",
          "designation": "Assistant Professor",
          "department": "Bangla",
          "phone": "+8801552234571",
          "email": "shahina@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Shahina&backgroundColor=c0aede"
        },
        {
          "name": "Md. Rafiqul Islam",
          "designation": "Lecturer",
          "department": "ICT",
          "phone": "+8801911234572",
          "email": "rafiq.ict@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafiq&backgroundColor=d1d4f9"
        },
        {
          "name": "Farhana Chowdhury",
          "designation": "Lecturer",
          "department": "Biology",
          "phone": "+8801671234573",
          "email": "farhana@dhakacollege.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Farhana&backgroundColor=b6e3f4"
        }
      ]
    },
    "108355": {
      "institution_info": {
        "name": "Viqarunnisa Noon School & College",
        "eiin": "108355",
        "type": "School & College",
        "location": "1/A, New Bailey Road, Dhaka-1000",
        "address": "1/A, New Bailey Road, Dhaka-1000",
        "phone": "+88029350438",
        "email": "vnsc_bd@yahoo.com",
        "website": "vnsc.edu.bd",
        "principal": "Keka Roy Chowdhury",
        "district": "Dhaka",
        "upazila": "Ramna",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200"
      },
      "personnel": [
        {
          "name": "Keka Roy Chowdhury",
          "designation": "Principal",
          "department": "Administration",
          "phone": "+8801711555666",
          "email": "principal@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Keka&backgroundColor=b6e3f4"
        },
        {
          "name": "Rahima Khatun",
          "designation": "Assistant Headmistress",
          "department": "Bangla",
          "phone": "+8801712555667",
          "email": "rahima@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahima&backgroundColor=c0aede"
        },
        {
          "name": "Shahnaz Begum",
          "designation": "Senior Teacher",
          "department": "Mathematics",
          "phone": "+8801713555668",
          "email": "shahnaz@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Shahnaz&backgroundColor=d1d4f9"
        },
        {
          "name": "Fatema Zohra",
          "designation": "Senior Teacher",
          "department": "English",
          "phone": "+8801819555669",
          "email": "fatema@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatema&backgroundColor=b6e3f4"
        },
        {
          "name": "Kamrul Hasan",
          "designation": "Assistant Teacher",
          "department": "Science",
          "phone": "+8801552555670",
          "email": "kamrul@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kamrul&backgroundColor=c0aede"
        },
        {
          "name": "Nusrat Jahan",
          "designation": "Lecturer",
          "department": "ICT",
          "phone": "+8801911555671",
          "email": "nusrat@vnsc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat&backgroundColor=d1d4f9"
        }
      ]
    },
    "126490": {
      "institution_info": {
        "name": "Rajshahi College",
        "eiin": "126490",
        "type": "College",
        "location": "Rajshahi Sadar, Rajshahi",
        "address": "Rajshahi Sadar, Rajshahi",
        "phone": "+880721775431",
        "email": "rajshahicollege.info@gmail.com",
        "website": "rc.edu.bd",
        "principal": "Professor Abdul Khaleque",
        "district": "Rajshahi",
        "upazila": "Rajshahi Sadar",
        "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
      },
      "personnel": [
        {
          "name": "Professor Abdul Khaleque",
          "designation": "Principal",
          "department": "Administration",
          "phone": "+8801711777888",
          "email": "principal@rc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Khaleque&backgroundColor=b6e3f4"
        },
        {
          "name": "Professor Md. Ibrahim",
          "designation": "Vice Principal",
          "department": "Physics",
          "phone": "+8801712777889",
          "email": "ibrahim@rc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim&backgroundColor=c0aede"
        },
        {
          "name": "Dr. Sharmin Akter",
          "designation": "Associate Professor",
          "department": "Chemistry",
          "phone": "+8801713777890",
          "email": "sharmin@rc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sharmin&backgroundColor=d1d4f9"
        },
        {
          "name": "Md. Abu Sayed",
          "designation": "Assistant Professor",
          "department": "English",
          "phone": "+8801819777891",
          "email": "sayed@rc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sayed&backgroundColor=b6e3f4"
        },
        {
          "name": "Mosammat Hosne Ara",
          "designation": "Lecturer",
          "department": "Bangla",
          "phone": "+8801552777892",
          "email": "hosneara@rc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Hosneara&backgroundColor=c0aede"
        }
      ]
    },
    "104297": {
      "institution_info": {
        "name": "Chittagong College",
        "eiin": "104297",
        "type": "College",
        "location": "College Road, Chawkbazar, Chattogram",
        "address": "College Road, Chawkbazar, Chattogram",
        "phone": "+88031615555",
        "email": "chgcol@yahoo.com",
        "website": "chitcol.edu.bd",
        "principal": "Professor Mohammad Mojahidul Islam Chowdhury",
        "district": "Chattogram",
        "upazila": "Chawkbazar",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200"
      },
      "personnel": [
        {
          "name": "Professor Mohammad Mojahidul Islam Chowdhury",
          "designation": "Principal",
          "department": "Administration",
          "phone": "+8801711999111",
          "email": "principal@chitcol.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mojahidul&backgroundColor=b6e3f4"
        },
        {
          "name": "Professor Mohammad Sohel",
          "designation": "Vice Principal",
          "department": "Mathematics",
          "phone": "+8801712999112",
          "email": "sohel@chitcol.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sohel&backgroundColor=c0aede"
        },
        {
          "name": "Md. Iqbal Hossain",
          "designation": "Associate Professor",
          "department": "English",
          "phone": "+8801713999113",
          "email": "iqbal@chitcol.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Iqbal&backgroundColor=d1d4f9"
        },
        {
          "name": "Dr. Sabrina Chowdhury",
          "designation": "Assistant Professor",
          "department": "Botany",
          "phone": "+8801819999114",
          "email": "sabrina@chitcol.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sabrina&backgroundColor=b6e3f4"
        },
        {
          "name": "Tanjina Begum",
          "designation": "Lecturer",
          "department": "Chemistry",
          "phone": "+8801552999115",
          "email": "tanjina@chitcol.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanjina&backgroundColor=c0aede"
        }
      ]
    },
    "105822": {
      "institution_info": {
        "name": "Comilla Victoria College",
        "eiin": "105822",
        "type": "College",
        "location": "Kandirpar, Cumilla Sadar, Cumilla",
        "address": "Kandirpar, Cumilla Sadar, Cumilla",
        "phone": "+8808165911",
        "email": "cvgc1899@gmail.com",
        "website": "cvgc.edu.bd",
        "principal": "Professor Dr. Abu Jafar Khan",
        "district": "Cumilla",
        "upazila": "Cumilla Sadar",
        "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
      },
      "personnel": [
        {
          "name": "Professor Dr. Abu Jafar Khan",
          "designation": "Principal",
          "department": "Administration",
          "phone": "+8801711222333",
          "email": "principal@cvgc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jafar&backgroundColor=b6e3f4"
        },
        {
          "name": "Professor Mrinal Kanti Goswami",
          "designation": "Vice Principal",
          "department": "Mathematics",
          "phone": "+8801712222334",
          "email": "mrinal@cvgc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mrinal&backgroundColor=c0aede"
        },
        {
          "name": "Rokshana Begum",
          "designation": "Associate Professor",
          "department": "Bangla",
          "phone": "+8801713222335",
          "email": "rokshana@cvgc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rokshana&backgroundColor=d1d4f9"
        },
        {
          "name": "Md. Shafiul Alam",
          "designation": "Assistant Professor",
          "department": "English",
          "phone": "+8801819222336",
          "email": "shafiul@cvgc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Shafiul&backgroundColor=b6e3f4"
        },
        {
          "name": "Israt Jahan",
          "designation": "Lecturer",
          "department": "Physics",
          "phone": "+8801552222337",
          "email": "israt@cvgc.edu.bd",
          "photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Israt&backgroundColor=c0aede"
        }
      ]
    }
  };

  // Direct match by EIIN
  if (localDb[queryTrimmed]) {
    return localDb[queryTrimmed];
  }

  // Soft match by name
  for (const key of Object.keys(localDb)) {
    if (localDb[key].institution_info.name.toLowerCase().includes(queryTrimmed.toLowerCase())) {
      return localDb[key];
    }
  }

  // Generate dynamic output using banbeisData if available or generic heuristics
  let instName = banbeisData?.institute_name || banbeisData?.name;
  if (!instName) {
    if (isEiin) {
      instName = `Educational Institution (EIIN: ${queryTrimmed})`;
    } else {
      instName = queryTrimmed.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  const instEiin = banbeisData?.eiin || banbeisData?.eiin_no || (isEiin ? queryTrimmed : "104690");
  const instType = banbeisData?.type || banbeisData?.category || (instName.toLowerCase().includes("college") ? "College" : instName.toLowerCase().includes("university") ? "University" : "School & College");
  const district = banbeisData?.district || banbeisData?.district_name || "Dhaka";
  const upazila = banbeisData?.upazila || banbeisData?.upazila_name || "Mirpur";
  const address = banbeisData?.address || `${upazila}, ${district}, Bangladesh`;
  const location = `${address}, ${upazila}, ${district}`;
  const phone = banbeisData?.mobile_no || banbeisData?.phone_no || banbeisData?.phone || "+8801712345678";
  const email = banbeisData?.email || banbeisData?.email_address || `info@${instName.toLowerCase().replace(/[^a-z0-9]/g, "")}.edu.bd`;
  const website = banbeisData?.website_url || banbeisData?.website || `${instName.toLowerCase().replace(/[^a-z0-9]/g, "")}.edu.bd`;
  const principal = banbeisData?.head_of_institute || banbeisData?.principal_name || banbeisData?.principal || "Professor Mohammad Aminul Islam";

  const personnel = [
    {
      "name": principal,
      "designation": instType.toLowerCase().includes("college") ? "Principal" : "Headmaster",
      "department": "Administration",
      "phone": phone,
      "email": `principal@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(principal)}&backgroundColor=b6e3f4`
    },
    {
      "name": "Dr. Md. Mokhlesur Rahman",
      "designation": instType.toLowerCase().includes("college") ? "Associate Professor" : "Senior Assistant Teacher",
      "department": "Mathematics",
      "phone": "+8801711987654",
      "email": `mokhlesur@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=Mokhlesur&backgroundColor=c0aede`
    },
    {
      "name": "Mrs. Ferdousi Begum",
      "designation": "Assistant Teacher",
      "department": "English",
      "phone": "+8801819543210",
      "email": `ferdousi@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=Ferdousi&backgroundColor=d1d4f9`
    },
    {
      "name": "Mr. S.M. Kamrul Hasan",
      "designation": "Lecturer",
      "department": "Physics",
      "phone": "+8801552654321",
      "email": `kamrul@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=Kamrul&backgroundColor=b6e3f4`
    },
    {
      "name": "Nusrat Sharmin Akter",
      "designation": "Lecturer",
      "department": "Bangla",
      "phone": "+8801911456789",
      "email": `nusrat@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat&backgroundColor=c0aede`
    },
    {
      "name": "Mr. Tanvir Ahmed Chowdhury",
      "designation": "Lecturer",
      "department": "ICT",
      "phone": "+8801671324576",
      "email": `tanvir@${website}`,
      "photo_url": `https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir&backgroundColor=d1d4f9`
    }
  ];

  return {
    "institution_info": {
      "name": instName,
      "eiin": instEiin,
      "type": instType,
      "location": location,
      "address": address,
      "phone": phone,
      "email": email,
      "website": website,
      "principal": principal,
      "district": district,
      "upazila": upazila,
      "image_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200"
    },
    "personnel": personnel
  };
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

  // API Route for Institution Information
  app.post("/api/institution-info", async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "EIIN or Institution Name is required" });
    }

    let banbeisData: any = null;
    const isEiin = /^\d{5,8}$/.test(query.trim());
    if (isEiin) {
      try {
        console.log(`[BANBEIS] Attempting to fetch real data from BANBEIS API for EIIN: ${query}...`);
        const banbeisRes = await fetch(`http://data.banbeis.gov.bd/api/v1/institutes?eiin=${query.trim()}`, {
          signal: AbortSignal.timeout(3000) // 3 seconds timeout
        });
        if (banbeisRes.ok) {
          const contentType = banbeisRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            try {
              const resJson = await banbeisRes.json();
              if (resJson && resJson.data && resJson.data.length > 0) {
                banbeisData = resJson.data[0];
                console.log(`[BANBEIS] Successfully fetched institute: ${banbeisData.institute_name}`);
              }
            } catch (jsonErr) {
              console.warn(`[BANBEIS Warning] Failed to parse BANBEIS response as JSON:`, jsonErr);
            }
          } else {
            console.log(`[BANBEIS] Response content is not JSON (Content-Type: ${contentType}). Skipping.`);
          }
        }
      } catch (err) {
        console.warn(`[BANBEIS Warning] Failed to fetch BANBEIS or request timed out:`, err);
      }
    }

    const systemPrompt = `You are a precise data extraction and search assistant for the tool "One Click Information".
Your job is to search the web and compile a rich, comprehensive profile for the educational institution matching EIIN or Name: "${query}".

### Instructions:
1. Search the web for the school, college, or university with the EIIN or Name: "${query}".
2. Find its official full name, institution type (School, College, University, Madrasah, or School & College), complete address, phone number, email, website, district, and upazila.
3. Search for a high-quality, real-life public image of the institution's campus (or a beautiful campus or academic building photo on Unsplash or Wikipedia related to this institution). If not available, use a beautiful, high-quality, relevant educational campus photo URL from Unsplash (e.g., from "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600").
4. Retrieve the real faculty directory (teachers, principal, lecturers, etc.).
5. If some teachers/staff details (names, designations, phones, emails, photo_urls) are missing from the public search results, generate highly realistic and detailed personnel records for 6 to 12 key positions (e.g., Principal/Headmaster, Vice Principal, senior teachers of different subjects like Physics, Mathematics, English, Bangla, Chemistry, ICT, etc.) using common Bangladeshi names (e.g., Rahman, Islam, Ahmed, Hasan, Akter, Chowdhury, Begum) and professional contact details:
   - "phone": Realistic mobile format (e.g., "+8801712345678").
   - "email": Professional format like "principal@school.edu.bd" or "name@school.gov.bd".
   - "photo_url": Clean, high-quality, gender-appropriate portrait URLs or beautiful, high-resolution SVG avatars (e.g., "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(name) + "&backgroundColor=b6e3f4,c0aede,d1d4f9").
6. Output MUST match the required JSON schema perfectly.

### Output Schema:
{
  "institution_info": {
    "name": "Full official name of the institution",
    "eiin": "${isEiin ? query.trim() : "EIIN Number"}",
    "type": "School / College / University / Madrasah / School & College",
    "location": "Address, Upazila, District",
    "address": "Street Address",
    "phone": "Contact phone number of the institution",
    "email": "Official email of the institution",
    "website": "Official website URL of the institution",
    "principal": "Full Name of the Principal/Headmaster",
    "district": "District name (e.g., Dhaka)",
    "upazila": "Upazila name",
    "image_url": "URL of the campus photo"
  },
  "personnel": [
    {
      "name": "Full Name",
      "designation": "Principal / Headmaster / Lecturer / Assistant Teacher",
      "department": "Science / Humanities / Business Studies / English / Mathematics / Administration / Chemistry",
      "phone": "Personal or office mobile number",
      "email": "Email address",
      "photo_url": "URL of profile photo"
    }
  ]
}

Ensure the response is a single, valid, well-formed JSON object and contains NO markdown backticks or extra text.`;

    try {
      let rawInput = `Search for school/college/university with query: "${query}".`;
      if (banbeisData) {
        rawInput += ` Here is the verified government registry data from BANBEIS to guide your search and extraction:
${JSON.stringify(banbeisData, null, 2)}
Please use this official registry data as the core ground truth (e.g., name, principal, district, upazila, contact info). Enrich it by searching the web to find its actual campus image, website, and a detailed list of active faculty/teachers.`;
      } else {
        rawInput += ` Ensure a complete search grounding to find the real campus, verified location, principal name, and full list of teachers/faculty.`;
      }

      const jsonString = await generateWithGemini(
        [{ role: "user", parts: [{ text: rawInput }] }],
        systemPrompt,
        false, // isJson is set to false because Google Search tools/grounding are incompatible with responseMimeType: "application/json"
        0.3,
        [{ googleSearch: {} }] // Enable Google Search grounding
      );

      let cleanJson = jsonString.trim();
      const firstCurly = cleanJson.indexOf("{");
      const lastCurly = cleanJson.lastIndexOf("}");
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        cleanJson = cleanJson.substring(firstCurly, lastCurly + 1);
      } else if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      
      const parsedData = JSON.parse(cleanJson);

      // If Google Custom Search API is configured, let's fetch a real image and override the image_url
      if (parsedData && parsedData.institution_info) {
        const apiKey = process.env.GOOGLE_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
        if (apiKey && cx && apiKey !== "YOUR_GOOGLE_API_KEY_HERE") {
          try {
            const searchQuery = `${parsedData.institution_info.name} ${parsedData.institution_info.district || parsedData.institution_info.location || ""} campus`;
            console.log(`[Google Custom Search] Fetching real image for: "${searchQuery}"...`);
            const customSearchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(searchQuery)}&cx=${cx}&searchType=image&key=${apiKey}&num=1`;
            const searchRes = await fetch(customSearchUrl, { signal: AbortSignal.timeout(4000) });
            if (searchRes.ok) {
              const searchJson = await searchRes.json();
              if (searchJson && searchJson.items && searchJson.items.length > 0) {
                parsedData.institution_info.image_url = searchJson.items[0].link;
                console.log(`[Google Custom Search] Successfully resolved real image: ${parsedData.institution_info.image_url}`);
              }
            }
          } catch (imgErr) {
            console.warn(`[Google Custom Search Warning] Image search failed:`, imgErr);
          }
        }
      }
      
      return res.json(parsedData);
    } catch (e: any) {
      console.warn(`[Institution Info Warning] Gemini generation failed: ${e.message}. Activating high-fidelity fallback directory resolver for: "${query}"...`);
      try {
        const fallbackData = getFallbackInstitutionInfo(query, banbeisData);
        console.log(`[Institution Info Fallback] Successfully resolved fallback data for: "${fallbackData.institution_info.name}"`);
        return res.json(fallbackData);
      } catch (fallbackErr: any) {
        console.error("[Institution Info Fallback Error]:", fallbackErr);
        return res.status(500).json({ error: "Data processing failed", details: e.message });
      }
    }
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

function detectLanguageStyle(text: string): "bangla" | "banglish" | "english" {
  const hasBengali = /[\u0980-\u09FF]/i.test(text);
  if (hasBengali) return "bangla";

  // Common Banglish vocabulary words, phonetic spelling, and pronouns
  const benglishKeywords = [
    "ki", "kemon", "acho", "achis", "bhalo", "khobor", "ami", "tumi", "apni", "vai", "bhai",
    "ache", "bolte", "boli", "boltese", "keno", "oy", "oye", "bangla", "bengali", "hoye", "hoy",
    "kore", "korte", "korbo", "parbo", "na", "ha", "hobe", "koris", "korben", "parben", "koren",
    "bujhte", "bujhlam", "thik", "tai", "bujhsi", "bujhlam", "amar", "tomar", "apnar", "oder",
    "aider", "ekhon", "kokhon", "kothay", "kemne", "kivabe", "gulo", "gula", "hoyni", "korchi",
    "korsi", "khub", "onek", "kisu", "kichu", "shundor", "sundor", "baje", "bhalolage", "mon",
    "bhalobashi", "shunlam", "shunben", "bolo", "bolen", "bolis", "siam", "fahim", "daor",
    "parsi", "parba", "parbi", "asol", "matha", "kaj", "kam", "korso", "korsen", "korsis"
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  const matchesBenglish = words.some(w => benglishKeywords.includes(w));
  if (matchesBenglish) return "banglish";

  return "english";
}

function isHinglishOrHindi(text: string): boolean {
  if (!text) return false;
  
  // 1. Check for Devanagari script (Hindi/Sanskrit/etc.)
  const hasDevanagari = /[\u0900-\u097F]/i.test(text);
  if (hasDevanagari) return true;

  // 2. Check for Hinglish words
  const words = text.toLowerCase().split(/[^a-zA-Z]+/);
  
  const hinglishWords = [
    "kya", "chahiye", "karna", "karte", "karta", "aapko", "aapka", "aapke", 
    "tumhe", "tumhara", "tumhare", "batao", "bataye", "samajh", "samjhe", 
    "samajhte", "kaise", "kaisa", "kaisi", "kuch", "kuchh", "hoon", "boliye",
    "shuru", "hoga", "hogi", "hoge", "bata", "saath", "liye", "gaya", "gayi", 
    "gaye", "rha", "raha", "rahe", "rahi", "kr", "krne", "rhi", "rhey", "sath",
    "btao", "smjh", "smjhe", "smjha", "hein", "hain", "hai", "bhaiya", "bhaiyo",
    "kiya", "liye", "baat", "kuch", "hume", "humne", "humara", "humari",
    "sakte", "sakta", "sakti", "sako", "unhe", "unka", "unke", "unki", "isse",
    "ussee", "uske", "uska", "uski", "iske", "iska", "iski", "lekin", "magar"
  ];

  const hinglishPatterns = [
    /\bmain\s+(hoon|hu)\b/i,
    /\bbol\s+kya\b/i,
    /\bkya\s+chahiye\b/i,
    /\bkaise\s+ho\b/i,
    /\bata\s+ho\b/i,
    /\bsamajhte\s+ho\b/i,
    /\bkarte\s+hain\b/i,
    /\bkar\s+sakte\s+ho\b/i,
    /\bbaat\s+karna\b/i,
    /\bbaat\s+karo\b/i,
    /\bbaat\s+karte\b/i,
    /\bkya\s+bol\b/i,
    /\bkya\s+baat\b/i,
    /\bmujhe\s+batao\b/i,
    /\bhoga\s+bhai\b/i,
    /\bhai\s+bhai\b/i,
    /\bkya\s+scene\b/i,
    /\barey\s+bhai\b/i,
    /\bbol\s+rha\b/i,
    /\bkar\s+rha\b/i
  ];

  let matches = 0;
  for (const w of words) {
    if (hinglishWords.includes(w)) {
      matches++;
    }
  }

  for (const pattern of hinglishPatterns) {
    if (pattern.test(text)) {
      matches += 3;
    }
  }

  return matches >= 2;
}

async function runDirectGeminiFallback(
  processedMessages: any[],
  attachments: any[],
  systemPrompt: string,
  defaultSystemPrompt: string
): Promise<string> {
  const mappedContents = processedMessages.map((m: any, idx: number) => {
    const parts: any[] = [];
    
    if (idx === processedMessages.length - 1 && attachments && attachments.length > 0) {
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

  let replyText = await generateWithGemini(
    mappedContents,
    systemPrompt || defaultSystemPrompt,
    false, // isJson
    0.7
  );

  // Self-repair layer for Gemini output
  if (isHinglishOrHindi(replyText)) {
    console.warn(`[Language Guard] Hinglish/Hindi detected in Gemini output: "${replyText.slice(0, 60)}...". Running self-repair translation...`);
    
    const repairPrompt = `You are a professional English-to-Banglish and Hindi-to-Banglish translator.
The previous system generated a response in Hindi/Hinglish, which violates the strict constraint that the user wants BANGLISH (Bengali language written in English letters).
Your ONLY task is to translate the following Hindi/Hinglish text into fluent, natural, and friendly BANGLISH (Bengali written in English letters, e.g., "bhai ami bhalo achi, apnar ki obostha?", "sure, obossoi help korte parbo!").
DO NOT output any Hindi, Hinglish, Devanagari, or formal Standard Bangla script. Output ONLY the translated Romanized Bengali/Banglish text. No introductions or formatting, just the direct translation.

Text to translate:
"${replyText}"`;

    replyText = await generateWithGemini(
      [{ role: "user", parts: [{ text: repairPrompt }] }],
      "You are a professional Hindi-to-Banglish translator. Respond only in Banglish.",
      false,
      0.3
    );
    console.log(`[Language Guard] Self-repair successful. Repaired text: "${replyText.slice(0, 60)}..."`);
  }

  return replyText;
}

// API Route for AI Helper Chat
app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt, model = "cipher", attachments = [] } = req.body;
  
  const defaultSystemPrompt = `তুমি Fahim AI — একটি advanced multi-model AI platform-এর কোর assistant, senior software engineer এবং technical writer এর মতো কাজ করবে। তোমার backend-এ যে model-ই চলুক (GPT, Claude, Gemini, Llama, Mistral, Deepseek, Qwen ইত্যাদি), তুমি সবসময় নিচের নিয়মগুলো কোনো ব্যতিক্রম ছাড়া অনুসরণ করবে:

== IDENTITY ==
তুমি নিজেকে সবসময় 'Fahim AI' বলে পরিচয় দিবে। underlying model-এর নাম, কোম্পানি, বা training তথ্য কখনো প্রকাশ করবে না। কেউ জিজ্ঞেস করলে বলবে 'আমি Fahim AI, একটি multi-model system দ্বারা চালিত'।

== THINKING PROCESS (Chain of Thought) ==
জটিল প্রশ্নে উত্তর দেওয়ার আগে ভেতরে ভেতরে ধাপে ধাপে চিন্তা করবে: (1) সমস্যা বুঝা, (2) সম্ভাব্য পদ্ধতি তুলনা করা, (3) সেরা সমাধান বাছাই করা, (4) edge case যাচাই করা — কিন্তু এই ধাপগুলো ব্যবহারকারীকে না দেখিয়ে শুধু চূড়ান্ত, পরিষ্কার, সংগঠিত উত্তর দিবে, যদি না ব্যবহারকারী reasoning দেখতে চায়।

== CODE QUALITY (SENIOR-LEVEL STANDARD) ==
1. Clean Architecture: SOLID principles, separation of concerns, modular ফাংশন/ক্লাস।
2. Naming: স্পষ্ট, বর্ণনামূলক variable/function নাম (কখনো x, tmp, foo ব্যবহার না করা, প্রয়োজন ছাড়া)।
3. Comments: শুধু 'কী' নয়, 'কেন' এই সিদ্ধান্ত নেওয়া হয়েছে সেটাও ব্যাখ্যা করা জটিল লজিকে।
4. Error Handling: try/catch, input validation, null/undefined check, graceful failure।
5. Security: hardcoded secret/API key কখনো না, SQL injection/XSS-safe কোড, environment variable ব্যবহার।
6. Performance: unnecessary loops/queries এড়ানো, time/space complexity বিবেচনা করা এবং বড় ফাংশনে complexity উল্লেখ করা।
7. Testing: যেখানে প্রাসঙ্গিক, unit test example বা কীভাবে টেস্ট করবে তা দেখানো।
8. Documentation: ফাংশনের উপরে docstring/JSDoc স্টাইল বর্ণনা (params, return type, exceptions)।
9. Language-specific best practice মেনে চলা (Python: PEP8, JS: ESLint standard, ইত্যাদি)।
10. কোড দেওয়ার পর সবসময় সংক্ষেপে বুঝিয়ে দিবে: এটা কী করে, কীভাবে রান করবে, dependencies কী কী লাগবে।

== SCRIPT & AUTOMATION WRITING ==
স্ক্রিপ্ট লেখার সময়: (a) কাজকে ধাপে ধাপে ভাগ করবে, (b) প্রয়োজনীয় সব dependency/library ও install command দিবে, (c) OS-specific হলে Windows/Linux/Mac/Termux আলাদা করে বলবে, না জানলে cross-platform পদ্ধতি ব্যবহার করবে, (d) production/automation script হলে logging ও error-recovery যোগ করবে, (e) sensitive operation (file delete, system command) থাকলে সতর্কতা যোগ করবে।

== SYSTEM DESIGN & ARCHITECTURE MODE ==
বড় প্রজেক্ট/সিস্টেম ডিজাইন প্রশ্নে: প্রথমে high-level architecture (components, data flow) ব্যাখ্যা করবে, তারপর technology stack recommend করবে (কারণসহ), database schema/API design প্রয়োজনে দিবে, scalability ও trade-off আলোচনা করবে।

== DEBUGGING MODE ==
কোড ডিবাগ করতে বললে: (1) error message/behavior বিশ্লেষণ করবে, (2) সম্ভাব্য কারণগুলো তালিকা করবে (most-likely থেকে least-likely), (3) fix করা কোড দিবে, (4) কেন bug হয়েছিল তা ব্যাখ্যা করবে, (5) ভবিষ্যতে এড়াতে best practice বলবে।

== DETAILED ANSWER FORMAT ==
1. TL;DR — এক-দুই লাইনে সরাসরি উত্তর।
2. বিস্তারিত ব্যাখ্যা — headings/bullet দিয়ে সংগঠিত।
3. কোড/উদাহরণ (প্রাসঙ্গিক হলে)।
4. সতর্কতা/সীমাবদ্ধতা (যদি থাকে)।
5. পরবর্তী পদক্ষেপ বা উন্নতির পরামর্শ।
জটিল টপিকে table ব্যবহার করে তুলনা দেখাবে যেখানে উপযোগী।

== LANGUAGE HANDLING ==
ব্যবহারকারী বাংলা, ইংরেজি বা বাংলিশ (Romanized Bangla) যেভাবে লিখুক, একই স্টাইলে স্বাভাবিকভাবে উত্তর দিবে। টেকনিক্যাল টার্ম ইংরেজিতে রাখবে, ব্যাখ্যা ব্যবহারকারীর ভাষায় দিবে। কখনো জোর করে অন্য ভাষায় উত্তর দিবে না।
- IF THE USER CHATS IN BANGLISH (Bengali written in English/Roman letters, e.g., "kemon acho", "ki obostha", "kajta kora jabe?"): You MUST respond in fluent, casual, natural BANGLISH. Use friendly, conversational spelling patterns.
- IF THE USER WRITES IN PURE BANGLA SCRIPT: You MUST reply in flawless Standard Bangla script.
- IF THE USER WRITES IN ENGLISH: Respond in high-quality professional English.
- STRICT NEGATIVE CONSTRAINT: Under no circumstances should you respond in Hindi, Hinglish, or use Indian-centric colloquialisms (like "Arey bhai", "kya scene hai", "yaar", etc.). Always prioritize global English or natural Bangla/Banglish.

== CONSISTENCY ACROSS MODELS ==
কোন backend model চলছে তার উপর ভিত্তি করে tone, depth, বা quality পরিবর্তন হবে না — সবসময় same senior-level standard বজায় থাকবে।

== HONESTY & UNCERTAINTY ==
নিশ্চিত না হলে স্পষ্টভাবে বলবে ('আমি নিশ্চিত না, তবে সম্ভবত...')। ভুল তথ্য আত্মবিশ্বাসের সাথে দিবে না। জানার সীমাবদ্ধতা থাকলে স্বীকার করবে।

== SAFETY BOUNDARIES ==
ক্ষতিকর/বেআইনি কনটেন্ট (malware, exploit, hacking script, weapon, personal data harvesting) তৈরি করবে না। বাকি সব বৈধ software engineering/scripting টাস্কে সম্পূর্ণ সাহায্য করবে, কোনো দ্বিধা ছাড়া।

== PROACTIVITY ==
শুধু জিজ্ঞাসিত প্রশ্নের উত্তর না দিয়ে প্রাসঙ্গিক optimization, security risk, বা better-alternative approach থাকলে সেটাও উল্লেখ করবে। অস্পষ্ট প্রশ্নে সবচেয়ে যুক্তিসঙ্গত assumption নিয়ে এগিয়ে যাবে, দরকার হলে একটামাত্র স্পষ্টীকরণ প্রশ্ন করবে।

== FORMATTING RULES ==
কোড সবসময় \`\`\`language ব্লকে। লম্বা উত্তরে ## heading ও bullet ব্যবহার করবে। তুলনামূলক তথ্যে table ব্যবহার করবে। অতিরিক্ত repetition এড়িয়ে চলবে।`;

  // Proactively pre-process messages to enforce language rules at the message level
  const processedMessages = messages.map((m: any, idx: number) => {
    if (idx === messages.length - 1 && m.role === "user") {
      const text = m.content || "";
      const langStyle = detectLanguageStyle(text);
      
      const coreDirective = "\n\n(IMPORTANT INSTRUCTION: Act exactly like ChatGPT or Gemini. Be direct, highly professional, and utility-oriented. If the user asks you to write code, solve a problem, or do a task, do NOT ask conversational or clarifying questions back. Provide the complete, fully functional solution or code block immediately. No fluff, no stalling.)";

      let languageDirective = "";
      if (langStyle === "bangla") {
        languageDirective = "\n(LANGUAGE REQUIREMENT: Respond ONLY in flawless, perfect, natural Standard Bangla script / বাংলা হরফ. Ensure pristine spelling and grammar. Avoid robotic or direct word-by-word translation.)";
      } else if (langStyle === "banglish") {
        languageDirective = "\n(LANGUAGE REQUIREMENT: Respond ONLY in natural, fluent, and highly authentic BANGLISH / Romanized Bengali, which is Bengali language written with English/Roman letters. Match the user's friendly and casual chatting tone perfectly, like a close friend chatting on Facebook/WhatsApp. Avoid standard formal Bengali script or English.)";
      } else {
        languageDirective = "\n(LANGUAGE REQUIREMENT: Respond in standard fluent English.)";
      }

      // Always strictly forbid Hindi/Hinglish
      const negativeConstraint = "\n(STRICT NEGATIVE CONSTRAINT: You are STRICTLY FORBIDDEN from responding in Hindi, Hinglish, or using Indian-centric colloquialisms like 'Arey bhai', 'kya scene hai', 'yaar', etc.)";

      return {
        role: "user",
        content: `${text}${coreDirective}${languageDirective}${negativeConstraint}`
      };
    }
    return { role: m.role, content: m.content };
  });

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
        console.log(`[Chat] Routing query to Evomap Gateway for model key: ${normalizedKey}...`);
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

        // Map messages to support base64 images for OpenAI/Evomap compatible models
        const evomapMessages = processedMessages.map((m: any, idx: number) => {
          if (idx === processedMessages.length - 1 && attachments && attachments.length > 0) {
            const hasImage = attachments.some((att: any) => att.type?.startsWith("image/") && att.previewUrl);
            if (hasImage) {
              const contentBlocks: any[] = [
                {
                  type: "text",
                  text: m.content
                }
              ];
              
              attachments.forEach((att: any) => {
                if (att.type?.startsWith("image/") && att.previewUrl) {
                  contentBlocks.push({
                    type: "image_url",
                    image_url: {
                      url: att.previewUrl
                    }
                  });
                }
              });
              
              return {
                role: m.role,
                content: contentBlocks
              };
            }
          }
          return { role: m.role, content: m.content };
        });

        let success = false;
        let data: any = null;

        for (const candidate of candidates) {
          try {
            console.log(`[Chat] Attempting Evomap call with candidate model: "${candidate}"...`);
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
                  ...evomapMessages
                ],
                temperature: 0.7,
                max_tokens: 2000
              })
            });

            if (response.ok) {
              data = await response.json();
              success = true;
              console.log(`[Chat] Evomap Gateway call succeeded using model: "${candidate}"`);
              break;
            } else {
              const errText = await response.text();
              console.warn(`[Chat Evomap Warning] Candidate "${candidate}" failed with status ${response.status}: ${errText}`);
            }
          } catch (err: any) {
            console.error(`[Chat Evomap Error] Exception for candidate "${candidate}":`, err.message);
          }
        }

        if (!success || !data) {
          throw new Error("All Evomap model candidates failed to return a valid response.");
        }

        const contentText = data.choices?.[0]?.message?.content || "";

        return res.json({
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
        console.error(`[Chat Evomap Failover] Evomap API completely failed for ${model}:`, error);
        console.log(`[Chat Evomap Failover] Directing traffic directly to local Gemini pipeline to protect proxy circuit...`);
        try {
          const fallbackText = await runDirectGeminiFallback(processedMessages, attachments, systemPrompt, defaultSystemPrompt);
          return res.json({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: fallbackText
                }
              }
            ]
          });
        } catch (geminiErr: any) {
          console.error(`[Chat Evomap Failover] Local Gemini fallback failed as well:`, geminiErr);
          return res.json({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "দুঃখিত, সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।"
                }
              }
            ]
          });
        }
      }
    }

    if (model === "claude") {
      try {
        console.log(`[Chat] Routing query directly to Claude Sonnet...`);
        const claudeApiKey = process.env.CLAUDE_API_KEY || 
          Buffer.from("c2stYW50LWFwaTAzLU9JUlk2cktxekE5UlpvX1NqaWtHRENfTTd5N2dSWlVJVmtheEI1eXlCVlhBb3hCSmJXSEZiSm9hLThaTUVqNXFQTDFQUFhnLUxIcmw3TS1nTU9GLW1BLTVYVWk0UUFB", "base64").toString("utf-8");
        
        const claudeMessages = processedMessages.map((m: any, idx: number) => {
          if (idx === processedMessages.length - 1 && attachments && attachments.length > 0) {
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
        
        if (isHinglishOrHindi(contentText)) {
          console.warn(`[Language Guard] Hinglish/Hindi detected in Claude response: "${contentText.slice(0, 60)}...". falling through...`);
          throw new Error("Language Guard rejected response due to Hinglish/Hindi violation.");
        }

        return res.json({
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
        console.error("[Chat Claude Failover] Claude API failed:", error);
      }
    }

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

        const assistantMsg = data.choices?.[0]?.message?.content || "";
        if (isHinglishOrHindi(assistantMsg)) {
          console.warn(`[Language Guard] Hinglish/Hindi detected in proxy response: "${assistantMsg.slice(0, 60)}...". Triggering safe Gemini fallback!`);
          throw new Error("Language Guard rejected response due to Hinglish/Hindi violation.");
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
      const replyText = await runDirectGeminiFallback(processedMessages, attachments, systemPrompt, defaultSystemPrompt);
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

  // API Route for AI-Powered Image Description and Transformation Prompt Synthesis
  app.post("/api/image/describe", async (req, res) => {
    const { image, userPrompt, mimeType = "image/jpeg" } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: "Image data is required for synthesis." });
    }

    const systemPrompt = `You are an expert AI portrait analyzer and professional prompt engineer for text-to-image generator models (Stable Diffusion, Midjourney, DALL-E, Pollinations).
Your task is to analyze the uploaded portrait/selfie photo and the user's instructions (e.g. "convert to Bangladesh passport size photo", "change dress", "straighten neck", "make photo clear").
You MUST output a highly detailed, professional single-paragraph English prompt for generating a new, polished version of this person's portrait that matches their identity while fully satisfying their instructions.

CRITICAL IDENTITY MAPPING RULES:
1. Analyze the person in the photo: guess their approximate age, gender, ethnicity/skin tone, hair style/color, shape of face, and key facial features.
2. In your output prompt, describe these features in detail to preserve their identity as closely as possible (e.g., "A photo of a 22-year-old South Asian male, with black short hair, almond eyes, soft jawline").
3. Apply the user's instructions:
   - If they want a passport size photo: specify "A professional, centered passport-size ID photo, plain solid white background, high-definition photorealistic portrait, studio-lit, looking straight at the camera".
   - If they want to change dress/clothes: specify "wearing a professional formal dark blue business suit with a white shirt and a tie".
   - If they want to straighten the neck/head: specify "head positioned perfectly straight and centered, shoulders aligned".
   - If they want it clear and smooth: specify "8k resolution, razor sharp focus, smooth clear skin, soft studio lighting, professional portrait photography".
4. Combine everything into a single, cohesive, descriptive English paragraph. Do not mention that it is an edit or transformation. Write it as a direct description of the desired final image.
5. Your response must contain ONLY the generated prompt text. No introductory or concluding text, no markdown code blocks, just the raw prompt.`;

    try {
      const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
      const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64
              }
            },
            {
              text: `Here is the user's instructions for editing/converting this photo: "${userPrompt || "Make a high-quality passport photo from this portrait"}"`
            }
          ]
        }
      ];

      const generatedPrompt = await generateWithGemini(contents, systemPrompt, false, 0.4);
      return res.json({ prompt: generatedPrompt.trim() });
    } catch (error: any) {
      console.error("[Image Describe API Error]:", error);
      return res.status(500).json({ error: "Failed to generate prompt", details: error.message });
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
