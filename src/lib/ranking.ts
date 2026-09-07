import type {
  HotelSummary,
  PriceDropAlert,
  SweeperConfig,
  TravelDeal,
  WatchlistHotel,
} from "./types";
import { getCompareLinks } from "./sources";

/** Kuo didesnis, tuo geresnis kainos ir kokybės balansas */
export function calculateValueScore(
  guestRating: number,
  pricePerPerson: number
): number {
  if (pricePerPerson <= 0) return 0;
  return Math.round((guestRating / pricePerPerson) * 1000) / 10;
}

export function isInTargetRange(
  pricePerPerson: number,
  config: SweeperConfig
): boolean {
  return (
    pricePerPerson >= config.pricePerPersonMin &&
    pricePerPerson <= config.pricePerPersonMax
  );
}

export function meetsQualityBar(hotel: WatchlistHotel, config: SweeperConfig): boolean {
  return (
    hotel.stars >= config.minStars && hotel.guestRating >= config.minGuestRating
  );
}

export function pickBestDeal(deals: TravelDeal[]): TravelDeal | null {
  if (deals.length === 0) return null;
  return [...deals].sort((a, b) => b.valueScore - a.valueScore)[0];
}

export function buildHotelSummaries(
  watchlist: WatchlistHotel[],
  deals: TravelDeal[],
  previousPrices: Record<number, number>,
  dropThreshold: number
): { summaries: HotelSummary[]; drops: PriceDropAlert[] } {
  const drops: PriceDropAlert[] = [];

  const summaries = watchlist.map((hotel) => {
    const hotelDeals = deals.filter((d) => d.hotelId === hotel.hotelId);
    const cheapest =
      hotelDeals.length > 0
        ? hotelDeals.reduce((min, d) =>
            d.pricePerPerson < min.pricePerPerson ? d : min
          )
        : null;

    const previousLowest = previousPrices[hotel.hotelId] ?? null;
    let priceDropped = false;
    let dropAmount = 0;

    if (cheapest && previousLowest !== null) {
      dropAmount = previousLowest - cheapest.pricePerPerson;
      if (dropAmount >= dropThreshold) {
        priceDropped = true;
        drops.push({
          hotelId: hotel.hotelId,
          hotelName: hotel.name,
          previousPrice: previousLowest,
          newPrice: cheapest.pricePerPerson,
          dropAmount,
          deal: cheapest,
        });
      }
    }

    return {
      hotelId: hotel.hotelId,
      name: hotel.name,
      url: hotel.url,
      resort: hotel.resort,
      stars: hotel.stars,
      guestRating: hotel.guestRating,
      note: hotel.note,
      cheapestDeal: cheapest,
      valueScore: cheapest?.valueScore ?? 0,
      previousLowest,
      priceDropped,
      dropAmount,
      compareLinks: getCompareLinks(hotel),
    };
  });

  return { summaries, drops };
}
