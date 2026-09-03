import type { HotelSummary, SweeperConfig, TravelDeal, WatchlistHotel } from "./types";

/** Kuo didesnis, tuo geresnis kainos ir kokybės balansas */
export function calculateValueScore(
  qualityScore: number,
  pricePerPerson: number
): number {
  if (pricePerPerson <= 0) return 0;
  return Math.round((qualityScore / pricePerPerson) * 1000) / 10;
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

export function pickBestDeal(deals: TravelDeal[]): TravelDeal | null {
  if (deals.length === 0) return null;
  return [...deals].sort((a, b) => b.valueScore - a.valueScore)[0];
}

export function buildHotelSummaries(
  watchlist: WatchlistHotel[],
  deals: TravelDeal[]
): HotelSummary[] {
  return watchlist.map((hotel) => {
    const hotelDeals = deals.filter((d) => d.hotelId === hotel.hotelId);
    const cheapest =
      hotelDeals.length > 0
        ? hotelDeals.reduce((min, d) =>
            d.pricePerPerson < min.pricePerPerson ? d : min
          )
        : null;

    return {
      hotelId: hotel.hotelId,
      name: hotel.name,
      url: hotel.url,
      resort: hotel.resort,
      stars: hotel.stars,
      qualityScore: hotel.qualityScore,
      note: hotel.note,
      cheapestDeal: cheapest,
      valueScore: cheapest?.valueScore ?? 0,
    };
  });
}

export function parseHotelIdFromUrl(url: string): number | null {
  const match = url.match(/[?&]id=(\d+)/);
  return match ? Number(match[1]) : null;
}
