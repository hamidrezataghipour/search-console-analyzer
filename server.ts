import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Let the server parse json bodies (up to 10MB to support large GSC lists if any)
  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API endpoint for streaming OpenRouter Gemma 4 SEO analysis
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { analysisData, userApiKey } = req.body;
      if (!analysisData) {
        return res.status(400).json({ error: "داده‌های آنالیز یافت نشد." });
      }

      // API Key resolution: Use user key if set, or server's OpenRouter/Gemini key
      const apiKeyToUse = userApiKey || process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || "";
      if (!apiKeyToUse) {
        return res.status(401).json({ error: "کلید API معتبر یافت نشد. لطفا کلید OpenRouter خود را وارد کنید." });
      }

      // Construct a customized prompt for Google Gemma 4 model (google/gemma-4-31b-it:free)
      const prompt = `
تو یک متخصص سئو و تحلیلگر داده هستی.
دادههای Google Search Console یک سایت به شرح زیر است:

آمار کلی:
- مجموع کلیک: ${analysisData.overview.totalClicks}
- مجموع ایمپرشن: ${analysisData.overview.totalImpressions}
- میانگین نرخ کلیک (CTR): ${analysisData.overview.avgCTR}%
- میانگین رتبه (Position): ${analysisData.overview.avgPosition}
- تعداد کل URLها: ${analysisData.overview.totalUrls}
- تعداد کل کلمات کلیدی (Keywords): ${analysisData.overview.totalKeywords}

فرصتهای طلایی (Quick Wins) - ${analysisData.quickWins ? analysisData.quickWins.length : 0} مورد:
${JSON.stringify((analysisData.quickWins || []).slice(0, 10))}

صفحات با نرخ کلیک پایین (Low CTR CTRs) - ${analysisData.lowCTR ? analysisData.lowCTR.length : 0} مورد:
${JSON.stringify((analysisData.lowCTR || []).slice(0, 10))}

بهترین صفحات (Top URLs) بر اساس کلیک:
${JSON.stringify((analysisData.topUrls || []).slice(0, 10))}

بهترین کلمات کلیدی (Top Keywords) بر اساس کلیک:
${JSON.stringify((analysisData.topKeywords || []).slice(0, 10))}

تداخل آدرسها (Keyword Cannibalization):
${JSON.stringify((analysisData.cannibalization || []).slice(0, 10))}

لطفاً یک تحلیل جامع، دقیق، عمیق و کاربردی به زبان فارسی شیوا و حرفه‌ای ارائه بده که شامل بخش‌های زیر با هدینگ‌های مارک‌داون باشد:

## ۱. تحلیل و ارزیابی وضعیت کلی سایت
## ۲. نقاط قوت اصلی (با تکیه بر آمار کلیک و نمایش)
## ۳. مشکلات کلیدی سئو (صفحات با CTR پایین یا پدیده همخواری/Cannibalization)
## ۴. فرصت‌های طلایی (Quick Wins) — چرایی اهمیت و نحوه بهره‌برداری فوری
## ۵. اقدامات اولویت‌دار (از مهم‌ترین به کم‌اهمیت‌ترین در قالب لیست)
## ۶. استراتژی عملیاتی پیشنهادی برای ۳ ماه آینده (فازبندی شده)

تحلیل باید:
- کاملاً واقع‌بینانه و منطبق بر داده‌های سئو بالا باشد و فرضیات تخیلی نسازد.
- به آمار دقیق کلیک، نمایش، رتبه و برندها ارجاع مستقیم دهد.
- راهکارهای فنی واضح جهت بهبود نرخ کلیک (Title / Meta Description) و رفع Cannibalization ارائه دهد.
- ساختار خوانا و حرفه‌ای داشته باشد.
`;

      // Set headers for EventStream
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeyToUse}`,
          "HTTP-Referer": "https://ai.studio",
          "X-Title": "Search Console Analysis Dashboard",
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطای سرویس OpenRouter: ${response.status} - ${errorText}`);
      }

      const reader = response.body;
      if (!reader) {
        throw new Error("پاسخی از سرور هوش مصنوعی دریافت نشد.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processBuffer = (currentBuffer: string) => {
        const lines = currentBuffer.split("\n");
        const nextBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataContent = cleanLine.substring(6).trim();
            if (dataContent === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(dataContent);
              const text = parsed?.choices?.[0]?.delta?.content || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (err) {
              // Ignore partial chunk JSON errors
            }
          }
        }
        return nextBuffer;
      };

      if (typeof (reader as any)[Symbol.asyncIterator] === "function") {
        for await (const chunk of reader as any) {
          buffer += decoder.decode(chunk, { stream: true });
          buffer = processBuffer(buffer);
        }
      } else {
        const webReader = (reader as any).getReader();
        while (true) {
          const { done, value } = await webReader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          buffer = processBuffer(buffer);
        }
      }

      // Flush remaining buffer
      if (buffer) {
        processBuffer(buffer + "\n");
      }

      res.write("data: [DONE]\n\n");
      res.end();

    } catch (err: any) {
      console.error("Express OpenRouter Controller Error:", err);
      res.write(`data: ${JSON.stringify({ error: err.message || "Streaming analysis failed" })}\n\n`);
      res.end();
    }
  });

  // Vite development vs production asset handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
