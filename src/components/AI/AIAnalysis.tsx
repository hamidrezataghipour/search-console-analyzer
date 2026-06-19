import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Clock, CheckCircle, AlertCircle, Loader, Download, Eye, EyeOff, Key } from "lucide-react";
import { AnalysisResults } from "../../types";
import { generateHTMLReport } from "../../utils/reportGenerator";

// ============================================
// Timer Component
// ============================================
interface TimerProps {
  running: boolean;
}

function Timer({ running }: TimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!running && seconds === 0) return null;

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeStr = m > 0 ? `${m} دقیقه و ${s} ثانیه` : `${s} ثانیه`;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-[#94A3B8] px-3.5 py-2 bg-[#1E2A3B] rounded-xl border border-[#1E293B]">
      <Clock size={13} className="text-[#3B82F6]" />
      <span>زمان سپری شده:</span>
      <strong className="text-[#F1F5F9] font-mono">{timeStr}</strong>
    </div>
  );
}

// ============================================
// Animated Progress Bar Component
// ============================================
interface ProgressBarProps {
  running: boolean;
}

function ProgressBar({ running }: ProgressBarProps) {
  if (!running) return null;
  return (
    <div className="w-full h-1 bg-[#1E293B] rounded-full overflow-hidden my-4">
      <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent rounded-full animate-shimmer" />
    </div>
  );
}

// ============================================
// Build Prompt for Gemini
// ============================================
const buildPrompt = (analysisData: AnalysisResults) => {
  const overview = analysisData.overview;
  const quickWins = (analysisData.quickWins || []).slice(0, 8);
  const lowCTR = (analysisData.lowCTR || []).slice(0, 8);
  const topItems = (analysisData.rawData || [])
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return `
تو یک متخصص سئو باتجربه هستی. داده‌های زیر از Google Search Console یک سایت به تو داده می‌شود.

═══ آمار کلی سایت ═══
• مجموع کلیک: ${(overview.totalClicks || 0).toLocaleString()}
• مجموع نمایش: ${(overview.totalImpressions || 0).toLocaleString()}
• میانگین CTR: ${((overview.avgCTR || 0)).toFixed(2)}٪
• میانگین رتبه: ${(overview.avgPosition || 0).toFixed(1)}
• تعداد URL/کلمه کلیدی: ${overview.totalUrls || 0}

═══ پرکلیک‌ترین صفحات ═══
${topItems
  .map(
    (r, i) =>
      `${i + 1}. ${r.page || r.query || "نامشخص"} | کلیک: ${r.clicks} | رتبه: ${Number(r.position).toFixed(1)}`
  )
  .join("\n")}

═══ فرصت‌های Quick Win (رتبه ۴ تا ۱۰) ═══
${
  quickWins.length > 0
    ? quickWins
        .map(
          (r) =>
            `• ${r.page || r.query} — رتبه ${Number(r.position).toFixed(1)} — نمایش: ${r.impressions}`
        )
        .join("\n")
    : "موردی یافت نشد"
}

═══ CTR پایین با رتبه خوب ═══
${
  lowCTR.length > 0
    ? lowCTR
        .map(
          (r) =>
            `• ${r.page || r.query} — رتبه ${Number(r.position).toFixed(1)} — CTR: ${(Number(r.ctr) > 1 ? Number(r.ctr) : Number(r.ctr) * 100).toFixed(2)}٪`
        )
        .join("\n")
    : "موردی یافت نشد"
}

═══════════════════════════════
لطفاً یک تحلیل جامع فارسی بده که شامل این بخش‌ها باشد:

## ۱. وضعیت کلی سایت
## ۲. نقاط قوت اصلی
## ۳. مشکلات و ضعف‌ها
## ۴. فرصت‌های Quick Win — چرا مهم‌اند و چه اقدامی لازم است
## ۵. صفحات با CTR پایین — راهکار بهبود Title و Description
## ۶. استراتژی پیشنهادی برای ۳ ماه آینده (ماه به ماه)

قوانین پاسخ:
- کاملاً فارسی باشد
- اعداد و درصدهای واقعی از داده‌ها ذکر شود
- پیشنهادات قابل اجرا و عملی باشد
- از هدینگ ## و ساب‌هدینگ ### استفاده کن
- هر بخش حداقل ۳ نکته داشته باشد
`;
};

// ============================================
// Simple Markdown Parser to Tailwind UI
// ============================================
const renderCustomMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-4 text-sm leading-relaxed text-[#CBD5E1] text-right">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-[#3B82F6] text-base font-bold mt-6 mb-3 border-b border-[#1E293B] pb-2 text-right"
              id={`ai-h2-${i}`}
            >
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="text-[#8B5CF6] text-sm font-bold mt-4 mb-2 text-right"
              id={`ai-h3-${i}`}
            >
              {trimmed.slice(4)}
            </h3>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const content = trimmed.slice(2);
          const boldParts = content.split(/\*\*(.*?)\*\*/g);

          return (
            <li key={i} className="list-disc pr-4 text-xs font-medium text-gray-300 my-1 line-height-relaxed text-right list-inside">
              {boldParts.map((part, index) =>
                index % 2 === 1 ? (
                  <strong key={index} className="text-[#3B82F6] font-bold">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </li>
          );
        }
        if (trimmed === "") {
          return <p key={i} className="h-1.5" />;
        }

        // Render normal paragraph parsing bold sequences **text**
        const boldParts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-xs md:text-sm text-gray-300 leading-relaxed text-right font-medium">
            {boldParts.map((part, index) =>
              index % 2 === 1 ? (
                <strong key={index} className="text-[#3B82F6] font-bold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
};

// ============================================
// Main AIAnalysis Component
// ============================================
interface AIAnalysisProps {
  analysisResults: AnalysisResults;
  onReportReady?: (html: string) => void;
}

export default function AIAnalysis({ analysisResults, onReportReady }: AIAnalysisProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [output, setOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  // Load key from sessionStorage on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem("gsc_openrouter_override_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Auto scroll to bottom while streaming
  useEffect(() => {
    if (outputRef.current && status === "loading") {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, status]);

  const handleAnalyze = async () => {
    const keyToUse = apiKey.trim();
    
    setStatus("loading");
    setOutput("");
    setErrorMsg("");

    const promptText = buildPrompt(analysisResults);

    // Save/clean custom override key from sessionStorage
    if (rememberKey && keyToUse) {
      sessionStorage.setItem("gsc_openrouter_override_key", keyToUse);
    } else if (!keyToUse) {
      sessionStorage.removeItem("gsc_openrouter_override_key");
    }

    try {
      // Connect and stream solely via server proxy to ensure API privacy and prevent CORS barriers
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisData: analysisResults, userApiKey: keyToUse }),
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.error || "خطایی در برقراری ارتباط با وب‌سرویس تحلیل سرچ کنسول رخ داد.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("اتصال با استریم سرور میسر نشد.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataContent = cleanLine.substring(6).trim();
            if (dataContent === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                setOutput((prev) => {
                  const updated = prev + parsed.text;
                  return updated;
                });
              }
            } catch {
              // Ignore chunk parsing flaws
            }
          }
        }
      }

      setStatus("done");
      if (onReportReady) {
        onReportReady(output);
      }

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "خطایی در ارتباط با سرور هوش مصنوعی رخ داده است.");
    }
  };

  const handleDownload = () => {
    generateHTMLReport(analysisResults, output);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="ai-analysis-control-panel" style={{ direction: "rtl" }}>
      
      {/* Settings / API Key panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
          <div className="pb-4 border-b border-[#1E293B] mb-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="text-[#3B82F6] w-5 h-5" />
              اتصال به هوش مصنوعی OpenRouter (Gemma 4)
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-1">تنظیمات ورود به موتور پردازش سمنتیک و کانتنت سئو</p>
          </div>

          <div className="space-y-4">
            {/* Input API Key field */}
            <div>
              <label className="text-[11px] text-[#94A3B8] block mb-1.5 font-bold">
                کلید خصوصی OpenRouter API Key (اختیاری)
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="کلید sk-or-... خود را وارد کنید..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#1E2A3B] border border-[#1E293B] rounded-xl text-xs font-mono text-left text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
                  dir="ltr"
                  disabled={status === "loading"}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-3.5 top-3.5 text-gray-500 hover:text-white"
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Save check box */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember-key-checkbox"
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1E2A3B] border-[#1E293B] text-[#3B82F6] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember-key-checkbox" className="text-[11px] text-gray-400 select-none cursor-pointer">
                ذخیره موقت کلید در مرورگر (sessionStorage)
              </label>
            </div>

            <div className="p-3.5 bg-gray-800/30 border border-gray-800/60 rounded-xl text-[11px] leading-relaxed text-[#94A3B8]">
              <p>
                در صورت خالی گذاشتن این کادر، از سهمیه عمومی و ابری وب‌سایت برای پردازش داده‌های شما استفاده خواهد شد.
              </p>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[#3B82F6] hover:underline mt-2 inline-block font-semibold"
              >
                کسب کلید سئو به صورت آنی از OpenRouter ←
              </a>
            </div>

            {/* Action button */}
            <button
              onClick={handleAnalyze}
              disabled={status === "loading"}
              className="w-full py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-gray-800 disabled:text-gray-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  <Loader size={15} className="animate-spin text-white" />
                  در حال استخراج پیشنهادها...
                </>
              ) : (
                <>
                  <BrainCircuit size={15} />
                  آغاز تولید تحلیل هوشمند سئو
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output screen */}
      <div className="lg:col-span-2 space-y-4">
        {/* Timing Status indicator */}
        {(status === "loading" || status === "done") && (
          <div className="flex items-center gap-3.5 flex-wrap">
            <Timer running={status === "loading"} />

            {status === "loading" && (
              <span className="text-xs text-[#94A3B8] flex items-center gap-2">
                <Loader size={14} className="animate-spin text-[#3B82F6]" />
                موتور هوش مصنوعی در حال طبقه‌بندی و پردازش سئوی شماست...
              </span>
            )}

            {status === "done" && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle size={14} /> تحلیل سئوی شما با موفقیت به پایان رسید.
              </span>
            )}
          </div>
        )}

        <ProgressBar running={status === "loading"} />

        {/* Error Container */}
        {status === "error" && errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-xl text-xs text-red-200 flex gap-3 items-start" id="ai-error-indicator">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>بروز خطا در پردازش استریم: </strong>
              <p className="mt-1 leading-relaxed">{errorMsg}</p>
              <p className="mt-2 text-[#94A3B8] leading-relaxed">
                لطفا برقراری اتصال اینترنت، فرمت فایل انتخابی یا صحت کلید API را بررسی فرموده و مجددا تلاش کنید.
              </p>
            </div>
          </div>
        )}

        {/* Styled Output block */}
        {output ? (
          <div
            ref={outputRef}
            className="bg-[#0D1117] border border-[#1E293B] rounded-2xl p-6 md:p-8 max-h-[600px] overflow-y-auto shadow-2xl space-y-4 shadow-black"
            id="ai-console-output"
          >
            {renderCustomMarkdown(output)}

            {status === "loading" && (
              <span className="inline-block w-2.5 h-4 bg-[#3B82F6] animate-pulse mr-1 align-middle" />
            )}
          </div>
        ) : (
          <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-12 text-center text-[#94A3B8] flex flex-col items-center justify-center min-h-[400px]" id="ai-console-idle">
            <BrainCircuit size={48} className="text-[#8B5CF6]/30 mb-4 animate-pulse" />
            <h4 className="text-sm font-bold text-white mb-1.5">آماده شروع آنالیز هوش مصنوعی</h4>
            <p className="text-xs max-w-sm leading-relaxed text-gray-400">
              با فشردن دکمه «آغاز تولید تحلیل هوشمند سئو»، کل وب‌سایت و کلمات کلیدی پر‌بازده با کلاستربندی لایو تحلیل خواهند شد.
            </p>
          </div>
        )}

        {/* Download complete documentation button */}
        {status === "done" && output && (
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:opacity-90 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-purple-500/10"
            id="btn-download-ai-full-report"
          >
            <Download size={15} />
            دانلود فایل گزارش کامل HTML (بومی‌سازی شد)
          </button>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(250%); }
        }
        .animate-shimmer {
          animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
