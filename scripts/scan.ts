import { writeFile } from "fs/promises";
import { loadConfig } from "../src/lib/config";
import { logProgress } from "../src/lib/http";
import { buildScanSummary } from "../src/lib/scan-summary";
import { runSweep } from "../src/lib/sweeper";

async function main() {
  const started = Date.now();
  logProgress("=== Kainų skenavimas pradedamas ===");
  const config = await loadConfig();
  const result = await runSweep();
  const summary = buildScanSummary(result, config);

  await writeFile(
    "data/last-scan-summary.json",
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log(JSON.stringify(summary, null, 2));
  logProgress(
    `=== Skenavimas baigtas per ${Math.round((Date.now() - started) / 1000)}s — rasta ${summary.totalFound} pasiūlymų ===`
  );

  if (summary.hasAlerts) {
    console.log(
      `\n*** RASTA KAINA ≤ ${config.pricePerPersonMax} €/ASM — bus siunčiamas el. laiškas ***`
    );
  } else {
    console.log(
      `\nKainų ≤ ${config.pricePerPersonMax} €/asm nerasta — el. laiškas nesiunčiamas.`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
