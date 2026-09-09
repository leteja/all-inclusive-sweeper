import { writeFile } from "fs/promises";
import { loadConfig } from "../src/lib/config";
import { searchJoinupDeals, resetJoinupCache } from "../src/lib/joinup-api";
import { buildHotelSummaries, meetsQualityBar, pickBestDeal } from "../src/lib/ranking";
import { joinupSource } from "../src/lib/sources/joinup";
import { loadDeals, loadPriceHistory, saveDeals, savePriceHistory } from "../src/lib/store";
import type { TravelDeal } from "../src/lib/types";

async function main() {
  const config = await loadConfig();
  resetJoinupCache();
  const existing = await loadDeals();
  const previousPrices = await loadPriceHistory();

  const nonJoinup = existing.deals.filter((d) => d.source !== "joinup");
  const joinupDeals: TravelDeal[] = [];

  const qualifiedHotels = config.watchlist.filter((h) => meetsQualityBar(h, config));

  for (const hotel of qualifiedHotels) {
    if (!hotel.joinupHotelId) continue;
    console.log(`JoinUP: ${hotel.name}...`);
    try {
      const deals = await searchJoinupDeals(config, hotel);
      joinupDeals.push(...deals);
      console.log(`  → ${deals.length} pasiūlymų`);
    } catch (error) {
      console.error(`  → klaida:`, error);
    }
  }

  const allDeals = [...nonJoinup, ...joinupDeals];
  const targetAlerts = allDeals.filter((d) => d.inTargetRange);
  const bestDeal = pickBestDeal(allDeals);
  const { summaries } = buildHotelSummaries(
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
    sourcesScanned: existing.sourcesScanned?.includes(joinupSource.name)
      ? existing.sourcesScanned
      : [...(existing.sourcesScanned ?? []), joinupSource.name],
  });

  await savePriceHistory(summaries);

  const summary = {
    joinupDeals: joinupDeals.length,
    totalDeals: allDeals.length,
    cheapestJoinup: joinupDeals[0]
      ? {
          hotel: joinupDeals[0].hotelName,
          pricePerPerson: joinupDeals[0].pricePerPerson,
          totalPrice: joinupDeals[0].totalPrice,
        }
      : null,
    targetAlerts: targetAlerts.length,
  };

  await writeFile(
    "data/last-scan-summary.json",
    JSON.stringify({ ...summary, scannedAt }, null, 2),
    "utf-8"
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
