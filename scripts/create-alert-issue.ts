import { readFileSync, writeFileSync } from "fs";
import { buildAlertIssueBody } from "../src/lib/scan-summary";
import type { ScanSummary } from "../src/lib/scan-summary";

function main() {
  const summary = JSON.parse(
    readFileSync("data/last-scan-summary.json", "utf-8")
  ) as ScanSummary;

  if (!summary.hasAlerts || summary.targetAlerts.length === 0) {
    console.log("SKIP_ISSUE=1");
    console.log(
      `Nėra pasiūlymų ≤ ${summary.pricePerPersonMax} €/asm — el. laiškas nesiunčiamas.`
    );
    return;
  }

  const date = new Date(summary.scannedAt).toLocaleDateString("lt-LT", {
    timeZone: "Europe/Vilnius",
  });
  const title = `🏖️ Kainų alertas — ${date} (≤${summary.pricePerPersonMax} €/asm)`;
  const body = buildAlertIssueBody(summary);

  writeFileSync(".github-alert-title.txt", title, "utf-8");
  writeFileSync(".github-alert-body.md", body, "utf-8");

  console.log("SKIP_ISSUE=0");
  console.log(`Sukurtas alertas: ${summary.targetAlerts.length} pasiūlymų`);
}

main();
