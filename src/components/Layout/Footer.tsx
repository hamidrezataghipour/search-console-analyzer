import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111827] border-t border-[#1E293B] mt-auto h-14 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Right side - developer info */}
        <p className="text-xs text-[#94A3B8] font-medium" id="footer-text">
          طراحی و توسعه توسط <span className="text-white font-semibold">حمید رضا تقی پور</span>
        </p>

        {/* Left side - system status & socials */}
        <div className="flex items-center gap-6" id="footer-left-content">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]" id="system-status-indicator">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>وضعیت سیستم: آنلاین</span>
          </div>

          <div className="flex gap-4" id="footer-social-links">
            <a
              href="https://github.com/hamidrezataghipour"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
              aria-label="GitHub Profile"
              id="footer-github-link"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/hamidrezataghipour"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
              aria-label="LinkedIn Profile"
              id="footer-linkedin-link"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
