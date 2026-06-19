import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Globe, AlertTriangle } from "lucide-react";
import { GscRow } from "../../types";

interface UrlTableProps {
  urlData: GscRow[];
}

type SortField = "label" | "clicks" | "impressions" | "ctr" | "position";

export default function UrlTable({ urlData }: UrlTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("clicks");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const perPage = 25;

  // ============ Robust Row Extraction ============
  const rows = useMemo(() => {
    if (!urlData || urlData.length === 0) return [];

    return urlData
      .map((row, idx) => {
        // Try multiple fields to support flexible imports (both queries-only or page-only or generic rows)
        const label =
          row.page ||
          row.query ||
          (row as any).url ||
          (row as any).address ||
          (row as any).keyword ||
          (row as any).Page ||
          (row as any).URL ||
          (row as any).Query ||
          Object.values(row).find((v) => typeof v === "string" && v.length > 0) ||
          `ردیف ${idx + 1}`;

        const clicks = Math.round(Number(row.clicks || (row as any).Clicks || (row as any).click || 0));
        const impressions = Math.round(Number(row.impressions || (row as any).Impressions || (row as any).impression || 0));
        const position = parseFloat(Number(row.position || (row as any).Position || (row as any).rank || 0).toFixed(1));

        // Normalize CTR representation (0.05 or 5.0%)
        let ctr = Number(row.ctr || (row as any).CTR || (row as any).Ctr || 0);
        if (ctr > 1) {
          ctr = ctr / 100;
        }

        return {
          id: idx,
          label: String(label).trim(),
          clicks,
          impressions,
          ctr,
          position,
        };
      })
      .filter((row) => row.clicks > 0 || row.impressions > 0 || row.label !== "");
  }, [urlData]);

  // ============ Search Filters ============
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.label.toLowerCase().includes(q));
  }, [rows, search]);

  // ============ Sorting ============
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "label") {
        return sortDir === "desc"
          ? String(bVal).localeCompare(String(aVal), "fa")
          : String(aVal).localeCompare(String(bVal), "fa");
      } else {
        const numA = Number(aVal) || 0;
        const numB = Number(bVal) || 0;
        return sortDir === "desc" ? numB - numA : numA - numB;
      }
    });
  }, [filtered, sortField, sortDir]);

  // ============ Pagination ============
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = useMemo(() => {
    return sorted.slice((page - 1) * perPage, page * perPage);
  }, [sorted, page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const fmtNum = (n: number) => Math.round(n).toLocaleString("fa-IR");
  const fmtCTR = (n: number) => (n * 100).toFixed(1) + "٪";
  const fmtPos = (n: number) => Number(n).toFixed(1);

  const shortUrl = (str: string) => {
    if (!str) return "—";
    if (str.startsWith("http")) {
      try {
        const hostPath = new URL(str).pathname || str;
        return hostPath.length > 70 ? hostPath.substring(0, 70) + "…" : hostPath;
      } catch {
        return str;
      }
    }
    return str.length > 70 ? str.slice(0, 70) + "…" : str;
  };

  const posColor = (p: number) =>
    p <= 3 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
    p <= 10 ? "text-sky-400 bg-sky-500/10 border border-sky-500/20" :
    p <= 20 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
              "text-rose-400 bg-rose-500/10 border border-rose-500/20";

  const ctrColor = (c: number) =>
    c >= 0.05 ? "text-emerald-400 bg-emerald-500/10" :
    c >= 0.02 ? "text-amber-400 bg-amber-500/10" :
              "text-rose-400 bg-rose-500/10";

  if (!urlData || urlData.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-12 text-center text-[#94A3B8]" id="url-table-card-empty" style={{ direction: "rtl" }}>
        <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
        <h4 className="text-sm font-bold text-white mb-2">ابتدا فایل سرچ کنسول را آپلود کنید</h4>
        <p className="text-xs text-gray-500">داده‌های استخراج شده در این قسمت به صورت زنده طبقه‌بندی می‌شوند.</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6" id="url-table-empty-warning" style={{ direction: "rtl" }}>
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-300 text-xs flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            ⚠️ هیچ داده‌ای برای نمایش یافت نشد. ستون‌های فایل را بررسی کنید. فیلدهای موجود در شیت:{" "}
            <strong className="text-white font-mono">{Object.keys(urlData[0] || {}).join(", ")}</strong>
          </span>
        </div>
      </div>
    );
  }

  // Summary counts
  const totalClicksSum = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressionsSum = rows.reduce((s, r) => s + r.impressions, 0);

  return (
    <div className="space-y-6" style={{ direction: "rtl" }} id="url-table-workspace">
      
      {/* Quick stats mini ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "مجموع آدرس‌ها / کلمه‌های ردیابی شده", value: fmtNum(rows.length), color: "text-[#3B82F6]" },
          { label: "مجموع کلیک‌های ورودی", value: fmtNum(totalClicksSum), color: "text-emerald-400" },
          { label: "مجموع نمایش در گوگل (Impressions)", value: fmtNum(totalImpressionsSum), color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-center">
            <span className="text-[11px] text-[#94A3B8] mb-1">{stat.label}</span>
            <span className={`text-lg md:text-xl font-black ${stat.color} font-mono`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Controller Block */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <Globe className="text-[#3B82F6] w-5 h-5" />
              جدول جامع ردیف‌های عملکرد ترافیک (URLs / Queries)
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-1">
              نمایش تمام صفحات و کلماتی که در خروجی فایل شما وجود دارند، مرتب شده بر اساس بیشترین تعامل
            </p>
          </div>

          {/* Search container */}
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="🔍  جستجو در مسیرها و کلمات کلیدی..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-3 pr-10 py-2.5 bg-[#1E2A3B] border border-[#1E293B] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="text-[11px] text-[#94A3B8] font-semibold">
          نمایش {fmtNum(paginated.length)} از {fmtNum(sorted.length)} مورد پیدا شده
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1E293B] bg-slate-950/20">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#1E2A3B]/50 border-b border-[#1E293B]">
                <th className="py-3.5 px-4 text-xs font-semibold text-[#94A3B8] w-12 text-center">#</th>
                {[
                  { key: "label", label: "آدرس صفحه / کلمه جستجو شده" },
                  { key: "clicks", label: "کلیک" },
                  { key: "impressions", label: "نمایش (Impressions)" },
                  { key: "ctr", label: "نرخ کلیک (CTR)" },
                  { key: "position", label: "میانگین رتبه" }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as SortField)}
                    className="py-3.5 px-4 text-xs font-semibold text-[#94A3B8] cursor-pointer hover:text-white transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>{col.label}</span>
                      <ArrowUpDown size={12} className={sortField === col.key ? "text-[#3B82F6]" : "text-[#94A3B8]/30"} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#94A3B8]">
                    هیچ موردی مطابق با عبارت جستجو شده پیدا نشد.
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => {
                  const itemNumber = (page - 1) * perPage + idx + 1;
                  return (
                    <tr key={row.id} className="hover:bg-[#1E2A3B]/25 transition-colors group">
                      <td className="py-3 px-4 text-xs text-gray-500 font-mono text-center">
                        {itemNumber.toLocaleString("fa-IR")}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[#3B82F6] max-w-[340px] truncate text-left break-all group-hover:text-sky-400 transition-colors" dir="ltr">
                        <a
                          href={row.label.startsWith("http") ? row.label : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={row.label.startsWith("http") ? "hover:underline cursor-pointer" : "cursor-default text-gray-300 font-sans text-right"}
                          title={row.label}
                        >
                          {shortUrl(row.label)}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-white font-mono">
                        {fmtNum(row.clicks)}
                      </td>
                      <td className="py-3 px-4 text-xs text-purple-300 font-mono">
                        {fmtNum(row.impressions)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${ctrColor(row.ctr)}`}>
                          {fmtCTR(row.ctr)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${posColor(row.position)}`}>
                          {fmtPos(row.position)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Navigation pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1E293B]" id="url-pagination">
            <span className="text-xs text-[#94A3B8]">
              نمایش صفحه <strong className="text-white">{page.toLocaleString("fa-IR")}</strong> از{" "}
              <strong className="text-white">{totalPages.toLocaleString("fa-IR")}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 bg-[#1E2A3B] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 bg-[#1E2A3B] border border-[#1E293B] rounded-lg text-xs text-[#94A3B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
