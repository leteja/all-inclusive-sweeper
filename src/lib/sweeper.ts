import { loadConfig } from "./config";
import { meetsQualityBar, buildHotelSummaries, pickBestDeal } from "./ranking";
import { loadPriceHistory, saveDeals, savePriceHistory } from "./store";
import { searchHotelDeals } from "./tez-api";
import type { ScanResult, TravelDeal } from "./types";

export async function runSweep(): Promise<ScanResult> {
  const config = await loadConfig();
  const previousPrices = await loadPriceHistory();
  const allDeals: TravelDeal[] = [];

  const qualifiedHotels = config.watchlist.filter((h) =>
    meetsQualityBar(h, config)
  );

  for (const hotel of qualifiedHotels) {
    try {
      const deals = await searchHotelDeals(config, hotel);
      allDeals.push(...deals);
    } catch (error) {
      console.error(`Klaida skenuojant ${hotel.name}:`, error);
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
  });

  await savePriceHistory(summaries);

  return {
    scannedAt,
    hotelsScanned: qualifiedHotels.length,
    totalFound: allDeals.length,
    matchingDeals: allDeals,
    targetAlerts,
    priceDrops: drops,
    bestDeal,
    hotelSummaries: summaries,
  };
}
