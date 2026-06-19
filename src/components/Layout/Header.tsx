import { BarChart2, Phone } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#111827] border-b border-[#1E293B] h-16 flex items-center justify-center font-sans" style={{ direction: "rtl" }}>
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between h-16">
        
        {/* Logo - Right Side */}
        <div className="logo flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3B82F6] rounded flex items-center justify-center text-white" id="header-logo-container">
            <BarChart2 className="w-5 h-5 text-white" id="header-logo-icon" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight" id="header-logo-text">
            سرچ کنسول <span className="text-[#3B82F6]">آنالیز</span>
          </span>
        </div>

        {/* Contact Button - Left Side */}
        <a
          href="tel:09213867813"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer hover:scale-[1.03]"
          id="btn-header-contact"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>ارتباط با من</span>
        </a>

      </div>
    </header>
  );
}
