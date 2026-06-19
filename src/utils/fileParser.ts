import Papa from "papaparse";
import * as XLSX from "xlsx";
import { GscRow } from "../types";

// ============================================
// CSV File Parser
// ============================================
export const parseCSV = (file: File): Promise<GscRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error("فایل CSV خالی است یا داده‌ای ندارد"));
          return;
        }
        try {
          const normalized = normalizeData(results.data);
          resolve(normalized);
        } catch (err: any) {
          reject(new Error("ساختار فایل با فرمت سرچ کنسول مطابقت ندارد: " + err.message));
        }
      },
      error: (error) => reject(new Error("خطا در خواندن CSV: " + error.message))
    });
  });
};

// ============================================
// Excel File Parser with Full GSC Sheet Priority Support
// ============================================
export const parseExcel = (file: File): Promise<GscRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const targetResult = e.target?.result as ArrayBuffer;
        if (!targetResult) {
          reject(new Error("خطا در خواندن فایل"));
          return;
        }
        const data = new Uint8Array(targetResult);
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
        });

        console.log("Sheetهای موجود در فایل:", workbook.SheetNames);

        // Search Console prioritizing sheets:
        const prioritySheets = [
          "Queries", "queries",
          "Pages", "pages",
          "Table", "table",
          "Data", "data",
          "Sheet1", "sheet1",
          "Overview", "overview"
        ];

        let targetSheet: XLSX.WorkSheet | null = null;
        let targetSheetName: string | null = null;

        // Try to find targeted sheets by name or substring matching
        for (const name of prioritySheets) {
          const matchedName = workbook.SheetNames.find(
            s => s.toLowerCase() === name.toLowerCase() || s.toLowerCase().includes(name.toLowerCase())
          );
          if (matchedName) {
            targetSheet = workbook.Sheets[matchedName];
            targetSheetName = matchedName;
            break;
          }
        }

        // Fallback to first sheet
        if (!targetSheet) {
          targetSheetName = workbook.SheetNames[0];
          targetSheet = workbook.Sheets[targetSheetName];
        }

        console.log("Sheet انتخاب شده:", targetSheetName);

        let jsonData = XLSX.utils.sheet_to_json<any>(targetSheet, {
          raw: false,
          defval: "",
          blankrows: false
        });

        console.log("تعداد ردیف‌های خوانده شده:", jsonData.length);

        // If empty, try other sheets
        if (!jsonData || jsonData.length === 0) {
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const tryData = XLSX.utils.sheet_to_json<any>(sheet, {
              raw: false,
              defval: "",
              blankrows: false
            });

            if (tryData && tryData.length > 0) {
              const normalized = normalizeData(tryData);
              if (normalized && normalized.length > 0) {
                console.log("داده در Sheet پیدا شد:", sheetName);
                resolve(normalized);
                return;
              }
            }
          }
          reject(new Error("هیچ داده‌ای در فایل پیدا نشد. لطفاً فایل Export شده از Google Search Console را آپلود کنید"));
          return;
        }

        const normalized = normalizeData(jsonData);

        if (!normalized || normalized.length === 0) {
          // If the selected sheet produced empty normalized array, let's scan other sheets as fallback
          for (const sheetName of workbook.SheetNames) {
            if (sheetName === targetSheetName) continue;
            const sheet = workbook.Sheets[sheetName];
            const tryData = XLSX.utils.sheet_to_json<any>(sheet, {
              raw: false,
              defval: "",
              blankrows: false
            });
            if (tryData && tryData.length > 0) {
              const testNorm = normalizeData(tryData);
              if (testNorm && testNorm.length > 0) {
                console.log("تغییر هوشمند شیت به:", sheetName);
                resolve(testNorm);
                return;
              }
            }
          }
          reject(new Error("ستون‌های مورد نیاز (Query/Page, Clicks, Impressions, CTR, Position) در فایل پیدا نشدند"));
          return;
        }

        resolve(normalized);

      } catch (err: any) {
        console.error("خطا در پارس Excel:", err);
        reject(new Error("خطا در پردازش فایل Excel: " + err.message));
      }
    };

    reader.onerror = () => reject(new Error("خطا در خواندن فایل"));
    reader.readAsArrayBuffer(file);
  });
};

// ============================================
// Normalizing GSC Row data
// ============================================
export const normalizeData = (rawData: any[]): GscRow[] => {
  if (!rawData || rawData.length === 0) return [];

  // Map of possible headers
  const columnMap: Record<string, string[]> = {
    query: ["query", "queries", "keyword", "search query", "top queries", "کلمه کلیدی", "جستجو", "پرس‌و‌جو", "جستجوها", "queries (total)"],
    page: ["page", "pages", "url", "landing page", "top pages", "address", "link", "آدرس", "صفحه", "آدرس صفحه", "یو‌ار‌ال", "pages (total)"],
    clicks: ["clicks", "click", "total clicks", "کلیک", "کلیک‌ها", "تعداد کلیک", "clicks (total)"],
    impressions: ["impressions", "impression", "total impressions", "نمایش", "ایمپرشن", "تعداد نمایش", "ایمپرشن‌ها", "impressions (total)"],
    ctr: ["ctr", "click through rate", "clickthrough rate", "نرخ کلیک", "نرخ کلیک (ctr)", "درصد کلیک"],
    position: ["position", "average position", "avg position", "rank", "رتبه", "پوزیشن", "جایگاه", "میانگین رتبه", "موقعیت"]
  };

  const firstRow = rawData[0];
  const actualColumns: Record<string, string> = {};

  Object.entries(columnMap).forEach(([standardName, possibleNames]) => {
    const found = Object.keys(firstRow).find(key => {
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, " ");
      return possibleNames.some(possible =>
        cleanKey === possible.toLowerCase() ||
        cleanKey.includes(possible.toLowerCase()) ||
        possible.toLowerCase().includes(cleanKey)
      );
    });
    if (found) actualColumns[standardName] = found;
  });

  console.log("ستون‌های تشخیص داده شده:", actualColumns);

  // At least one of query or page must exist
  if (!actualColumns.query && !actualColumns.page) {
    console.warn("ستون Query یا Page پیدا نشد");
    return [];
  }

  // Normalize row by row
  const normalized: GscRow[] = rawData
    .map((row) => {
      try {
        const getValue = (col: string) => {
          if (!actualColumns[col]) return null;
          return row[actualColumns[col]];
        };

        const parseNumber = (val: any): number => {
          if (val === null || val === undefined || val === "") return 0;
          const str = String(val).replace(/,/g, "").replace(/٪/g, "").trim();
          const num = parseFloat(str);
          return isNaN(num) ? 0 : num;
        };

        const parseCTR = (val: any): number => {
          if (val === null || val === undefined || val === "") return 0;
          const str = String(val).replace(/%/g, "").replace(/٪/g, "").trim();
          const num = parseFloat(str);
          if (isNaN(num)) return 0;
          // If the number is > 1.0, it is represented as percentage (e.g. 5.3), so divide by 100
          return num > 1 ? num / 100 : num;
        };

        const query = String(getValue("query") || "").trim();
        const page = String(getValue("page") || "").trim();

        if (query === "Total" || page === "Total" || query === "مجموع" || page === "مجموع") {
          return null;
        }

        return {
          query,
          page,
          clicks: parseNumber(getValue("clicks")),
          impressions: parseNumber(getValue("impressions")),
          ctr: parseCTR(getValue("ctr")),
          position: parseNumber(getValue("position"))
        };
      } catch {
        return null;
      }
    })
    .filter((row): row is GscRow => row !== null && (row.clicks > 0 || row.impressions > 0 || row.query !== "" || row.page !== ""));

  return normalized.sort((a, b) => b.clicks - a.clicks);
};

// ============================================
// Main entry point
// ============================================
export const parseFile = async (file: File): Promise<GscRow[]> => {
  const fileName = file.name.toLowerCase();
  const extension = fileName.split(".").pop();

  console.log("نوع فایل:", extension, "| اندازه:", file.size, "bytes");

  if (extension === "csv") {
    return parseCSV(file);
  } else if (["xlsx", "xls", "xlsm"].includes(extension || "")) {
    return parseExcel(file);
  } else {
    throw new Error(`فرمت فایل .${extension} پشتیبانی نمی‌شود. فقط CSV و Excel قبول می‌شود`);
  }
};
