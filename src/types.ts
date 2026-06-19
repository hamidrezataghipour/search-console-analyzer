export interface GscRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number; // Decimal (e.g., 0.057 represents 5.7%)
  position: number;
}

export interface SummaryStats {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number; // Percentage value (e.g., 5.08%)
  avgPosition: number;
  totalUrls: number;
  totalKeywords: number;
}

export interface CannibalizationItem {
  query: string;
  pages: {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  totalClicks: number;
  pageCount: number;
}

export interface QuickWin {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  priority: "High" | "Medium";
}

export interface LowCTR {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  potentialClicksLost: number;
}

export interface AnalysisResults {
  overview: SummaryStats;
  quickWins: QuickWin[];
  lowCTR: LowCTR[];
  topUrls: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topKeywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  cannibalization: CannibalizationItem[];
  rawData: GscRow[];
}
