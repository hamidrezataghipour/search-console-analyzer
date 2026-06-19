import { useState, useMemo } from "react";
import { Search, ArrowUpDown, HelpCircle, AlertTriangle, Layers } from "lucide-react";
import { CannibalizationItem } from "../../types";

interface KeywordTableProps {
  keywordData: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  cannibalizationData: CannibalizationItem[];
}

type TabType = "all" | "cannibalization";

export default function KeywordTable({ keywordData, cannibalizationData }: KeywordTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredKeywords = useMemo(() => {
    return keywordData.filter(item =>
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [keywordData, searchTerm]);

  const filteredCannibalization = useMemo(() => {
    return cannibalizationData.filter(item =>
      item.query.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cannibalizationData, searchTerm]);

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl" id="keyword-table-card">
      
      {/* Header, Search and Tab selections */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1E293B]">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="text-[#3B82F6] w-5 h-5" />
            تحلیل جامع کلمات کلیدی و هم‌خواری (Cannibalization)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1">بررسی کارایی عبارات کلیدی و رفع جریمه‌های توزیع رتبه در گوگل</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-[#1E2A3B] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "all"
                ? "bg-[#3B82F6] text-white"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            همه عبارات کلیدی
          </button>
          <button
            onClick={() => setActiveTab("cannibalization")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === "cannibalization"
                ? "bg-[#8B5CF6] text-white"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <AlertTriangle size={12} className={activeTab === "cannibalization" ? "text-white" : "text-amber-400"} />
            هم‌خواری رتبه ({cannibalizationData.length})
          </button>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="mb-5 relative max-w-sm">
        <input
          type="text"
          placeholder="جستجو در بین کلمات کلیدی..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-3 pr-10 py-2 bg-[#1E2A3B] border border-[#1E293B] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
        />
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
      </div>

      {/* Main content display */}
      {activeTab === "all" ? (
        <div className="overflow-x-auto rounded-xl border border-[#1E293B]" id="keyword-all-panel">
          <table className="w-full text-right border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[#1E2A3B]/50 border-b border-[#1E293B]">
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">ردیف</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">کلمه / عبارت جستجو شده</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">کلیک ورودی</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">نمایش کل (Impressions)</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">نرخ کلیک (CTR)</th>
                <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">رتبه میانگین در نتایج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredKeywords.slice(0, 50).map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1E2A3B]/20 transition-colors">
                  <td className="py-3.5 px-4 text-xs text-gray-500">{idx + 1}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-white max-w-[200px] truncate">{row.query}</td>
                  <td className="py-3.5 px-4 text-xs text-white font-semibold">{row.clicks.toLocaleString("fa-IR")}</td>
                  <td className="py-3.5 px-4 text-xs text-[#94A3B8]">{row.impressions.toLocaleString("fa-IR")}</td>
                  <td className="py-3.5 px-4 text-xs text-emerald-400">{(row.ctr * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-amber-400">{row.position.toFixed(1)}</td>
                </tr>
              ))}
              {filteredKeywords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-[#94A3B8]">عبارتی یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div id="keyword-cannibalization-panel" className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div>
              <strong>هم‌خواری رتبه (Keyword Cannibalization چیست؟)</strong>
              <p className="mt-1">
                این پدیده زمانی رخ می‌دهد که گوگل برای یک کلمه کلیدی، چند آدرس مختلف از سایت شما را نمایش می‌دهد. این امر موجب تقسیم اعتبار، کلیک‌ها و در نهایت تنزل رتبه کل صفحات شما می‌شود. راه‌حل اصلاحی شامل ادغام محتوا، ریدایرکت ۳۰۱ یا تنظیم شفاف تگ‌های کانونیکال (Canonical) است.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#1E2A3B]/50 border-b border-[#1E293B]">
                  <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">ردیف</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">کلمه متداخل (Cannibalized)</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">تعداد صفحات درگیر</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">جمع کلیک کلمه</th>
                  <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">تفکیک صفحات متداخل و رتبه مربوطه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filteredCannibalization.slice(0, 30).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1E2A3B]/10 transition-transform">
                    <td className="py-4 px-4 text-xs text-gray-500 align-top">{idx + 1}</td>
                    <td className="py-4 px-4 text-xs font-black text-white align-top">{row.query}</td>
                    <td className="py-4 px-4 text-xs align-top">
                      <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-md text-[10px] font-bold">
                        {row.pageCount} آدرس مرتبط
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-white align-top">{row.totalClicks.toLocaleString("fa-IR")}</td>
                    <td className="py-4 px-4 text-xs">
                      <div className="space-y-3">
                        {row.pages.map((p, pIdx) => (
                          <div key={pIdx} className="bg-[#1E2A3B]/40 p-2.5 rounded-lg border border-[#1E293B]/70 hover:border-gray-700 transition-colors">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-[#94A3B8] font-mono select-all break-all" dir="ltr">{p.page}</span>
                            </div>
                            <div className="flex gap-4 text-[10px] text-gray-400">
                              <span>کلیک: <strong className="text-white">{p.clicks}</strong></span>
                              <span>نمایش: <strong className="text-white">{p.impressions}</strong></span>
                              <span>رتبه: <strong className="text-amber-400 font-bold">{p.position.toFixed(1)}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCannibalization.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#94A3B8]">
                      سایت شما فاقد صفحات متداخل و هم‌خوار است. عالی‌ترین عملکرد سئو!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
