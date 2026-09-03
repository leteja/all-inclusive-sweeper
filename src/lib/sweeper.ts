import { loadConfig } from "./config";
import {
  buildHotelSummaries,
  pickBestDeal,
} from "./ranking";
import { loadDeals, saveDeals } from "./store";
import { searchHotelDeals } from "./tez-api";
import type { ScanResult, TravelDeal } from "./types";

export async function runSweep(): Promise<ScanResult> {
  const config = await loadConfig();
  const allDeals: TravelDeal[] = [];

  for (const hotel of config.watchlist) {
    try {
      const deals = await searchHotelDeals(config, hotel);
      allDeals.push(...deals);
    } catch (error) {
      console.error(`Klaida skenuojant ${hotel.name}:`, error);
    }
  }

  const targetAlerts = allDeals.filter((d) => d.inTargetRange);
  const bestDeal = pickBestDeal(allDeals);

  const hotelSummaries = buildHotelSummaries(config.watchlist, allDeals);
  const scannedAt = new Date().toISOString();

  await saveDeals({
    deals: allDeals,
    targetAlerts,
    bestDeal,
    hotelSummaries,
    lastScanAt: scannedAt,
  });

  return {
    scannedAt,
    hotelsScanned: config.watchlist.length,
    totalFound: allDeals.length,
    matchingDeals: allDeals,
    targetAlerts,
    bestDeal,
    hotelSummaries,
  };
}
