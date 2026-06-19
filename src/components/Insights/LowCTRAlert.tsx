import { useState, useMemo } from "react";
import { AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { LowCTR } from "../../types";

interface LowCTRAlertProps {
  lowCtrOps: LowCTR[];
}

export default function LowCTRAlert({ lowCtrOps }: LowCTRAlertProps) {
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting based on potentialClicksLost
  const sortedData = useMemo(() => {
    const list = [...lowCtrOps];
    list.sort((a, b) => {
      return sortAsc ? a.potentialClicksLost - b.potentialClicksLost : b.potentialClicksLost - a.potentialClicksLost;
    });
    return list;
  }, [lowCtrOps, sortAsc]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl" id="lowctr-alert-container">
      
      {/* Header */}
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-[#1E293B]">
        <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            هشدار: صفحات رول اول با نرخ کلیک (CTR) ضعیف
          </h3>
          <p className="text-xs text-[#94A3B8] mt-1">
            این واژه‌ها و آدرس‌ها رتبه بسیار خوبی در گوگل دارند (بین ۱ تا ۵) اما میزان کلیک ورودی آن‌ها از درصد استاندارد کمتر است. این یعنی عنوان صفحه (Title) یا توضیحات متا (Meta Description) برای کاربر جذاب نیست یا ریچ‌اسنیپت مناسبی ندارید.
          </p>
        </div>
      </div>

      {/* Table responsive view */}
      <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
        <table className="w-full text-right border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#1E2A3B]/50 border-b border-[#1E293B]">
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">ردیف</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">عبارت جستجو شده / کلمه کلیدی</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8] cursor-pointer hover:text-white" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1.5 justify-end">
                  <span>کلیک‌های از دست رفته احتمالی</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">کلیک دریافتی</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">نرخ کلیک (CTR) واقعی</th>
              <th className="py-3 px-4 text-xs font-semibold text-[#94A3B8]">رتبه رتبه‌بندی در نتایج</th>
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
                  <td className="py-3.5 px-4 text-xs text-[#EF4444] font-black">+{row.potentialClicksLost.toLocaleString("fa-IR")} کلیک ورودی</td>
                  <td className="py-3.5 px-4 text-xs text-[#94A3B8]">{row.clicks.toLocaleString("fa-IR")}</td>
                  <td className="py-3.5 px-4 text-xs text-[#EF4444] font-bold">{(row.ctr * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4 text-xs font-black text-amber-400">{row.position.toFixed(1)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#94A3B8]">
                  هیچ هشدار CTR ضعیفی در این داده‌ها یافت نشد. همه محتواها با نرخ کلیک مناسب هدایت می‌شوند!
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
