import { useState, useMemo } from "react";
import { Zap, ArrowUpDown, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { QuickWin } from "../../types";

interface QuickWinsProps {
  ops: QuickWin[];
}

export default function QuickWins({ ops }: QuickWinsProps) {
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting based on impressions descending as default
  const sortedData = useMemo(() => {
    const list = [...ops];
    list.sort((a, b) => {
      return sortAsc ? a.impressions - b.impressions : b.impressions - a.impressions;
    });
    return list;
  }, [ops, sortAsc]);

  // Paginated item slice
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl mb-8" id="quickwins-container">
      
      {/* Title */}
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-[#1E293B]">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
          <Zap className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            فرصت‌های طلایی سئو (Quick Wins)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1">
            این واژه‌ها و صفحات در نزدیکی صفحه اول گوگل (بین رتبه ۴ تا ۱۰) و دارای نمایش بالایی هستند. با بهبود محتوا یا بکلینک‌های فنی، می‌توانند سریعاً به صدر نتایج منتقل شوند.
          </p>
        </div>
      </div>

      {/* Table list view */}
      <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
        <table className="w-full text-right border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#1E2A3B]/50 border-b border-[#1E293B]">
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">ردیف</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">عبارت کلیدی متناظر</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8] cursor-pointer hover:text-white" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1.5 justify-end">
                  <span>میزان نمایش (Impressions)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">تعداد کلیک</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">نرخ کلیک (CTR)</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">رتبه رتبه‌بندی فعلی</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">اولویت بهینه‌سازی</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1E2A3B]/20 transition-colors">
                  <td className="py-3.5 px-4 text-xs text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="py-3.5 px-4 text-xs font-bold text-white">
                    <div>{row.query}</div>
                    <div className="text-[10px] text-gray-500 font-mono text-left truncate max-w-[280px]" dir="ltr">
                      {row.page}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-white font-semibold">{row.impressions.toLocaleString("fa-IR")}</td>
                  <td className="py-3.5 px-4 text-xs text-[#94A3B8]">{row.clicks.toLocaleString("fa-IR")}</td>
                  <td className="py-3.5 px-4 text-xs text-emerald-400 font-medium">{(row.ctr * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4 text-xs font-extrabold text-amber-400">{row.position.toFixed(1)}</td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.priority === "High"
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20"
                        : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                    }`}>
                      {row.priority === "High" ? "اولویت فوری" : "اولویت متوسط"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#94A3B8]">
                  هیچ کلمه طلایی با موقعیت ۴ تا ۱۰ در این فایل یافت نشد. داده‌های رتبه‌بندی بیشتری آپلود کنید.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1E293B]">
          <span className="text-xs text-[#94A3B8]">
            نمایش صفحه <strong className="text-white">{currentPage}</strong> از <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-[#1E2A3B] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-[#1E2A3B] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
