import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CONFIG } from "./constants";
import type { SweeperConfig } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadConfig(): Promise<SweeperConfig> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as SweeperConfig;
  } catch {
    const config = { ...DEFAULT_CONFIG } as SweeperConfig;
    await saveConfig(config);
    return config;
  }
}

export async function saveConfig(config: SweeperConfig): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
