import { promises as fs } from "fs";
import path from "path";
import { ensureDataDir } from "./config";
import type { HotelSummary, TravelDeal } from "./types";

const DEALS_PATH = path.join(process.cwd(), "data", "deals.json");
const PRICES_PATH = path.join(process.cwd(), "data", "prices.json");

export interface DealsFile {
  deals: TravelDeal[];
  targetAlerts: TravelDeal[];
  bestDeal: TravelDeal | null;
  hotelSummaries: HotelSummary[];
  lastScanAt?: string;
}

export type PriceHistory = Record<number, number>;

export async function loadDeals(): Promise<DealsFile> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DEALS_PATH, "utf-8");
    return JSON.parse(raw) as DealsFile;
  } catch {
    return {
      deals: [],
      targetAlerts: [],
      bestDeal: null,
      hotelSummaries: [],
    };
  }
}

export async function saveDeals(data: DealsFile): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DEALS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadPriceHistory(): Promise<PriceHistory> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PRICES_PATH, "utf-8");
    return JSON.parse(raw) as PriceHistory;
  } catch {
    return {};
  }
}

export async function savePriceHistory(
  summaries: HotelSummary[]
): Promise<PriceHistory> {
  await ensureDataDir();
  const history = await loadPriceHistory();

  for (const summary of summaries) {
    if (summary.cheapestDeal) {
      const current = history[summary.hotelId];
      const newPrice = summary.cheapestDeal.pricePerPerson;
      if (current === undefined || newPrice < current) {
        history[summary.hotelId] = newPrice;
      }
    }
  }

  await fs.writeFile(PRICES_PATH, JSON.stringify(history, null, 2), "utf-8");
  return history;
}
