import { loadConfig } from "./config";
import { resetItakaCache } from "./itaka-api";
import { resetJoinupCache } from "./joinup-api";
import { meetsQualityBar, buildHotelSummaries, pickBestDeal } from "./ranking";
import { AUTOMATED_SOURCES } from "./sources";
import { loadPriceHistory, saveDeals, savePriceHistory } from "./store";
import type { ScanResult, TravelDeal } from "./types";

const SOURCE_DELAY_MS = 400;
const JOINUP_HOTEL_DELAY_MS = 8000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runSweep(): Promise<ScanResult> {
  const config = await loadConfig();
  resetItakaCache();
  resetJoinupCache();
  const previousPrices = await loadPriceHistory();
  const allDeals: TravelDeal[] = [];

  const qualifiedHotels = config.watchlist.filter((h) =>
    meetsQualityBar(h, config)
  );

  const sourcesScanned = AUTOMATED_SOURCES.map((s) => s.name);

  for (const hotel of qualifiedHotels) {
    for (const source of AUTOMATED_SOURCES) {
      try {
        const deals = await source.searchDeals(config, hotel);
        allDeals.push(...deals);
      } catch (error) {
        console.error(
          `Klaida [${source.name}] skenuojant ${hotel.name}:`,
          error
        );
      }
      const delay =
        source.id === "joinup" ? JOINUP_HOTEL_DELAY_MS : SOURCE_DELAY_MS;
      await sleep(delay);
    }
  }

  const targetAlerts = allDeals.filter((d) => d.inTargetRange);
  const bestDeal = pickBestDeal(allDeals);

  const { summaries, drops } = buildHotelSummaries(
    qualifiedHotels,
    allDeals,
    previousPrices,
    config.priceDropThreshold
  );

  const scannedAt = new Date().toISOString();

  await saveDeals({
    deals: allDeals,
    targetAlerts,
    bestDeal,
    hotelSummaries: summaries,
    lastScanAt: scannedAt,
    sourcesScanned,
  });

  await savePriceHistory(summaries);

  return {
    scannedAt,
    hotelsScanned: qualifiedHotels.length,
    sourcesScanned,
    totalFound: allDeals.length,
    matchingDeals: allDeals,
    targetAlerts,
    priceDrops: drops,
    bestDeal,
    hotelSummaries: summaries,
  };
}
