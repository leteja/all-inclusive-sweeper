import { fetchJson, sleep } from "./http";
import { calculateValueScore, isInTargetRange } from "./ranking";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "./types";

const JOINUP_BASE = "https://joinup.lt/api/main";
const JOINUP_REFERER = "https://joinup.lt/lt/tours";
const TURKEY_DESTINATION = "c_8";
const VILNIUS_ORIGIN = "2151";
/** Pilnos kelionės (su skrydžiu) kainos iš tour/offers — lėtesnis, bet teisingas */
const REQUEST_DELAY_MS = 4000;
const MAX_DATE_CHECKS = 5;

const joinupFetchOptions: RequestInit = {
  headers: { Referer: JOINUP_REFERER },
};

let cachedJoinupDates: string[] | null = null;

interface JoinupSearchResult {
  destinations?: Array<{
    country?: { id?: string };
    hotel?: { id?: string; name?: string };
    is_available?: boolean;
  }>;
}

interface JoinupDatesResult {
  dates?: Array<{ date: string }>;
}

interface JoinupOffer {
  id: string;
  date_start: string;
  date_end: string;
  stay?: { stay?: number };
  board?: { name?: string; board_type?: string; code?: string };
  rooms?: Array<{ name?: string; code?: string }>;
  price?: {
    total_price?: { price?: string };
    installment_price?: { price?: string };
    per_pax_price?: { price?: string } | null;
  };
}

/** Pilna kelionė su skrydžiu 2 asm. iš Vilniaus — žemesnė = tik viešbutis */
const MIN_TRIP_TOTAL_EUR = 1000;

interface JoinupHotelOffersResult {
  tours?: Array<{
    hotel?: { id?: string; name?: string };
    offers?: JoinupOffer[];
  }>;
}

function hotelKeyword(hotel: WatchlistHotel): string {
  return hotel.searchKeyword ?? hotel.name.replace(/\s+\d\*.*$/, "").trim();
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+\d\*.*$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesMatch(candidate: string, target: string): boolean {
  const a = normalizeName(candidate);
  const b = normalizeName(target);
  return a.includes(b) || b.includes(a);
}

function formatJoinupDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function sampleDates(dates: string[], maxChecks: number): string[] {
  if (dates.length <= maxChecks) return dates;
  const step = Math.ceil(dates.length / maxChecks);
  const sampled: string[] = [];
  for (let i = 0; i < dates.length && sampled.length < maxChecks; i += step) {
    sampled.push(dates[i]);
  }
  return sampled;
}

export async function resolveJoinupHotelId(
  hotel: WatchlistHotel
): Promise<string | null> {
  if (hotel.joinupHotelId) return hotel.joinupHotelId;

  const keyword = encodeURIComponent(hotelKeyword(hotel));
  const payload = await fetchJson<JoinupSearchResult>(
    `${JOINUP_BASE}/search/search?query=${keyword}`
  );

  const match = (payload.destinations ?? []).find(
    (item) =>
      item.country?.id === TURKEY_DESTINATION &&
      item.hotel?.id &&
      item.is_available !== false &&
      namesMatch(item.hotel.name ?? "", hotelKeyword(hotel))
  );

  return match?.hotel?.id ?? null;
}

async function getJoinupDates(): Promise<string[]> {
  if (cachedJoinupDates) return cachedJoinupDates;
  const payload = await fetchJson<JoinupDatesResult>(
    `${JOINUP_BASE}/tour/dates?destinations=${TURKEY_DESTINATION}&origins=${VILNIUS_ORIGIN}`
  );
  cachedJoinupDates = (payload.dates ?? []).map((item) => item.date);
  return cachedJoinupDates;
}

export function resetJoinupCache(): void {
  cachedJoinupDates = null;
}

/** Tiesioginė nuoroda į JoinUP viešbučio puslapį su data ir kaina */
export function buildJoinupOfferUrl(
  joinupHotelId: string,
  offer: JoinupOffer,
  adults: number
): string {
  const stay = offer.stay?.stay ?? 7;
  const boardCode = offer.board?.code;
  const roomCode = offer.rooms?.[0]?.code;
  const date = offer.date_start;

  const params = new URLSearchParams({
    origins: VILNIUS_ORIGIN,
    destinations: TURKEY_DESTINATION,
    stay: String(stay),
    pax_adl: String(adults),
    date,
    offer_type: "tour",
  });
  if (boardCode) params.set("board", boardCode);
  if (roomCode) params.set("room", roomCode);

  return `https://joinup.lt/lt/hotel/${joinupHotelId}?${params.toString()}`;
}

/** Bendra JoinUP nuoroda į viešbučio puslapį */
export function buildJoinupHotelUrl(
  joinupHotelId: string,
  adults = 2,
  stay = 7
): string {
  const params = new URLSearchParams({
    origins: VILNIUS_ORIGIN,
    destinations: TURKEY_DESTINATION,
    stay: String(stay),
    pax_adl: String(adults),
    offer_type: "tour",
  });
  return `https://joinup.lt/lt/hotel/${joinupHotelId}?${params.toString()}`;
}

/** Pilna kelionės kaina — niekada avansas (20%) ar tik viešbučio kaina */
function extractJoinupTripTotal(
  offer: JoinupOffer,
  adults: number
): number | null {
  const total = Number(offer.price?.total_price?.price ?? 0);
  const installment = Number(offer.price?.installment_price?.price ?? 0);
  const perPax = Number(offer.price?.per_pax_price?.price ?? 0);

  if (!total) return null;

  // Kai API grąžina avansą vietoj pilnos kainos (retai, bet saugome)
  if (installment > 0 && total <= installment * 1.5) return null;

  // per_pax_price kai naudojamas — perskaičiuojame į bendrą sumą
  if (perPax > 0 && total <= perPax * 1.5) {
    return Math.round(perPax * adults);
  }

  // hotel/offers grąžina tik viešbučio kainą (< 800 € dviem) — atmesti
  if (total < MIN_TRIP_TOTAL_EUR) return null;

  return Math.round(total);
}

function buildJoinupDeal(
  hotel: WatchlistHotel,
  joinupHotelId: string,
  offer: JoinupOffer,
  config: SweeperConfig
): TravelDeal | null {
  const totalPrice = extractJoinupTripTotal(offer, config.adults);
  if (!totalPrice) return null;

  const pricePerPerson = Math.round(totalPrice / config.adults);
  const nights = offer.stay?.stay ?? config.nightsMin;
  const departureDate = toDisplayDate(offer.date_start);
  const returnDate = toDisplayDate(offer.date_end);
  const roomType = offer.rooms?.[0]?.name ?? "Standard";
  const board = offer.board?.name ?? "Ultra all inclusive";

  return {
    id: `joinup-${joinupHotelId}-${offer.date_start}-${nights}-${offer.id.slice(0, 12)}`,
    hotelId: hotel.hotelId,
    departureDate,
    nights,
    returnDate,
    resort: hotel.resort,
    country: "Turkija",
    hotelName: hotel.name,
    hotelUrl: buildJoinupOfferUrl(joinupHotelId, offer, config.adults),
    board,
    roomType,
    totalPrice,
    pricePerPerson,
    adults: config.adults,
    departureCity: "Vilnius",
    guestRating: hotel.guestRating,
    valueScore: calculateValueScore(hotel.guestRating, pricePerPerson),
    source: "joinup",
    foundAt: new Date().toISOString(),
    inTargetRange: isInTargetRange(pricePerPerson, config),
  };
}

export async function searchJoinupDeals(
  config: SweeperConfig,
  hotel: WatchlistHotel
): Promise<TravelDeal[]> {
  const joinupHotelId = await resolveJoinupHotelId(hotel);
  if (!joinupHotelId) {
    console.warn(`JoinUP: nerastas viešbutis „${hotel.name}“`);
    return [];
  }

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + config.dateRangeDays);

  const allDates = await getJoinupDates();
  const inRange = allDates.filter((date) => {
    const parsed = new Date(date);
    return parsed >= today && parsed <= end;
  });
  const dates = sampleDates(inRange, MAX_DATE_CHECKS);
  const stays = [config.nightsMin, config.nightsMax].filter(
    (value, index, array) => array.indexOf(value) === index
  );

  const deals: TravelDeal[] = [];

  for (const date of dates) {
    for (const stay of stays) {
      const params = new URLSearchParams({
        destinations: TURKEY_DESTINATION,
        origins: VILNIUS_ORIGIN,
        dates: date,
        stays: String(stay),
        pax_adl: String(config.adults),
        offer_type: "tour",
        hotel_ids: joinupHotelId,
      });

      try {
        const payload = await fetchJson<JoinupHotelOffersResult>(
          `${JOINUP_BASE}/tour/offers?${params.toString()}`,
          joinupFetchOptions,
          5
        );

        for (const tour of payload.tours ?? []) {
          for (const offer of tour.offers ?? []) {
            const deal = buildJoinupDeal(hotel, joinupHotelId, offer, config);
            if (deal) deals.push(deal);
          }
        }
      } catch (error) {
        console.error(`JoinUP klaida ${hotel.name} ${date}:`, error);
      }

      await sleep(REQUEST_DELAY_MS);
    }
  }

  const byId = new Map<string, TravelDeal>();
  for (const deal of deals) {
    const existing = byId.get(deal.id);
    if (!existing || deal.totalPrice < existing.totalPrice) {
      byId.set(deal.id, deal);
    }
  }

  return [...byId.values()].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
}
