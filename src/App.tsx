import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudUpload, BarChart3, TrendingUp, HelpCircle, AlertOctagon, Sparkles } from "lucide-react";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Sidebar from "./components/Layout/Sidebar";
import FileUpload from "./components/Upload/FileUpload";
import Overview from "./components/Dashboard/Overview";
import UrlTable from "./components/Dashboard/UrlTable";
import KeywordTable from "./components/Dashboard/KeywordTable";
import QuickWins from "./components/Insights/QuickWins";
import LowCTRAlert from "./components/Insights/LowCTRAlert";
import AIAnalysis from "./components/AI/AIAnalysis";
import { analyzeGscData } from "./utils/seoAnalyzer";
import { GscRow, AnalysisResults } from "./types";

export default function App() {
  const [rawData, setRawData] = useState<GscRow[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const handleDataLoaded = (data: GscRow[], loadedFileName: string) => {
    setRawData(data);
    setFileName(loadedFileName);
    const results = analyzeGscData(data);
    setAnalysisResults(results);
    setActiveTab("dashboard");
  };

  const handleClear = () => {
    setRawData([]);
    setFileName(null);
    setAnalysisResults(null);
    setActiveTab("dashboard");
  };

  // Setup sample data helper so the user can immediately play with the dashboard without uploading a GSC file
  const handleLoadSampleData = () => {
    const sampleRows: GscRow[] = [
      { query: "آموزش سئو سایت", page: "https://mysite.com/seo-training", clicks: 520, impressions: 4500, ctr: 0.1155, position: 2.1 },
      { query: "سئو تکنیکال چیست", page: "https://mysite.com/technical-seo", clicks: 310, impressions: 8900, ctr: 0.0348, position: 4.8 },
      { query: "بهینه سازی نرخ کلیک", page: "https://mysite.com/ctr-optimization", clicks: 12, impressions: 1200, ctr: 0.01, position: 1.8 },
      { query: "ابزارهای سئو رایگان", page: "https://mysite.com/free-seo-tools", clicks: 190, impressions: 2400, ctr: 0.0791, position: 3.5 },
      { query: "رفع کنیبالیزیشن در سئو", page: "https://mysite.com/seo-cannibalization", clicks: 45, impressions: 3800, ctr: 0.0118, position: 5.2 },
      { query: "کاهش رتبه گوگل", page: "https://mysite.com/rankings-drop", clicks: 75, impressions: 1600, ctr: 0.0468, position: 7.9 },
      { query: "سئو چیست", page: "https://mysite.com/what-is-seo", clicks: 1210, impressions: 45000, ctr: 0.0268, position: 8.4 },
      { query: "بهینه سازی عنوان صفحات", page: "https://mysite.com/meta-title-guide", clicks: 8, impressions: 1100, ctr: 0.0072, position: 2.4 },
      { query: "خرید بک لینک قوی", page: "https://mysite.com/backlinks", clicks: 420, impressions: 5300, ctr: 0.0792, position: 1.2 },
      { query: "سئو تکنیکال چیست", page: "https://mysite.com/what-is-technical-seo", clicks: 140, impressions: 5600, ctr: 0.025, position: 5.5 }, // Cannibalization example with Row 2
      { query: "آموزش سئو کلاه خاکستری", page: "https://mysite.com/grey-hat-seo", clicks: 11, impressions: 950, ctr: 0.0115, position: 6.8 },
    ];
    handleDataLoaded(sampleRows, "GSC_Sample_Export.csv");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1E] text-[#F1F5F9] font-sans antialiased" id="gsc-root-wrapper">
      
      {/* Sticky navigation and brand header */}
      <Header />

      {!analysisResults ? (
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8" id="landing-screen-wrapper">
          <div className="flex flex-col items-center justify-center py-10" id="landing-screen">
            
            {/* Visual Hero Intro */}
            <div className="text-center max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-full text-xs font-semibold text-[#8B5CF6] mb-4">
                <Sparkles size={13} className="animate-spin" />
                تحلیلگر سئو با قدرت پردازش مدل‌های هوش مصنوعی
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                سامانه هوشمند <span className="text-[#3B82F6]">آنالیز و بررسی</span> سرچ کنسول
              </h1>
              <p className="text-sm text-[#94A3B8] mt-4 leading-relaxed">
                ماتریس داده‌های سئو سرچ کنسول خود را بارگذاری کنید. ما فرصت‌های طلایی رتبه یک (Quick Wins)، هشدارهای مربوط به نرخ کلیک (Low CTR)، هم‌خواری آدرس‌ها (Keyword Cannibalization)، و برنامه‌های عملیاتی ۳ ماهه را استخراج می‌کنیم.
              </p>
            </div>

            {/* Uploader and trial data trigger */}
            <div className="max-w-xl w-full space-y-6">
              <FileUpload
                onDataLoaded={handleDataLoaded}
                onClear={handleClear}
                currentFileName={fileName}
                currentRowCount={rawData.length}
              />

              <div className="text-center">
                <span className="text-xs text-gray-500">فایلی برای تست ندارید؟ </span>
                <button
                  onClick={handleLoadSampleData}
                  className="text-xs text-[#3B82F6] hover:text-blue-400 font-bold hover:underline transition-colors cursor-pointer"
                  id="btn-load-sample"
                >
                  بارگذاری پروژه نمونه جهت بررسی داشبورد ←
                </button>
              </div>
            </div>

            {/* Explanatory cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-16" id="gsc-highlight-features">
              <div className="p-5 bg-[#111827] border border-[#1E293B] rounded-xl flex items-start gap-4">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">کشف فرصت‌های طلایی رشد (Quick Wins)</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">صفحات با ایمپرشن بالا که در آستانه صفحه اول یا رتبه یک هستند را شناسایی و رشد دهید.</p>
                </div>
              </div>
              <div className="p-5 bg-[#111827] border border-[#1E293B] rounded-xl flex items-start gap-4">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg">
                  <AlertOctagon size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">شناسایی تداخل آدرس ها (Cannibalization)</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">زمانی که چندین صفحه برای یک کلمه رتبه گرفته و اعتبار هم را می‌دزدند پیدا و رفع کنید.</p>
                </div>
              </div>
              <div className="p-5 bg-[#111827] border border-[#1E293B] rounded-xl flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">تحلیل استراتژیک و خروجی فیزیکی</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">با هوش مصنوعی گوگل تحلیل کلمه به کلمه بگیرید و یک گزارش HTML مستقل و قابل دانلود بسازید.</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      ) : (
        <div className="dashboard-layout">
          <Sidebar activeSection={activeTab} onSectionChange={setActiveTab} onAnalyzeNewData={handleClear} />
          <main className="dashboard-content">
            {/* Mounted Active workspace with tables, charts, and stream summaries */}
            <div className="space-y-8" id="gsc-active-workspace">
            
            {/* Header statistics bar */}
            <Overview stats={analysisResults.overview} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "dashboard" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-bento-grid">
                    
                    {/* Bento Box 1: Live AI Insights Sidebar - Spans 6 columns */}
                    <div className="lg:col-span-6 col-span-12 bg-[#111827] border border-[#8B5CF6]/30 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden h-full" id="bento-box-ai-sidebar">
                      <div className="absolute top-0 right-0 p-3 opacity-[0.03] select-none pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          <path d="M2 12h20" />
                        </svg>
                      </div>

                      <div>
                        {/* Header status block */}
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                          <h3 className="text-sm font-bold text-[#8B5CF6] tracking-tight">
                            تحلیل هوشمند زنده (AI)
                          </h3>
                        </div>

                        {/* Analysis List Rows */}
                        <div className="text-xs leading-relaxed text-[#CBD5E1] space-y-4 relative z-10 pr-2">
                          <div className="font-bold text-[#F1F5F9] pb-1 border-b border-gray-800/60">
                            بررسی اولیه داده‌های سایت شما:
                          </div>

                          {/* Dynamic point 1: general overview info */}
                          <div className="flex gap-2 items-start hover:text-white transition-colors">
                            <span className="text-[#8B5CF6] font-semibold">۱.</span>
                            <p>
                              وضعیت کلی رسانه: تعداد <strong className="text-white">{(analysisResults.topUrls.length).toLocaleString("fa-IR")} آدرس</strong> پربازدید با مجموع <strong className="text-white">{(analysisResults.overview.totalClicks).toLocaleString("fa-IR")} کلیک</strong> ثبت گردید.
                            </p>
                          </div>

                          {/* Dynamic point 2: golden opportunities (quick wins) */}
                          <div className="flex gap-2 items-start hover:text-white transition-colors">
                            <span className="text-[#8B5CF6] font-semibold">۲.</span>
                            <p>
                              {analysisResults.quickWins.length > 0 ? (
                                <>
                                  فرصت طلایی: کلمه <strong className="text-amber-400">«{analysisResults.quickWins[0].query}»</strong> متعلق به آدرس <span className="font-mono text-[10px] text-[#3B82F6]" dir="ltr">/{analysisResults.quickWins[0].page.substring(analysisResults.quickWins[0].page.lastIndexOf('/') + 1) || 'index'}/</span> در رتبه {analysisResults.quickWins[0].position.toFixed(1)} گوگل قرار دارد و پتانسیل جهش بالایی دارد.
                                </>
                              ) : (
                                "هیچ فرصت سریع طلایی با موقعیت ۴ تا ۱۰ فعلاً یافت نشد."
                              )}
                            </p>
                          </div>

                          {/* Dynamic point 3: critical low CTR warn */}
                          <div className="flex gap-2 items-start hover:text-white transition-colors">
                            <span className="text-[#8B5CF6] font-semibold">۳.</span>
                            <p>
                              {analysisResults.lowCTR.length > 0 ? (
                                <>
                                  هشدار جدی: عبارت <strong className="text-red-400">«{analysisResults.lowCTR[0].query}»</strong> رتبه عالی {analysisResults.lowCTR[0].position.toFixed(1)} دارد، اما نرخ کلیک آن <strong className="text-red-400">{(analysisResults.lowCTR[0].ctr * 100).toFixed(2)}%</strong> است. تگ عنوان را بازنویسی کنید.
                                </>
                              ) : (
                                "نرخ کلیک صفحات عالی و منطبق با رتبه‌شان برآورد می‌شود."
                              )}
                            </p>
                          </div>

                          {/* Dynamic point 4: cannibalization report */}
                          <div className="flex gap-2 items-start hover:text-white transition-colors">
                            <span className="text-[#8B5CF6] font-semibold">۴.</span>
                            <p>
                              {analysisResults.cannibalization.length > 0 ? (
                                <>
                                  هم‌خواری رتبه: تداخل آدرس‌ها در کلمه <strong className="text-purple-400">«{analysisResults.cannibalization[0].query}»</strong> یافت شد؛ <strong className="text-purple-300">{analysisResults.cannibalization[0].pageCount} آدرس مختلف</strong> در رتبه‌دهی متداخل هستند.
                                </>
                              ) : (
                                "هیچ تداخل هم‌خواری (Cannibalization) شناسایی نشد!"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div className="mt-5 relative z-10">
                        <button
                          onClick={() => setActiveTab("ai")}
                          className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/10 cursor-pointer"
                        >
                          <span>مشاهده و تولید گزارش عمیق سئو (AI) 🧠</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Bento Box 2: Quick Wins Table Preview - Spans 6 columns */}
                    <div className="lg:col-span-6 col-span-12 bg-[#111827] border border-[#1E293B] rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl" id="bento-box-quickwins-table">
                      <div>
                        <div className="p-4 border-b border-[#1E293B] flex justify-between items-center bg-[#1E2A3B]/20">
                          <h3 className="font-bold text-xs text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h8l-2 10 7-10h-8l2-10z"/></svg>
                            فرصت‌های طلایی رشد در گوگل (Quick Wins)
                          </h3>
                          <button 
                            onClick={() => setActiveTab("opportunities")}
                            className="text-[10px] text-[#3B82F6] hover:underline transition-colors font-bold cursor-pointer bg-transparent border-none"
                          >
                            مشاهده لیست فرصت‌ها ←
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-[#1E2A3B]/60 text-[#94A3B8] border-b border-[#1E293B]">
                                <th className="px-4 py-3 font-medium">ردیف</th>
                                <th className="px-4 py-3 font-medium">عبارت کلیدی متناظر</th>
                                <th className="px-4 py-3 font-medium text-left">آدرس صفحه (URL)</th>
                                <th className="px-4 py-3 font-medium text-center">نمایش (Impressions)</th>
                                <th className="px-4 py-3 font-medium text-center">رتبه</th>
                                <th className="px-4 py-3 font-medium text-center">اولویت</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1E293B]">
                              {analysisResults.quickWins.slice(0, 3).map((win, idx) => (
                                <tr key={idx} className="hover:bg-[#1E2A3B]/30 transition-colors">
                                  <td className="px-4 py-3 text-[#94A3B8]">{idx + 1}</td>
                                  <td className="px-4 py-3 font-bold text-white">{win.query}</td>
                                  <td className="px-4 py-3 font-mono text-[#3B82F6] text-left truncate max-w-[200px]" dir="ltr">
                                    /{win.page.substring(win.page.lastIndexOf('/') + 1) || 'index'}/
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-300">{(win.impressions).toLocaleString("fa-IR")}</td>
                                  <td className="px-4 py-3 text-center text-amber-400 font-extrabold">{win.position.toFixed(1)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      win.priority === "High"
                                        ? "bg-[#EF4444]/15 text-[#EF4444]"
                                        : "bg-[#F59E0B]/15 text-[#F59E0B]"
                                    }`}>
                                      {win.priority === "High" ? "بالا" : "متوسط"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {analysisResults.quickWins.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#94A3B8]">
                                    هیچ کلمه طلایی با رتبه ۴ تا ۱۰ در این ردیف‌ها شناسایی نشد.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Bento Box 3: Uploader Widget - Spans 12 columns */}
                    <div className="lg:col-span-12 col-span-12 flex flex-col h-full" id="bento-box-uploader">
                      <FileUpload
                        onDataLoaded={handleDataLoaded}
                        onClear={handleClear}
                        currentFileName={fileName}
                        currentRowCount={rawData.length}
                      />
                    </div>

                  </div>
                )}

                {activeTab === "urls" && (
                  <div id="urls-tab-panel">
                    <UrlTable urlData={analysisResults.rawData} />
                  </div>
                )}

                {activeTab === "keywords" && (
                  <div id="keywords-tab-panel">
                    <KeywordTable
                      keywordData={analysisResults.topKeywords}
                      cannibalizationData={analysisResults.cannibalization}
                    />
                  </div>
                )}

                {activeTab === "opportunities" && (
                  <div className="space-y-8" id="opportunities-tab-panel">
                    <QuickWins ops={analysisResults.quickWins} />
                    <LowCTRAlert lowCtrOps={analysisResults.lowCTR} />
                  </div>
                )}

                {activeTab === "ai" && (
                  <div id="ai-tab-panel">
                    <AIAnalysis analysisResults={analysisResults} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>
    )}

      <Footer />
    </div>
  );
}
