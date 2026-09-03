import {
  ACCOMMODATION_DOUBLE,
  API_DATE_CHUNK_DAYS,
  API_PRICE_MAX,
  CURRENCY_EUR,
  HOTEL_CLASS_IDS,
  MEAL_PLAN_AI,
  TEZ_API_BASE,
  TURKEY_COUNTRY_ID,
} from "./constants";
import { calculateValueScore, isInTargetRange } from "./ranking";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "./types";

type TezRow = unknown[];

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function decodeHtml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function getPriceBlock(row: TezRow): { total?: string } | null {
  const block10 = row[10];
  if (block10 && typeof block10 === "object" && !Array.isArray(block10)) {
    return block10 as { total?: string };
  }
  const block9 = row[9];
  if (block9 && typeof block9 === "object" && !Array.isArray(block9)) {
    return block9 as { total?: string };
  }
  return null;
}

function buildDealId(row: TezRow, hotelId: number): string {
  const departureDate = row[0] as string;
  const nights = row[3] as number;
  const roomBlock = row[8] as [number, string, number] | undefined;
  const roomId = roomBlock?.[0] ?? 0;
  return `tez-${hotelId}-${departureDate}-${nights}-${roomId}`;
}

export function parseTezRow(
  row: TezRow,
  hotel: WatchlistHotel,
  adults: number,
  config: SweeperConfig
): TravelDeal | null {
  if (!Array.isArray(row) || row.length < 11) return null;

  const priceBlock = getPriceBlock(row);
  const totalPrice = Number(priceBlock?.total ?? 0);
  if (!totalPrice) return null;

  const hotelBlock = row[6] as [string, string, string | undefined, number];
  const boardBlock = row[7] as [string, string];
  const regionBlock = row[5] as string[];
  const roomBlock = row[8] as [number, string, number];
  const cityBlock = row[16] as [string, string] | undefined;

  const pricePerPerson = Math.round(totalPrice / adults);
  const valueScore = calculateValueScore(hotel.qualityScore, pricePerPerson);

  return {
    id: buildDealId(row, hotel.hotelId),
    hotelId: hotel.hotelId,
    departureDate: row[0] as string,
    nights: row[3] as number,
    returnDate: row[4] as string,
    resort: decodeHtml(regionBlock?.at(-1) ?? regionBlock?.[0] ?? hotel.resort),
    country: "Turkija",
    hotelName: decodeHtml(hotelBlock[1] ?? hotel.name),
    hotelUrl: hotel.url,
    hotelImage: hotelBlock[2],
    board: decodeHtml(boardBlock[1] ?? boardBlock[0] ?? ""),
    roomType: roomBlock?.[1] ?? "Standard",
    totalPrice,
    pricePerPerson,
    adults,
    departureCity: cityBlock?.[0] ?? "Vilnius",
    qualityScore: hotel.qualityScore,
    valueScore,
    source: "tez-tour",
    foundAt: new Date().toISOString(),
    inTargetRange: isInTargetRange(pricePerPerson, config),
  };
}

function getDateChunks(totalDays: number): Array<{ after: Date; before: Date }> {
  const chunks: Array<{ after: Date; before: Date }> = [];
  const start = new Date();
  let cursor = new Date(start);

  while (cursor.getTime() < start.getTime() + totalDays * 86400000) {
    const after = new Date(cursor);
    const before = new Date(cursor);
    before.setDate(before.getDate() + API_DATE_CHUNK_DAYS);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + totalDays);
    if (before > maxEnd) before.setTime(maxEnd.getTime());
    chunks.push({ after, before });
    cursor = new Date(before);
    cursor.setDate(cursor.getDate() + 1);
  }

  return chunks;
}

async function fetchTezChunk(
  config: SweeperConfig,
  hotel: WatchlistHotel,
  after: Date,
  before: Date
): Promise<TezRow[]> {
  const hotelClassId = HOTEL_CLASS_IDS[config.minStars] ?? HOTEL_CLASS_IDS[4];

  const params = new URLSearchParams({
    cityId: String(config.departureCityId),
    countryId: String(hotel.countryId || TURKEY_COUNTRY_ID),
    after: formatDate(after),
    before: formatDate(before),
    nightsMin: String(config.nightsMin),
    nightsMax: String(config.nightsMax),
    priceMin: "0",
    priceMax: String(API_PRICE_MAX),
    hotelClassId: String(hotelClassId),
    hotelClassBetter: "true",
    rAndBId: String(MEAL_PLAN_AI),
    rAndBBetter: "true",
    accommodationId: String(ACCOMMODATION_DOUBLE),
    currency: String(CURRENCY_EUR),
    locale: "lt",
    hotelId: String(hotel.hotelId),
  });

  const response = await fetch(`${TEZ_API_BASE}?${params.toString()}`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`TEZ API klaida: ${response.status}`);
  }

  const payload = (await response.json()) as {
    success?: boolean;
    message?: string;
    data?: TezRow[];
  };

  if (!payload.success) {
    if (
      payload.message?.includes("Not found") ||
      payload.message?.includes("nerasta")
    ) {
      return [];
    }
    throw new Error(payload.message ?? "TEZ API paieška nepavyko");
  }

  return payload.data ?? [];
}

export async function searchHotelDeals(
  config: SweeperConfig,
  hotel: WatchlistHotel
): Promise<TravelDeal[]> {
  const chunks = getDateChunks(config.dateRangeDays);
  const allDeals: TravelDeal[] = [];

  for (const chunk of chunks) {
    const rows = await fetchTezChunk(config, hotel, chunk.after, chunk.before);
    for (const row of rows) {
      const deal = parseTezRow(row, hotel, config.adults, config);
      if (deal) allDeals.push(deal);
    }
  }

  const byId = new Map<string, TravelDeal>();
  for (const deal of allDeals) {
    const existing = byId.get(deal.id);
    if (!existing || deal.totalPrice < existing.totalPrice) {
      byId.set(deal.id, deal);
    }
  }

  return [...byId.values()].sort((a, b) => a.pricePerPerson - b.pricePerPerson);
}
