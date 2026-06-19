import React, { useState, useMemo, useRef, useEffect, ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MousePointerClick, Eye, Percent, Trophy } from "lucide-react";
import { GscRow } from "../../types";

interface ChartsSectionProps {
  data: GscRow[];
}

// Custom responsive wrapper to prevent chart sizing issues
const ChartWrapper = ({ children, height = 360 }: { children: ReactNode; height?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > 10) setVisible(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full relative" style={{ height, minWidth: 0 }}>
      {visible ? (
        children
      ) : (
        <div className="w-full absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
          در حال بارگذاری نمودار...
        </div>
      )}
    </div>
  );
};

// Beautiful GSC-styled Tooltip with metric coordinates
const GscTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E2A3B] border border-slate-700/60 rounded-xl p-4 shadow-2xl text-right text-xs leading-relaxed space-y-2 min-w-[200px]" dir="rtl">
      {label && (
        <p className="text-[#94A3B8] font-mono border-b border-slate-800 pb-1.5 mb-2 truncate max-w-[280px]">
          {label}
        </p>
      )}
      {payload.map((p: any, i: number) => {
        let valueStr = p.value;
        if (p.name.includes("CTR")) {
          valueStr = Number(p.value).toFixed(2) + "٪";
        } else if (p.name.includes("رتبه")) {
          valueStr = Number(p.value).toFixed(1);
        } else {
          valueStr = Math.round(Number(p.value)).toLocaleString("fa-IR");
        }

        return (
          <div key={i} className="flex justify-between items-center gap-4">
            <span style={{ color: p.color }} className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}:
            </span>
            <span className="font-mono text-white font-semibold">{valueStr}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function ChartsSection({ data }: ChartsSectionProps) {
  const [activeMetrics, setActiveMetrics] = useState({
    clicks: true,
    impressions: true,
    ctr: false,
    position: false,
  });

  if (!data || data.length === 0) return null;

  // 1. Process GSC Overall Cards Stats
  const topStats = useMemo(() => {
    let clicks = 0;
    let impressions = 0;
    let totalPos = 0;
    let posCount = 0;

    data.forEach((row) => {
      clicks += row.clicks || 0;
      impressions += row.impressions || 0;
      if (row.position > 0) {
        totalPos += row.position;
        posCount++;
      }
    });

    const avgCTR = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const avgPos = posCount > 0 ? totalPos / posCount : 0;

    return {
      clicks,
      impressions,
      ctr: avgCTR,
      position: avgPos,
    };
  }, [data]);

  // 2. Map standard GSC chart plotting over top 15 rows
  const chartData = useMemo(() => {
    const TOP = 15;
    return [...data]
      .slice(0, TOP)
      .map((row, index) => {
        const rawLabel = row.page || row.query || `ردیف ${index + 1}`;
        let label = rawLabel;

        // Simplify long URLs
        if (rawLabel.startsWith("http")) {
          try {
            const parsed = new URL(rawLabel);
            label = parsed.pathname || rawLabel;
            if (label.length > 30) {
              label = label.substring(0, 30) + "...";
            }
          } catch {
            label = rawLabel.length > 30 ? rawLabel.substring(0, 30) + "..." : rawLabel;
          }
        } else {
          label = rawLabel.length > 25 ? rawLabel.substring(0, 25) + "..." : rawLabel;
        }

        // Handle CTR normalization
        let parsedCTR = Number(row.ctr) || 0;
        if (parsedCTR <= 1 && parsedCTR > 0) {
          parsedCTR = parsedCTR * 100;
        }

        return {
          id: index + 1,
          label,
          fullLabel: rawLabel,
          clicks: Number(row.clicks) || 0,
          impressions: Number(row.impressions) || 0,
          ctr: parseFloat(parsedCTR.toFixed(2)),
          position: parseFloat((Number(row.position) || 0).toFixed(1)),
        };
      });
  }, [data]);

  const toggleMetric = (metric: "clicks" | "impressions" | "ctr" | "position") => {
    setActiveMetrics((prev) => {
      const copy = { ...prev, [metric]: !prev[metric] };
      // Make sure at least one metric is always selected
      if (!copy.clicks && !copy.impressions && !copy.ctr && !copy.position) {
        return prev;
      }
      return copy;
    });
  };

  const fmtNum = (n: number) => Math.round(n).toLocaleString("fa-IR");

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-6" id="gsc-master-chart-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-pulse" />
            نمودار جامع عملکرد ترافیک سرچ کنسول (GSC)
          </h3>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            متریک‌های کلیک، نمایش، رتبه و نرخ کلیک برترین آدرس‌ها/عبارت‌ها را با کلیک روی کارت‌های بالا تحلیل کنید.
          </p>
        </div>
      </div>

      {/* Grid of 4 Interactive Google Search Console Metric Segment Controllers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 select-none">
        
        {/* Total Clicks card (Blue) */}
        <div
          onClick={() => toggleMetric("clicks")}
          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
            activeMetrics.clicks
              ? "bg-[#3B82F6]/10 border-[#3B82F6] ring-1 ring-[#3B82F6]/30 shadow-lg shadow-[#3B82F6]/5"
              : "bg-slate-950/20 border-slate-800 opacity-60 hover:opacity-85"
          }`}
          id="gsc-card-clicks"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#a3cbff]">
            <MousePointerClick size={14} className="text-[#3B82F6]" />
            <span>مجموع کلیک‌ها</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between select-text" onClick={(e) => e.stopPropagation()}>
            <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">
              {fmtNum(topStats.clicks)}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">کلیک</span>
          </div>
          {activeMetrics.clicks && <div className="h-1 bg-[#3B82F6] rounded-full mt-3" />}
        </div>

        {/* Total Impressions card (Purple) */}
        <div
          onClick={() => toggleMetric("impressions")}
          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
            activeMetrics.impressions
              ? "bg-[#BFDBFE]/10 border-purple-500 ring-1 ring-purple-500/30 shadow-lg shadow-purple-500/5"
              : "bg-slate-950/20 border-slate-800 opacity-60 hover:opacity-85"
          }`}
          id="gsc-card-impressions"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#e1bfff]">
            <Eye size={14} className="text-purple-400" />
            <span>مجموع نمایش‌ها (Imp)</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between select-text" onClick={(e) => e.stopPropagation()}>
            <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">
              {fmtNum(topStats.impressions)}
            </span>
            <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">نمایش</span>
          </div>
          {activeMetrics.impressions && <div className="h-1 bg-purple-500 rounded-full mt-3" />}
        </div>

        {/* Average CTR card (Green) */}
        <div
          onClick={() => toggleMetric("ctr")}
          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
            activeMetrics.ctr
              ? "bg-[#10B981]/10 border-[#10B981] ring-1 ring-[#10B981]/30 shadow-lg shadow-[#10B981]/5"
              : "bg-slate-950/20 border-slate-800 opacity-60 hover:opacity-85"
          }`}
          id="gsc-card-ctr"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#a7f3d0]">
            <Percent size={14} className="text-[#10B981]" />
            <span>میانگین CTR</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between select-text" onClick={(e) => e.stopPropagation()}>
            <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">
              {topStats.ctr.toFixed(2)}٪
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">نرخ کلیک</span>
          </div>
          {activeMetrics.ctr && <div className="h-1 bg-[#10B981] rounded-full mt-3" />}
        </div>

        {/* Average Position card (Orange/Yellow) */}
        <div
          onClick={() => toggleMetric("position")}
          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
            activeMetrics.position
              ? "bg-[#F59E0B]/10 border-[#F59E0B] ring-1 ring-[#F59E0B]/30 shadow-lg shadow-[#F59E0B]/5"
              : "bg-slate-950/20 border-slate-800 opacity-60 hover:opacity-85"
          }`}
          id="gsc-card-position"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#fde68a]">
            <Trophy size={14} className="text-[#F59E0B]" />
            <span>میانگین رتبه (Pos)</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between select-text" onClick={(e) => e.stopPropagation()}>
            <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">
              {topStats.position.toFixed(1)}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">جایگاه</span>
          </div>
          {activeMetrics.position && <div className="h-1 bg-[#F59E0B] rounded-full mt-3" />}
        </div>

      </div>

      {/* Master Recharts Screen with dynamic toggleable Line vectors */}
      <ChartWrapper height={380}>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 65 }}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
            
            <XAxis
              dataKey="label"
              tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "Inter, sans-serif" }}
              interval={0}
              height={60}
              angle={-35}
              textAnchor="end"
            />

            {/* Standard Primary count axis scale (for Clicks/Impressions) */}
            {(activeMetrics.clicks || activeMetrics.impressions) && (
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                tickFormatter={(val) => val.toLocaleString("fa-IR")}
                width={45}
                axisLine={false}
              />
            )}

            {/* Scale for CTR */}
            {activeMetrics.ctr && (
              <YAxis
                yAxisId="right_ctr"
                orientation="right"
                tick={{ fill: "#10B981", fontSize: 10 }}
                tickFormatter={(val) => `${val}٪`}
                width={45}
                axisLine={false}
              />
            )}

            {/* Scale for Positions (Inverted, rank 1 is at the top) */}
            {activeMetrics.position && (
              <YAxis
                yAxisId="right_pos"
                orientation="right"
                reversed
                domain={[1, "auto"]}
                tick={{ fill: "#F59E0B", fontSize: 10 }}
                tickFormatter={(val) => `${val}`}
                width={35}
                axisLine={false}
              />
            )}

            <Tooltip content={<GscTooltip />} cursor={{ stroke: "#475569", strokeWidth: 1 }} />

            {/* 1. Clicks Line */}
            {activeMetrics.clicks && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="clicks"
                name="کل کلیک‌ها"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            )}

            {/* 2. Impressions Line */}
            {activeMetrics.impressions && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="impressions"
                name="کل نمایش‌ها"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ fill: "#a855f7", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            )}

            {/* 3. CTR Line */}
            {activeMetrics.ctr && (
              <Line
                yAxisId="right_ctr"
                type="monotone"
                dataKey="ctr"
                name="میانگین CTR"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ fill: "#10B981", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            )}

            {/* 4. Position Line (Reversed scale) */}
            {activeMetrics.position && (
              <Line
                yAxisId="right_pos"
                type="monotone"
                dataKey="position"
                name="میانگین رتبه"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ fill: "#F59E0B", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            )}

          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
}
