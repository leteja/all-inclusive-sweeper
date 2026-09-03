import { DESTINATION_COUNTRIES } from "./constants";
import { loadConfig } from "./config";
import { sendTelegramNotification } from "./notifications";
import { loadDeals, loadSeenIds, saveDeals, saveSeenIds } from "./store";
import { searchTezDeals } from "./tez-api";
import type { ScanResult, TravelDeal } from "./types";

export async function runSweep(): Promise<ScanResult> {
  const config = await loadConfig();
  const seenIds = await loadSeenIds();
  const allDeals: TravelDeal[] = [];
  const newDeals: TravelDeal[] = [];
  const countriesScanned: number[] = [];

  for (const countryId of config.countryIds) {
    const country = DESTINATION_COUNTRIES.find((c) => c.id === countryId);
    const countryName = country?.name ?? `Šalis #${countryId}`;
    countriesScanned.push(countryId);

    try {
      const deals = await searchTezDeals(config, countryId, countryName);
      for (const deal of deals) {
        allDeals.push(deal);
        if (!seenIds.has(deal.id)) {
          newDeals.push({ ...deal, isNew: true });
          seenIds.add(deal.id);
        }
      }
    } catch (error) {
      console.error(`Klaida skenuojant ${countryName}:`, error);
    }
  }

  const uniqueDeals = dedupeDeals(allDeals).sort(
    (a, b) => a.totalPrice - b.totalPrice
  );

  const scannedAt = new Date().toISOString();
  await saveDeals(uniqueDeals, scannedAt);
  await saveSeenIds(seenIds);

  const dealsToNotify = config.notifyOnlyNew ? newDeals : uniqueDeals;
  let notificationsSent = 0;

  try {
    notificationsSent = await sendTelegramNotification(config, dealsToNotify);
  } catch (error) {
    console.error("Telegram pranešimo klaida:", error);
  }

  return {
    scannedAt,
    countriesScanned,
    totalFound: uniqueDeals.length,
    matchingDeals: uniqueDeals,
    newDeals,
    notificationsSent,
  };
}

function dedupeDeals(deals: TravelDeal[]): TravelDeal[] {
  const map = new Map<string, TravelDeal>();
  for (const deal of deals) {
    const existing = map.get(deal.id);
    if (!existing || deal.totalPrice < existing.totalPrice) {
      map.set(deal.id, deal);
    }
  }
  return [...map.values()];
}
