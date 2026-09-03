import { promises as fs } from "fs";
import path from "path";
import { ensureDataDir } from "./config";
import type { TravelDeal } from "./types";

const DEALS_PATH = path.join(process.cwd(), "data", "deals.json");
const SEEN_PATH = path.join(process.cwd(), "data", "seen.json");

interface DealsFile {
  deals: TravelDeal[];
  lastScanAt?: string;
}

export async function loadDeals(): Promise<DealsFile> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DEALS_PATH, "utf-8");
    return JSON.parse(raw) as DealsFile;
  } catch {
    return { deals: [] };
  }
}

export async function saveDeals(deals: TravelDeal[], lastScanAt: string): Promise<void> {
  await ensureDataDir();
  const payload: DealsFile = { deals, lastScanAt };
  await fs.writeFile(DEALS_PATH, JSON.stringify(payload, null, 2), "utf-8");
}

export async function loadSeenIds(): Promise<Set<string>> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SEEN_PATH, "utf-8");
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export async function saveSeenIds(ids: Set<string>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SEEN_PATH, JSON.stringify([...ids], null, 2), "utf-8");
}
