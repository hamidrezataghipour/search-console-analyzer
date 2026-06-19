import { Eye, MousePointer, Award, TrendingUp } from "lucide-react";
import { SummaryStats } from "../../types";

interface OverviewProps {
  stats: SummaryStats;
}

export default function Overview({ stats }: OverviewProps) {
  const cards = [
    {
      title: "کل کلیک‌ها",
      value: stats.totalClicks.toLocaleString("fa-IR"),
      badge: "+۱۲.۴٪",
      badgeColor: "text-[#10B981] bg-[#10B981]/10",
      icon: <MousePointer className="w-4 h-4 text-[#3B82F6]" />,
      bgIcon: "bg-[#3B82F6]/10",
    },
    {
      title: "کل ایمپرشن‌ها",
      value: stats.totalImpressions.toLocaleString("fa-IR"),
      badge: "+۸.۲٪",
      badgeColor: "text-[#10B981] bg-[#10B981]/10",
      icon: <Eye className="w-4 h-4 text-[#8B5CF6]" />,
      bgIcon: "bg-[#8B5CF6]/10",
    },
    {
      title: "میانگین CTR",
      value: `${stats.avgCTR.toFixed(2)}%`,
      badge: stats.avgCTR > 5 ? "عالی" : "نیاز به بهبود",
      badgeColor: stats.avgCTR > 5 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#F59E0B] bg-[#F59E0B]/10",
      icon: <TrendingUp className="w-4 h-4 text-[#10B981]" />,
      bgIcon: "bg-[#10B981]/10",
    },
    {
      title: "میانگین رتبه",
      value: stats.avgPosition.toFixed(1),
      badge: stats.avgPosition < 15 ? "بهبود یافته" : "رتبه‌های عمومی",
      badgeColor: stats.avgPosition < 15 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#EF4444] bg-[#EF4444]/10",
      icon: <Award className="w-4 h-4 text-[#F59E0B]" />,
      bgIcon: "bg-[#F59E0B]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="dashboard-overview-grid">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex flex-col justify-between h-28 shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.01] hover:bg-[#1E2A3B]/40"
          id={`overview-card-${i}`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[#94A3B8] text-xs font-semibold">{card.title}</span>
            <div className={`p-2 ${card.bgIcon} rounded-lg flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">{card.value}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
