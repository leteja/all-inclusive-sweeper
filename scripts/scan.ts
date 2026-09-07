import { writeFile } from "fs/promises";
import { runSweep } from "../src/lib/sweeper";

async function main() {
  const result = await runSweep();

  const summary = {
    scannedAt: result.scannedAt,
    hotelsScanned: result.hotelsScanned,
    totalFound: result.totalFound,
    hasAlerts:
      result.targetAlerts.length > 0 || result.priceDrops.length > 0,
    bestDeal: result.bestDeal
      ? {
          hotel: result.bestDeal.hotelName,
          pricePerPerson: result.bestDeal.pricePerPerson,
          date: result.bestDeal.departureDate,
          url: result.bestDeal.hotelUrl,
        }
      : null,
    targetAlerts: result.targetAlerts.map((d) => ({
      hotel: d.hotelName,
      pricePerPerson: d.pricePerPerson,
      date: d.departureDate,
      url: d.hotelUrl,
    })),
    priceDrops: result.priceDrops.map((d) => ({
      hotel: d.hotelName,
      previousPrice: d.previousPrice,
      newPrice: d.newPrice,
      dropAmount: d.dropAmount,
    })),
  };

  await writeFile(
    "data/last-scan-summary.json",
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log(JSON.stringify(summary, null, 2));

  if (summary.hasAlerts) {
    console.log("\n*** RASTOS NUOLAIDOS ARBA TIKSLINĖ KAINA ***");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
