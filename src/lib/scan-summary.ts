import { getCompareLinks } from "./sources";
import type { ScanResult, SweeperConfig, WatchlistHotel } from "./types";

const SOURCE_LABELS: Record<string, string> = {
  "tez-tour": "TEZ Tour",
  joinup: "JoinUP",
  itaka: "Itaka",
};

export interface TargetAlertSummary {
  hotel: string;
  pricePerPerson: number;
  date: string;
  nights: number;
  url: string;
  source: string;
  compareLinks: Array<{
    name: string;
    url: string;
    automated: boolean;
  }>;
}

export interface ScanSummary {
  scannedAt: string;
  hotelsScanned: number;
  sourcesScanned: string[];
  totalFound: number;
  /** Tik kai rasta kaina ≤ pricePerPersonMax (400 €) */
  hasAlerts: boolean;
  pricePerPersonMax: number;
  bestDeal: {
    hotel: string;
    pricePerPerson: number;
    date: string;
    url: string;
  } | null;
  targetAlerts: TargetAlertSummary[];
  priceDrops: Array<{
    hotel: string;
    previousPrice: number;
    newPrice: number;
    dropAmount: number;
  }>;
  /** Nuorodos į kitas agentūras kiekvienam stebėtam viešbučiui */
  compareLinksByHotel: Array<{
    hotel: string;
    guestRating: number;
    compareLinks: Array<{ name: string; url: string }>;
  }>;
}

export function buildScanSummary(
  result: ScanResult,
  config: SweeperConfig
): ScanSummary {
  const watchlistById = new Map(
    config.watchlist.map((hotel) => [hotel.hotelId, hotel])
  );

  const targetAlerts: TargetAlertSummary[] = result.targetAlerts
    .filter((deal) => deal.pricePerPerson <= config.pricePerPersonMax)
    .map((deal) => {
      const hotel = watchlistById.get(deal.hotelId);
      const compareLinks = hotel ? getCompareLinks(hotel) : [];
      return {
        hotel: deal.hotelName,
        pricePerPerson: deal.pricePerPerson,
        date: deal.departureDate,
        nights: deal.nights,
        url: deal.hotelUrl,
        source: deal.source,
        compareLinks: compareLinks.map((link) => ({
          name: link.name,
          url: link.url,
          automated: link.automated,
        })),
      };
    });

  const compareLinksByHotel = config.watchlist.map((hotel) => ({
    hotel: hotel.name,
    guestRating: hotel.guestRating,
    compareLinks: getCompareLinks(hotel)
      .filter((link) => !link.automated)
      .map((link) => ({ name: link.name, url: link.url })),
  }));

  return {
    scannedAt: result.scannedAt,
    hotelsScanned: result.hotelsScanned,
    sourcesScanned: result.sourcesScanned,
    totalFound: result.totalFound,
    hasAlerts: targetAlerts.length > 0,
    pricePerPersonMax: config.pricePerPersonMax,
    bestDeal: result.bestDeal
      ? {
          hotel: result.bestDeal.hotelName,
          pricePerPerson: result.bestDeal.pricePerPerson,
          date: result.bestDeal.departureDate,
          url: result.bestDeal.hotelUrl,
        }
      : null,
    targetAlerts,
    priceDrops: result.priceDrops.map((drop) => ({
      hotel: drop.hotelName,
      previousPrice: drop.previousPrice,
      newPrice: drop.newPrice,
      dropAmount: drop.dropAmount,
    })),
    compareLinksByHotel,
  };
}

export function buildAlertIssueBody(summary: ScanSummary): string {
  const scannedLocal = new Date(summary.scannedAt).toLocaleString("lt-LT", {
    timeZone: "Europe/Vilnius",
    dateStyle: "long",
    timeStyle: "short",
  });

  const lines: string[] = [
    `**Vakarinis patikrinimas:** ${scannedLocal} (Vilnius)`,
    "",
    `Rasta **${summary.targetAlerts.length}** pasiūlymų jūsų biudžete (iki **${summary.pricePerPersonMax} €/asm**).`,
    "",
  ];

  for (const alert of summary.targetAlerts) {
    lines.push(`### ${alert.hotel} — ${alert.pricePerPerson} €/asm`);
    lines.push(`- Išvykimas: **${alert.date}**, ${alert.nights} nakv.`);
    lines.push(
      `- **[Rezervuoti ${SOURCE_LABELS[alert.source] ?? alert.source}](${alert.url})**`
    );
    const otherLinks = alert.compareLinks.filter((link) => !link.automated);
    if (otherLinks.length > 0) {
      lines.push("- **Kitos agentūros (patikrinkite ranka):**");
      for (const link of otherLinks) {
        lines.push(`  - [${link.name}](${link.url})`);
      }
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("**Visi stebimi viešbučiai — nuorodos į kitas agentūras:**");
  for (const hotel of summary.compareLinksByHotel) {
    lines.push(`- **${hotel.hotel}** (${hotel.guestRating}/10):`);
    for (const link of hotel.compareLinks) {
      lines.push(`  - [${link.name}](${link.url})`);
    }
  }

  return lines.join("\n");
}
