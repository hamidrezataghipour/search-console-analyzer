import { GscRow, AnalysisResults, QuickWin, LowCTR, CannibalizationItem } from "../types";

export function analyzeGscData(rawData: GscRow[]): AnalysisResults {
  // 1. Calculate General Metrics
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalPositionSum = 0;
  let rowsWithPosition = 0;

  const uniqueUrls = new Set<string>();
  const uniqueKeywords = new Set<string>();

  // Helper structures for top calculations
  const urlPerformance: { [key: string]: { clicks: number; impressions: number; ctrSum: number; posSum: number; count: number } } = {};
  const kwPerformance: { [key: string]: { clicks: number; impressions: number; ctrSum: number; posSum: number; count: number } } = {};

  // For cannibalization analysis
  // Maps: Keyword -> Set of competing Pages
  const keywordToPages: { [key: string]: { [url: string]: { clicks: number; impressions: number; ctr: number; position: number } } } = {};

  for (const row of rawData) {
    totalClicks += row.clicks;
    totalImpressions += row.impressions;
    
    if (row.position > 0) {
      totalPositionSum += row.position;
      rowsWithPosition++;
    }

    if (row.page) {
      uniqueUrls.add(row.page);
      if (!urlPerformance[row.page]) {
        urlPerformance[row.page] = { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, count: 0 };
      }
      urlPerformance[row.page].clicks += row.clicks;
      urlPerformance[row.page].impressions += row.impressions;
      urlPerformance[row.page].ctrSum += row.ctr;
      urlPerformance[row.page].posSum += row.position;
      urlPerformance[row.page].count += 1;
    }

    if (row.query) {
      uniqueKeywords.add(row.query);
      if (!kwPerformance[row.query]) {
        kwPerformance[row.query] = { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, count: 0 };
      }
      kwPerformance[row.query].clicks += row.clicks;
      kwPerformance[row.query].impressions += row.impressions;
      kwPerformance[row.query].ctrSum += row.ctr;
      kwPerformance[row.query].posSum += row.position;
      kwPerformance[row.query].count += 1;
    }

    // Accumulating competing details for cannibalization
    if (row.query && row.page) {
      if (!keywordToPages[row.query]) {
        keywordToPages[row.query] = {};
      }
      keywordToPages[row.query][row.page] = {
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      };
    }
  }

  // Calculate Average CTR elegantly
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = rowsWithPosition > 0 ? totalPositionSum / rowsWithPosition : 0;

  // 2. Identify Quick Wins (Positions between 4 and 10 with high impressions)
  const quickWins: QuickWin[] = [];
  for (const row of rawData) {
    if (row.position >= 4 && row.position <= 10 && row.impressions > 100) {
      quickWins.push({
        query: row.query || "صفحه اصلی / کلمات دیگر",
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        priority: row.position <= 6 ? "High" : "Medium",
      });
    }
  }
  // Sort by impressions descending
  quickWins.sort((a, b) => b.impressions - a.impressions);

  // 3. Low CTR Warnings (Ranked <= 5 with CTR < 3%)
  const lowCTR: LowCTR[] = [];
  for (const row of rawData) {
    if (row.position <= 5 && row.ctr < 0.03 && row.impressions > 50) {
      // Average expected CTR for page 1 ranks is usually around 8-30% depending on position.
      // Let's compute a very basic potential click loss
      const expectedCTR = row.position <= 1.5 ? 0.30 : row.position <= 3 ? 0.15 : 0.08;
      const potentialClicksLost = Math.max(0, Math.round(row.impressions * (expectedCTR - row.ctr)));

      lowCTR.push({
        query: row.query || "صفحه اصلی / کلمات دیگر",
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        potentialClicksLost,
      });
    }
  }
  // Sort by potential Clicks Lost
  lowCTR.sort((a, b) => b.potentialClicksLost - a.potentialClicksLost);

  // 4. Cannibalization Analysis
  const cannibalization: CannibalizationItem[] = [];
  for (const query in keywordToPages) {
    const pagesObj = keywordToPages[query];
    const pageUrls = Object.keys(pagesObj);
    if (pageUrls.length > 1) {
      // Make sure at least two of the pages have actual impressions or clicks
      const activeCompetingPages = pageUrls.map(url => ({
        page: url,
        ...pagesObj[url],
      })).filter(p => p.impressions > 5);

      if (activeCompetingPages.length > 1) {
        const queryTotalClicks = activeCompetingPages.reduce((sum, p) => sum + p.clicks, 0);
        cannibalization.push({
          query,
          pages: activeCompetingPages.sort((a, b) => b.clicks - a.clicks),
          totalClicks: queryTotalClicks,
          pageCount: activeCompetingPages.length,
        });
      }
    }
  }
  // Sort cannibalization by total clicks or page counts descending
  cannibalization.sort((a, b) => b.totalClicks - a.totalClicks);

  // 5. Build Top URL metrics
  const topUrls = Object.keys(urlPerformance).map(url => {
    const meta = urlPerformance[url];
    return {
      page: url,
      clicks: meta.clicks,
      impressions: meta.impressions,
      ctr: meta.impressions > 0 ? meta.clicks / meta.impressions : 0,
      position: meta.count > 0 ? meta.posSum / meta.count : 100,
    };
  }).sort((a, b) => b.clicks - a.clicks);

  // 6. Build Top Keywords metrics
  const topKeywords = Object.keys(kwPerformance).map(query => {
    const meta = kwPerformance[query];
    return {
      query,
      clicks: meta.clicks,
      impressions: meta.impressions,
      ctr: meta.impressions > 0 ? meta.clicks / meta.impressions : 0,
      position: meta.count > 0 ? meta.posSum / meta.count : 100,
    };
  }).sort((a, b) => b.clicks - a.clicks);

  return {
    overview: {
      totalClicks,
      totalImpressions,
      avgCTR,
      avgPosition,
      totalUrls: uniqueUrls.size,
      totalKeywords: uniqueKeywords.size,
    },
    quickWins,
    lowCTR,
    topUrls,
    topKeywords,
    cannibalization,
    rawData,
  };
}
