import {
  ACCOMMODATION_DOUBLE,
  CURRENCY_EUR,
  HOTEL_CLASS_IDS,
  MEAL_PLAN_AI,
  TEZ_API_BASE,
} from "./constants";
import type { SweeperConfig, TravelDeal } from "./types";

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

function buildDealId(row: TezRow, countryId: number): string {
  const hotelId = (row[6] as [string, string, string, number])[3];
  const departureDate = row[0] as string;
  const nights = row[3] as number;
  const roomId = (row[8] as [number, string, number])[0];
  return `tez-${countryId}-${hotelId}-${departureDate}-${nights}-${roomId}`;
}

export function parseTezRow(
  row: TezRow,
  countryId: number,
  adults: number,
  countryName: string
): TravelDeal | null {
  if (!Array.isArray(row) || row.length < 10) return null;

  const priceBlock = row[9] as { total?: string };
  const totalPrice = Number(priceBlock?.total ?? 0);
  if (!totalPrice) return null;

  const hotelBlock = row[6] as [string, string, string | undefined, number];
  const boardBlock = row[7] as [string, string];
  const regionBlock = row[5] as string[];
  const roomBlock = row[8] as [number, string, number];
  const cityBlock = row[row.length - 8] as [string, string] | undefined;

  const pricePerPerson = totalPrice / adults;

  return {
    id: buildDealId(row, countryId),
    departureDate: row[0] as string,
    nights: row[3] as number,
    returnDate: row[4] as string,
    resort: regionBlock?.at(-1) ?? regionBlock?.[0] ?? "Nežinoma",
    country: countryName,
    hotelName: decodeHtml(hotelBlock[1] ?? ""),
    hotelUrl: hotelBlock[0] ?? "",
    hotelImage: hotelBlock[2],
    board: decodeHtml(boardBlock[1] ?? boardBlock[0] ?? ""),
    roomType: roomBlock?.[1] ?? "Standard",
    totalPrice,
    pricePerPerson: Math.round(pricePerPerson),
    adults,
    departureCity: cityBlock?.[0] ?? "Vilnius",
    source: "tez-tour",
    foundAt: new Date().toISOString(),
  };
}

export async function searchTezDeals(
  config: SweeperConfig,
  countryId: number,
  countryName: string
): Promise<TravelDeal[]> {
  const after = new Date();
  const before = new Date();
  before.setDate(before.getDate() + config.dateRangeDays);

  const hotelClassId = HOTEL_CLASS_IDS[config.minStars] ?? HOTEL_CLASS_IDS[4];
  const totalMax = config.pricePerPersonMax * config.adults * 100;

  const params = new URLSearchParams({
    cityId: String(config.departureCityId),
    countryId: String(countryId),
    after: formatDate(after),
    before: formatDate(before),
    nightsMin: String(config.nightsMin),
    nightsMax: String(config.nightsMax),
    priceMin: "0",
    priceMax: String(totalMax),
    hotelClassId: String(hotelClassId),
    hotelClassBetter: "true",
    rAndBId: String(MEAL_PLAN_AI),
    rAndBBetter: "true",
    accommodationId: String(ACCOMMODATION_DOUBLE),
    currency: String(CURRENCY_EUR),
    locale: "lt",
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
    if (payload.message?.includes("Not found")) {
      return [];
    }
    throw new Error(payload.message ?? "TEZ API paieška nepavyko");
  }

  const rows = payload.data ?? [];
  const minTotal = config.pricePerPersonMin * config.adults;

  return rows
    .map((row) => parseTezRow(row, countryId, config.adults, countryName))
    .filter((deal): deal is TravelDeal => {
      if (!deal) return false;
      return (
        deal.totalPrice >= minTotal &&
        deal.totalPrice <= config.pricePerPersonMax * config.adults
      );
    })
    .sort((a, b) => a.totalPrice - b.totalPrice);
}
