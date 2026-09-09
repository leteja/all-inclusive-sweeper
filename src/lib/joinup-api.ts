import { logProgress, sleep } from "./http";
import { calculateValueScore, isInTargetRange } from "./ranking";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "./types";

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const JOINUP_BASE = "https://joinup.lt/api/main";
const JOINUP_REFERER = "https://joinup.lt/lt/tours";
const TURKEY_DESTINATION = "c_8";
const VILNIUS_ORIGIN = "2151";

/** tour/offers ribojamas — minimalus skaičius užklausų */
const REQUEST_DELAY_MS = 3000;
const MAX_DATE_CHECKS = 2;
const JOINUP_FETCH_TIMEOUT_MS = 20_000;

/** Pilna kelionė su skrydžiu 2 asm. iš Vilniaus — žemesnė = tik viešbutis */
const MIN_TRIP_TOTAL_EUR = 1000;

let cachedJoinupDates: string[] | null = null;
let joinupGloballyLimited = false;

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
  const result = await fetchJoinupJson<JoinupSearchResult>(
    `${JOINUP_BASE}/search/search?query=${keyword}`
  );
  if (!result.ok) return null;

  const match = (result.data.destinations ?? []).find(
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
  const result = await fetchJoinupJson<JoinupDatesResult>(
    `${JOINUP_BASE}/tour/dates?destinations=${TURKEY_DESTINATION}&origins=${VILNIUS_ORIGIN}`
  );
  if (!result.ok) return [];
  cachedJoinupDates = (result.data.dates ?? []).map((item) => item.date);
  return cachedJoinupDates;
}

export function resetJoinupCache(): void {
  cachedJoinupDates = null;
  joinupGloballyLimited = false;
}

export function isJoinupRateLimited(): boolean {
  return joinupGloballyLimited;
}

type JoinupFetchResult<T> =
  | { ok: true; data: T; rateLimited: false }
  | { ok: false; data: T; rateLimited: boolean };

/** Viena užklausa be retry — 429 = iškart sustabdyti JoinUP šiam skenavimui */
async function fetchJoinupJson<T>(url: string): Promise<JoinupFetchResult<T>> {
  const empty = {} as T;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(JOINUP_FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "User-Agent": DEFAULT_UA,
        Referer: JOINUP_REFERER,
      },
    });

    if (response.status === 429) {
      joinupGloballyLimited = true;
      return { ok: false, data: empty, rateLimited: true };
    }

    if (!response.ok) {
      return { ok: false, data: empty, rateLimited: false };
    }

    const payload = (await response.json()) as T & {
      error?: string;
      status?: number;
    };

    if (payload?.status === 429) {
      joinupGloballyLimited = true;
      return { ok: false, data: empty, rateLimited: true };
    }

    return { ok: true, data: payload, rateLimited: false };
  } catch {
    return { ok: false, data: empty, rateLimited: false };
  }
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

  if (installment > 0 && total <= installment * 1.5) return null;

  if (perPax > 0 && total <= perPax * 1.5) {
    return Math.round(perPax * adults);
  }

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
  if (joinupGloballyLimited) {
    logProgress(`JoinUP: praleidžiama „${hotel.name}“ (API riboja)`);
    return [];
  }

  const joinupHotelId = await resolveJoinupHotelId(hotel);
  if (!joinupHotelId) {
    logProgress(`JoinUP: nerastas viešbutis „${hotel.name}“`);
    return [];
  }

  if (joinupGloballyLimited) return [];

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + config.dateRangeDays);

  const allDates = await getJoinupDates();
  if (joinupGloballyLimited || allDates.length === 0) return [];

  const inRange = allDates.filter((date) => {
    const parsed = new Date(date);
    return parsed >= today && parsed <= end;
  });
  const dates = sampleDates(inRange, MAX_DATE_CHECKS);
  const deals: TravelDeal[] = [];

  logProgress(`JoinUP: „${hotel.name}“ — ${dates.length} datos`);

  for (const date of dates) {
    if (joinupGloballyLimited) break;

    const params = new URLSearchParams({
      destinations: TURKEY_DESTINATION,
      origins: VILNIUS_ORIGIN,
      dates: date,
      stays: String(config.nightsMin),
      pax_adl: String(config.adults),
      offer_type: "tour",
      hotel_ids: joinupHotelId,
    });

    const result = await fetchJoinupJson<JoinupHotelOffersResult>(
      `${JOINUP_BASE}/tour/offers?${params.toString()}`
    );

    if (result.rateLimited) {
      logProgress(
        `JoinUP: API riboja (429) — praleidžiami likę viešbučiai šiame skenavime`
      );
      break;
    }

    if (!result.ok) {
      logProgress(`JoinUP: „${hotel.name}“ ${date} — užklausa nepavyko, tęsiama`);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    for (const tour of result.data.tours ?? []) {
      for (const offer of tour.offers ?? []) {
        const deal = buildJoinupDeal(hotel, joinupHotelId, offer, config);
        if (deal) deals.push(deal);
      }
    }

    await sleep(REQUEST_DELAY_MS);
  }

  logProgress(`JoinUP: „${hotel.name}“ — rasta ${deals.length} pasiūlymų`);
  return [...deals].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
}
