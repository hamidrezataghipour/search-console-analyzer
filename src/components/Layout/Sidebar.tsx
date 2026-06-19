import { LayoutDashboard, Link2, Search, Zap, BrainCircuit, PlusCircle } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAnalyzeNewData?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "urls", label: "URLها", icon: Link2 },
  { id: "keywords", label: "کلمات کلیدی", icon: Search },
  { id: "opportunities", label: "فرصت‌های سئو", icon: Zap },
  { id: "ai", label: "تحلیل هوشمند (AI)", icon: BrainCircuit },
];

export default function Sidebar({ activeSection, onSectionChange, onAnalyzeNewData }: SidebarProps) {
  return (
    <aside
      className="w-56 bg-[#111827] border-l border-[#1E293B] py-6 flex flex-col gap-1 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto select-none"
      id="dashboard-sidebar-navigation"
    >
      <div className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3.5 px-5 py-3 transition-all duration-200 border-r-4 ${
                isActive
                  ? "bg-[#1E2A3B] text-[#3B82F6] border-[#3B82F6]"
                  : "text-[#94A3B8] hover:text-[#3B82F6] hover:bg-[#1E2A3B30] border-transparent"
              } cursor-pointer text-sm font-semibold text-right w-full`}
              id={`sidebar-item-${item.id}`}
            >
              <Icon size={18} className={`${isActive ? "text-[#3B82F6]" : "text-[#94A3B8]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {onAnalyzeNewData && (
        <div className="mt-auto pt-4 border-t border-[#1E293B]/60 mx-2">
          <button
            onClick={onAnalyzeNewData}
            className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:text-emerald-300 hover:bg-[#10B981]/10 rounded-lg transition-all duration-200 cursor-pointer text-sm font-bold text-right w-full"
            id="sidebar-item-new-data"
          >
            <PlusCircle size={18} className="text-emerald-400 flex-shrink-0" />
            <span>تحلیل دیتای جدید</span>
          </button>
        </div>
      )}
    </aside>
  );
}
