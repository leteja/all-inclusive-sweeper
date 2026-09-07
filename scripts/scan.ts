import { writeFile } from "fs/promises";
import { loadConfig } from "../src/lib/config";
import { buildScanSummary } from "../src/lib/scan-summary";
import { runSweep } from "../src/lib/sweeper";

async function main() {
  const config = await loadConfig();
  const result = await runSweep();
  const summary = buildScanSummary(result, config);

  await writeFile(
    "data/last-scan-summary.json",
    JSON.stringify(summary, null, 2),
    "utf-8"
  );

  console.log(JSON.stringify(summary, null, 2));

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
