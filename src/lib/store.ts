import { promises as fs } from "fs";
import path from "path";
import { ensureDataDir } from "./config";
import type { HotelSummary, TravelDeal } from "./types";

const DEALS_PATH = path.join(process.cwd(), "data", "deals.json");

export interface DealsFile {
  deals: TravelDeal[];
  targetAlerts: TravelDeal[];
  bestDeal: TravelDeal | null;
  hotelSummaries: HotelSummary[];
  lastScanAt?: string;
}

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
