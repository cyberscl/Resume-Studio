import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Helper to get GoogleGenAI dynamically (lazy initialization)
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to call generateContent with automatic retry and model fallback to handle 503/high-demand errors gracefully
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  fallbackModel?: string
) {
  let primaryModel = params.model;
  let fallback = fallbackModel;

  if (!fallback) {
    if (primaryModel === "gemini-3.5-flash") {
      fallback = "gemini-3.1-flash-lite";
    } else if (primaryModel === "gemini-3.1-flash-lite-image") {
      fallback = "gemini-3.1-flash-image";
    }
  }

  const modelsToTry = [primaryModel];
  if (fallback) {
    modelsToTry.push(fallback);
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 2; // Try up to 3 times for each model (original attempt + 2 retries)
    while (retries >= 0) {
      try {
        console.log(`[Gemini API] Attempting generateContent with model: ${model} (${retries} retries remaining)...`);
        const response = await ai.models.generateContent({
          ...params,
          model: model,
        });
        console.log(`[Gemini API] Success using model: ${model}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || JSON.stringify(err);
        console.warn(`[Gemini API] Error with model ${model} (retries left: ${retries}):`, errMsg);

        // Don't retry client-side errors (400 Bad Request, 401 Unauthorized, 403 Forbidden)
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          console.error(`[Gemini API] Client error status ${err.status}, stopping retries for this model.`);
          break;
        }

        retries--;
        if (retries >= 0) {
          // Exponential backoff
          const delay = (2 - retries) * 600 + 400;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  const isUnavailable = lastError && (lastError.status === 503 || (lastError.message && lastError.message.includes("503")) || (lastError.message && lastError.message.includes("high demand")));
  if (isUnavailable) {
    throw new Error(`服务当前非常繁忙或不可用（503）。这通常是临时的，请在几秒钟后重试。详细错误: ${lastError.message || JSON.stringify(lastError)}`);
  }
  
  throw lastError || new Error("Failed to generate content after trying multiple models and retries");
}

// 1. Resume Optimization Route (JD Rewriter)
app.post("/api/ai/optimize-resume", async (req, res) => {
  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    return res.status(500).json({
      error: "Gemini API 密钥（GEMINI_API_KEY）未配置。请在开发面板的 Settings > Secrets 中添加您的 GEMINI_API_KEY，保存后重试。"
    });
  }

  const { resumeData, jobDescription } = req.body;

  if (!resumeData || !jobDescription) {
    return res.status(400).json({ error: "Missing resumeData or jobDescription." });
  }

  try {
    const prompt = `
You are an expert recruitment consultant and professional resume writer.
Your task is to analyze the user's resume data and a Job Description (JD), then optimize and tailor the resume to maximize the match with the JD.
Make the descriptions more professional, highlighting key accomplishments and matching keywords from the JD, without fabricating facts.

User's Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription}

Please output a strictly-formatted JSON object containing tailored suggestions for the resume. 
The JSON must follow this exact typescript schema:
{
  "personalInfo": {
    "title": "A tailored professional title or headline (string) matching the JD role, e.g., 'Senior Frontend Engineer'"
  },
  "summary": {
    "original": "Original summary or brief introduction",
    "suggested": "A tailored, highly persuasive summary or brief introduction aligning with the JD (string, 2-3 sentences)",
    "explanation": "Why these changes were made (string)"
  },
  "experiences": [
    {
      "id": "Matching experience item ID",
      "company": "Company name",
      "position": "Tailored position title if appropriate, or original",
      "original": "Original experience description text",
      "suggested": "A highly optimized and tailored description of their role and achievements. Use professional bullet points using bullet characters like '•' or structured text, emphasizing keywords and accomplishments related to the JD (string)",
      "explanation": "Explanation of changes and which keywords/skills were highlighted (string)"
    }
  ],
  "projects": [
    {
      "id": "Matching project item ID",
      "name": "Project name",
      "original": "Original project description text",
      "suggested": "A tailored, high-impact description of their project achievements, tools used, and results related to the JD (string)",
      "explanation": "Explanation of changes (string)"
    }
  ],
  "skills": {
    "added": ["List of critical skills or keywords from the JD that the candidate should add, if they possess or are implied by their experience (array of strings, max 8)"],
    "removed": ["List of less relevant skills to de-emphasize if space is needed (array of strings)"]
  }
}

Ensure all suggestions remain faithful to the original experiences but phrase them using stronger action verbs (e.g., Led, Developed, Optimized, Accelerated) and quantify results if possible.
`;

    const response = await generateContentWithRetryAndFallback(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING }
              },
              required: ["title"]
            },
            summary: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                suggested: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["original", "suggested", "explanation"]
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "company", "position", "original", "suggested", "explanation"]
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "name", "original", "suggested", "explanation"]
              }
            },
            skills: {
              type: Type.OBJECT,
              properties: {
                added: { type: Type.ARRAY, items: { type: Type.STRING } },
                removed: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["added", "removed"]
            }
          },
          required: ["personalInfo", "summary", "experiences", "projects", "skills"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }

    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Resume optimization failed:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize resume." });
  }
});

// 2. AI ID Photo Generation Route
app.post("/api/ai/generate-photo", async (req, res) => {
  let ai: GoogleGenAI;
  try {
    ai = getGenAI();
  } catch (err) {
    return res.status(500).json({
      error: "Gemini API 密钥（GEMINI_API_KEY）未配置。请在开发面板的 Settings > Secrets 中添加您的 GEMINI_API_KEY，保存后重试。"
    });
  }

  const { gender, suitColor, backgroundColor, ageGroup, hasGlasses, style } = req.body;

  try {
    // Standard photo prompt for high professional look
    const genderTerm = gender === "male" ? "handsome businessman" : "beautiful businesswoman";
    const glassesTerm = hasGlasses ? "wearing elegant corporate glasses" : "not wearing glasses";
    const bgTerm = backgroundColor || "clean solid white";
    const suitTerm = suitColor || "navy blue formal business suit";
    const ageTerm = ageGroup === "young" ? "around 25 years old" : ageGroup === "senior" ? "around 45 years old" : "around 32 years old";
    const stylePrompt = style === "creative" ? "modern studio creative portrait style" : "strict formal government ID passport style";

    const prompt = `A highly professional front-facing studio headshot, passport ID photo of a ${genderTerm}, ${ageTerm}, ${glassesTerm}. They are wearing a high-quality ${suitTerm} with a crisp white shirt, looking directly at the camera with a confident, friendly, and natural smile. The background is a flat, solid, even ${bgTerm} color. Tidy hair, immaculate corporate styling, professional studio lighting, head and shoulders perfectly centered, highly detailed photorealistic portrait. ${stylePrompt}.`;

    console.log("Generating portrait with prompt:", prompt);

    const response = await generateContentWithRetryAndFallback(ai, {
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content?.parts) {
      throw new Error("No candidates or parts returned from image model.");
    }

    let base64Image = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("No image data found in response parts.");
    }

    return res.json({ success: true, imageUrl: base64Image });
  } catch (error: any) {
    console.error("AI Photo generation failed:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI portrait. Note that image generation models require a configured key or might have quota limits." });
  }
});

// 3. High-Quality Server-Side PDF Export Route using Playwright Chromium
app.post("/api/export-pdf", async (req, res) => {
  const { data, styles } = req.body;

  if (!data || !styles) {
    return res.status(400).json({ error: "Missing resume data or styles" });
  }

  let browser;
  try {
    console.log("[PDF Generator] Launching headless Chromium...");
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ]
    });

    const page = await browser.newPage({
      viewport: {
        width: 794,
        height: 1123
      }
    });

    // Add initial script to inject localstorage before page load
    await page.addInitScript((payload) => {
      window.localStorage.setItem("printResumeData", JSON.stringify(payload));
    }, { data, styles });

    // We navigate to our own local port 3000 print route
    const printUrl = `http://localhost:3000/print`;
    console.log(`[PDF Generator] Navigating to ${printUrl} with networkidle...`);

    // Wait until network is idle so that all styles, fonts, and images are fully fetched
    await page.goto(printUrl, { waitUntil: "networkidle" });

    // Wait for the main resume pages to be rendered and layed out in DOM
    console.log("[PDF Generator] Waiting for resume pages to mount...");
    await page.waitForSelector(".resume-page", { timeout: 8000 });

    // Wait for custom Google fonts (Inter, Outfit, Playfair, JetBrains Mono etc) to be fully active
    console.log("[PDF Generator] Waiting for custom web fonts to load...");
    await page.evaluate(() => document.fonts.ready);

    // Minor extra delay to guarantee full CSS layout rendering engine passes
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("[PDF Generator] Formulating PDF page setup...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm"
      }
    });

    console.log("[PDF Generator] PDF compiled successfully! Bytes count:", pdfBuffer.length);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error("[PDF Generator] Severe error during PDF generation:", err);
    res.status(500).json({ error: `服务端生成 PDF 失败: ${err.message || "未知错误"}` });
  } finally {
    if (browser) {
      await browser.close();
      console.log("[PDF Generator] Headless browser closed.");
    }
  }
});

// Vite & Static file handler setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
