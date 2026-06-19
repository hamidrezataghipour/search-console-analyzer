import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, RefreshCcw, Loader2 } from "lucide-react";
import { parseCSV, parseExcel } from "../../utils/fileParser";
import { GscRow } from "../../types";

interface FileUploadProps {
  onDataLoaded: (data: GscRow[], fileName: string) => void;
  onClear: () => void;
  currentFileName: string | null;
  currentRowCount: number;
}

export default function FileUpload({ onDataLoaded, onClear, currentFileName, currentRowCount }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "loading" | "success" | "error">(
    currentFileName ? "success" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setUploadState("loading");
    setErrorMessage("");

    const name = file.name.toLowerCase();
    const isCsv = name.endsWith(".csv");
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");

    if (!isCsv && !isExcel) {
      setUploadState("error");
      setErrorMessage("فرمت فایل نامعتبر است. لطفاً فقط فایل های CSV یا Excel (.xlsx, .xls) آپلود کنید.");
      return;
    }

    try {
      let rows: GscRow[] = [];
      if (isCsv) {
        rows = await parseCSV(file);
      } else {
        rows = await parseExcel(file);
      }

      if (rows.length === 0) {
        throw new Error("فایل حاوی داده معتبر سئویی نمی‌باشد یا خالی است. لطفاً ستون‌های فایل را بررسی کنید.");
      }

      onDataLoaded(rows, file.name);
      setUploadState("success");
    } catch (err: any) {
      console.error(err);
      setUploadState("error");
      setErrorMessage(err.message || "خطایی در پردازش فایل رخ داد. لطفاً فایل خروجی خام سرچ کنسول را دوباره ارسال کنید.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    onClear();
    setUploadState("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl" id="file-uploader-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="text-[#3B82F6] w-5 h-5" />
          بخش آپلود داده‌های سرچ کنسول
        </h2>
        {/* Removed change file button as requested */}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="input-file-upload"
        multiple={false}
        onChange={handleChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />

      {uploadState === "idle" && (
        <label
          htmlFor="input-file-upload"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed rounded-xl cursor-pointer p-6 text-center transition-all ${
            dragActive
              ? "border-[#3B82F6] bg-[#1E2A3B] scale-[1.02]"
              : "border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#1E2A3B50]"
          }`}
          id="dropzone-label"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-[#1E2A3B] rounded-full text-[#3B82F6] mb-3 transition-transform duration-200">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>
            <p className="mb-2 text-sm text-[#F1F5F9] font-semibold">
              فایل CSV یا Excel خود را اینجا بکشید
            </p>
            <p className="text-xs text-[#94A3B8]">
              یا برای انتخاب از روی سیستم کلیک کنید
            </p>
            <span className="mt-4 px-3 py-1 bg-[#1E2A3B] text-[10px] text-[#94A3B8] rounded border border-gray-800">
              فرمت‌های پشتیبانی شده: CSV, XLSX, XLS
            </span>
          </div>
        </label>
      )}

      {uploadState === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 text-center" id="uploader-state-loading">
          <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin mb-4" />
          <h3 className="text-sm font-semibold text-white">در حال پردازش داده‌های سرچ کنسول...</h3>
          <p className="text-xs text-[#94A3B8] mt-1">ما به دنبال تحلیل صفحات، کلیک‌‌ها و کلمات متداخل شما هستیم.</p>
        </div>
      )}

      {uploadState === "success" && (
        <div className="bg-[#1E2A3B50] rounded-xl p-5 border border-[#10B98130]" id="uploader-state-success">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#10B98115] text-[#10B981] rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">فایل با موفقیت بارگذاری شد!</h3>
              <p className="text-xs text-[#94A3B8] break-all mb-3 font-mono text-left" dir="ltr" id="loaded-filename">
                {currentFileName}
              </p>
              <div className="flex gap-4 items-center">
                <span className="text-xs text-[#94A3B8]">
                  تعداد ردیف‌های سئو: <strong className="text-white bg-[#1E2A3B] px-2 py-0.5 rounded border border-[#1E293B]">{currentRowCount.toLocaleString("fa-IR")}</strong>
                </span>
                <span className="text-xs text-emerald-400 font-medium">آماده آنالیز و بررسی</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadState === "error" && (
        <div className="bg-[#EF444410] border border-[#EF444430] rounded-xl p-5" id="uploader-state-error">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-[#EF4444] flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">خطا در بارگذاری فایل</h3>
              <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#EF4444] hover:bg-red-600 text-xs text-white rounded-lg transition-colors cursor-pointer"
                id="btn-retry-upload"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
