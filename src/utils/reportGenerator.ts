import { AnalysisResults } from "../types";

// Simple helper to parse Markdown headings, bullet points, and bold styling to standard HTML tags
function markdownToHTML(md: string): string {
  if (!md) return "<p>تحلیلی ثبت نشده است.</p>";
  
  let html = md;
  // Replace Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-blue-400 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2 mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-blue-500 border-b-2 border-blue-500 pb-3 mt-8 mb-4">$1</h1>');
  
  // Replace Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-blue-300 font-semibold">$1</strong>');
  
  // Replace Bullet lists
  html = html.replace(/^\s*-\s*(.*$)/gim, '<li class="mr-4 list-disc text-gray-300 my-1.5">$1</li>');
  html = html.replace(/^\s*\*\s*(.*$)/gim, '<li class="mr-4 list-disc text-gray-300 my-1.5">$1</li>');

  // Multi line break wrapping
  html = html.replace(/\n\n/g, '<br/>');

  return html;
}

// Generate an elegant standalone inline SVG representing clicks & impressions trend
function generateSVGLineChart(data: any[]): string {
  if (!data || data.length === 0) return "";
  
  const width = 800;
  const height = 250;
  const padding = 40;
  
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const maxClicks = Math.max(...data.map(d => d.clicks), 1);
  const maxImps = Math.max(...data.map(d => d.impressions), 1);
  
  let pointsClicks = "";
  let pointsImps = "";
  
  const len = Math.min(data.length, 15); // Show top 15 rows for visual clarity
  
  for (let i = 0; i < len; i++) {
    const x = padding + (i / (len - 1)) * chartWidth;
    
    // Clicks y-coordinate normalized
    const yClicks = padding + chartHeight - (data[i].clicks / maxClicks) * chartHeight;
    pointsClicks += `${x},${yClicks} `;
    
    // Impressions y-coordinate normalized
    const yImps = padding + chartHeight - (data[i].impressions / maxImps) * chartHeight;
    pointsImps += `${x},${yImps} `;
  }
  
  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto bg-[#111827] rounded-xl border border-gray-800 p-4">
      <!-- Grid lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#1E293B" stroke-dasharray="4" />
      <line x1="${padding}" y1="${padding + chartHeight / 2}" x2="${width - padding}" y2="${padding + chartHeight / 2}" stroke="#1E293B" stroke-dasharray="4" />
      <line x1="${padding}" y1="${padding + chartHeight}" x2="${width - padding}" y2="${padding + chartHeight}" stroke="#1E293B" />
      
      <!-- Clicks line (Blue) -->
      <polyline fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" points="${pointsClicks.trim()}" />
      
      <!-- Impressions line (Purple) -->
      <polyline fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 1" points="${pointsImps.trim()}" />
      
      <!-- Legend -->
      <g transform="translate(50, 25)">
        <circle cx="0" cy="0" r="6" fill="#3B82F6" />
        <text x="12" y="4" fill="#94A3B8" font-size="12">میزان کلیک‌ها</text>
        
        <circle cx="120" cy="0" r="6" fill="#8B5CF6" />
        <text x="132" y="4" fill="#94A3B8" font-size="12">میزان ایمپرشن (نمایش)</text>
      </g>
    </svg>
  `;
}

export function generateHTMLReport(analysisData: AnalysisResults, aiInsights: string) {
  const dateStr = new Date().toLocaleDateString("fa-IR");
  
  // Render quick win rows
  const quickWinRows = analysisData.quickWins.slice(0, 15).map((row, idx) => `
    <tr>
      <td class="idx">${idx + 1}</td>
      <td class="url" title="${row.page}">${row.query}</td>
      <td>${row.clicks.toLocaleString("fa-IR")}</td>
      <td>${row.impressions.toLocaleString("fa-IR")}</td>
      <td>${(row.ctr * 100).toFixed(2)}%</td>
      <td>${row.position.toFixed(1)}</td>
      <td><span class="badge ${row.priority === "High" ? "badge-success" : "badge-warning"}">${row.priority === "High" ? "اولویت بالا" : "اولویت متوسط"}</span></td>
    </tr>
  `).join("");

  // Render Low CTR rows
  const lowCtrRows = analysisData.lowCTR.slice(0, 15).map((row, idx) => `
    <tr>
      <td class="idx">${idx + 1}</td>
      <td class="url" title="${row.page}">${row.query}</td>
      <td>${row.clicks.toLocaleString("fa-IR")}</td>
      <td>${row.impressions.toLocaleString("fa-IR")}</td>
      <td>${(row.ctr * 100).toFixed(2)}%</td>
      <td>${row.position.toFixed(1)}</td>
      <td class="danger-text">+${row.potentialClicksLost.toLocaleString("fa-IR")} کلیک احتمالی</td>
    </tr>
  `).join("");

  // Render Cannibalization rows
  const cannibalizationRows = analysisData.cannibalization.slice(0, 10).map((row, idx) => `
    <tr>
      <td class="idx">${idx + 1}</td>
      <td class="query-cell font-bold text-blue-400">${row.query}</td>
      <td>${row.pageCount} آدرس مرتبط</td>
      <td>${row.totalClicks.toLocaleString("fa-IR")} کلیک مشترک</td>
      <td class="text-sm">
        <ul style="margin:0; padding:0; list-style:none;">
          ${row.pages.map(p => `
            <li class="competing-url" style="margin-bottom:4px; font-size:11px; color:#cbd5e1;">
              • <span style="color:#60a5fa;">کلیک: ${p.clicks}</span> | رتبه: ${p.position.toFixed(1)} <br/>
              <span class="text-muted text-xs break-all" style="color:#64748b;">${p.page}</span>
            </li>
          `).join("")}
        </ul>
      </td>
    </tr>
  `).join("");

  const chartSVG = generateSVGLineChart(analysisData.topUrls);

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>گزارش سئو و تحلیل سرچ کنسول — تولید شده در سرچ کنسول آنالیز</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Vazirmatn', sans-serif;
      direction: rlt !important;
    }
    body {
      background-color: #0A0F1E;
      color: #F1F5F9;
      margin: 0;
      padding: 30px 20px;
      direction: rtl;
    }
    .wrapper {
      max-width: 1100px;
      margin: 0 auto;
    }
    .header {
      background: #111827;
      border: 1px solid #1E293B;
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      color: #3B82F6;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #94A3B8;
      font-size: 14px;
    }
    .date-badge {
      background: #1E2A3B;
      border: 1px solid #3B82F6;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      color: #F1F5F9;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #111827;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #1E293B;
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
    }
    .stat-card.blue::before { background: #3B82F6; }
    .stat-card.purple::before { background: #8B5CF6; }
    .stat-card.success::before { background: #10B981; }
    .stat-card.warning::before { background: #F59E0B; }
    
    .stat-label {
      color: #94A3B8;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 40px 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1E293B;
      padding-bottom: 10px;
    }
    .chart-box {
      margin-bottom: 45px;
    }
    .table-container {
      background: #111827;
      border: 1px solid #1E293B;
      border-radius: 12px;
      overflow-x: auto;
      margin-bottom: 35px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
    }
    th {
      background: #1E2A3B;
      color: #94A3B8;
      font-weight: 600;
      font-size: 13px;
      padding: 14px 18px;
      border-bottom: 1px solid #1E293B;
    }
    td {
      padding: 14px 18px;
      border-bottom: 1px solid #1E293B;
      font-size: 14px;
      color: #F1F5F9;
    }
    tr:hover {
      background: #1E2A3B50;
    }
    .idx {
      color: #64748B;
      font-size: 12px;
      width: 40px;
    }
    .url {
      color: #60A5FA;
      max-width: 280px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      direction: ltr !important;
      text-align: right;
    }
    .badge {
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 6px;
      font-weight: 500;
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-warning {
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .danger-text {
      color: #EF4444;
      font-weight: 600;
    }
    .ai-insights {
      background: #111827;
      border: 1px solid #8B5CF6;
      border-radius: 16px;
      padding: 30px;
      margin-top: 40px;
      position: relative;
    }
    .ai-badge {
      position: absolute;
      top: -14px;
      right: 30px;
      background: #8B5CF6;
      color: #FFFFFF;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .ai-content {
      line-height: 1.8;
      font-size: 15px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #1E293B;
      text-align: center;
      color: #94A3B8;
      font-size: 13px;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
    }
    .footer-links a {
      color: #3B82F6;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      .stat-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 480px) {
      .stat-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div>
        <h1>📊 گزارش جامع تحلیل سئو</h1>
        <p>تولید شده توسط هوش مصنوعی و داشبورد سرچ کنسول</p>
      </div>
      <div class="date-badge">تارخ گزارش: ${dateStr}</div>
    </div>
    
    <!-- آمار کلیدی -->
    <div class="stat-grid">
      <div class="stat-card blue">
        <div class="stat-label">کلیک کل</div>
        <div class="stat-value">${analysisData.overview.totalClicks.toLocaleString("fa-IR")}</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">نمایش کل (Impressions)</div>
        <div class="stat-value">${analysisData.overview.totalImpressions.toLocaleString("fa-IR")}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">نرخ کلیک میانگین (CTR)</div>
        <div class="stat-value">${analysisData.overview.avgCTR.toFixed(2)}%</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">رتبه میانگین</div>
        <div class="stat-value">${analysisData.overview.avgPosition.toFixed(1)}</div>
      </div>
    </div>
    
    <!-- نمودار رتبه / نمایش -->
    <div class="section-title">📉 روند کارایی کلیک و نمایش کلمات اصلی</div>
    <div class="chart-box">
      ${chartSVG}
    </div>
    
    <!-- فرصتهای طلایی -->
    <div class="section-title">⚡ فرصت‌های طلایی رتبه‌بندی (Quick Wins)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>کلمه کلیدی / عبارت</th>
            <th>کلیک</th>
            <th>ایمپرشن</th>
            <th>CTR</th>
            <th>رتبه گوگل</th>
            <th>اولویت</th>
          </tr>
        </thead>
        <tbody>
          ${quickWinRows || '<tr><td colspan="7" style="text-align:center;">فرصتی پیدا نشد. داده‌های بیشتری آپلود کنید.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- نرخ کلیک پایین -->
    <div class="section-title">⚠️ هشدارهای نرخ کلیک (Low CTR)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>کلمه کلیدی / عبارت</th>
            <th>کلیک</th>
            <th>ایمپرشن</th>
            <th>CTR فعلی</th>
            <th>رتبه گوگل</th>
            <th>فرصت از دست رفته</th>
          </tr>
        </thead>
        <tbody>
          ${lowCtrRows || '<tr><td colspan="7" style="text-align:center;">مورد هشداری پیدا نشد.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- هم‌خواری / تداخل آدرس ها -->
    <div class="section-title">🔗 تداخل کلمات آدرس‌ها (Keyword Cannibalization)</div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>عبارت کلیدی متداخل</th>
            <th>تعداد صفحات رقیب</th>
            <th>مجموع کلیک کلمه</th>
            <th>صفحات متداخل و رتبه‌های مربوطه</th>
          </tr>
        </thead>
        <tbody>
          ${cannibalizationRows || '<tr><td colspan="5" style="text-align:center;">تداخلی شناسایی نشد. عالی است!</td></tr>'}
        </tbody>
      </table>
    </div>
    
    <!-- تحلیل هوشمند هوش مصنوعی -->
    <div class="ai-insights">
      <div class="ai-badge">🤖 تحلیل هوشمند و استراتژیک Gemini AI</div>
      <div class="ai-content">
        ${markdownToHTML(aiInsights)}
      </div>
    </div>
    
    <!-- فوتر اختصاصی طراح سیستم -->
    <div class="footer">
      <p>طراحی و توسعه توسط حمید رضا تقی پور</p>
      <div class="footer-links">
        <a href="https://github.com/hamidrezataghipour" target="_blank">گیت‌هاب حمیدرضا</a>
        <a href="http://linkedin.com/in/hamidrezataghipour" target="_blank">لینکداین حمیدرضا</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Create a blob and download it nicely
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SEO-Console-Report-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
