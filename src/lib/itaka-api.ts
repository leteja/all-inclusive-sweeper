import { fetchText } from "./http";
import { calculateValueScore, isInTargetRange } from "./ranking";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "./types";

interface ItakaRate {
  id: string;
  price: number;
  participants?: Array<{ price?: number; type?: string }>;
  segments?: Array<{
    type?: string;
    beginDateTime?: string;
    endDateTime?: string;
    departure?: { title?: string };
    destination?: { title?: string };
    meal?: { title?: string; id?: string };
    content?: { title?: string; url?: string };
  }>;
}

function hotelKeyword(hotel: WatchlistHotel): string {
  return hotel.searchKeyword ?? hotel.name.replace(/\s+\d\*.*$/, "").trim();
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+\d\*.*$/, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9ąčęėįšųūž]+/gi, " ")
    .trim();
}

function namesMatch(candidate: string, target: string): boolean {
  const a = normalizeName(candidate);
  const b = normalizeName(target);
  if (!a || !b) return false;
  const aWords = a.split(/\s+/).filter((word) => word.length > 2);
  const bWords = b.split(/\s+/).filter((word) => word.length > 2);
  const overlap = aWords.filter((word) => bWords.includes(word));
  return overlap.length >= Math.min(2, bWords.length);
}

function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

function parseItakaRates(html: string): ItakaRate[] {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return [];

  const data = JSON.parse(match[1]) as {
    props?: {
      pageProps?: {
        initialQueryState?: {
          queries?: Array<{
            state?: {
              data?: {
                main?: {
                  rates?: {
                    list?: ItakaRate[];
                  };
                };
              };
            };
          }>;
        };
      };
    };
  };

  return (
    data.props?.pageProps?.initialQueryState?.queries?.[0]?.state?.data?.main
      ?.rates?.list ?? []
  );
}

function buildItakaDeal(
  hotel: WatchlistHotel,
  rate: ItakaRate,
  config: SweeperConfig
): TravelDeal | null {
  const flight = rate.segments?.find((segment) => segment.type === "flight");
  const hotelSegment = rate.segments?.find((segment) => segment.type === "hotel");
  const hotelTitle = hotelSegment?.content?.title;
  if (!hotelTitle || !namesMatch(hotelTitle, hotelKeyword(hotel))) {
    return null;
  }

  const adultPriceCents =
    rate.participants?.find((participant) => participant.type === "adult")
      ?.price ?? rate.price / config.adults;
  const pricePerPerson = Math.round(adultPriceCents / 100);
  if (!pricePerPerson) return null;

  const departureIso = flight?.beginDateTime?.slice(0, 10);
  const returnIso = flight?.endDateTime?.slice(0, 10);
  if (!departureIso) return null;

  const departureDate = toDisplayDate(departureIso);
  const returnDate = returnIso ? toDisplayDate(returnIso) : departureDate;
  const departure = new Date(departureIso);
  const arrival = new Date(returnIso ?? departureIso);
  const nights = Math.max(
    1,
    Math.round((arrival.getTime() - departure.getTime()) / 86400000)
  );

  if (nights < config.nightsMin || nights > config.nightsMax) {
    return null;
  }

  const end = new Date();
  end.setDate(end.getDate() + config.dateRangeDays);
  if (departure < new Date() || departure > end) {
    return null;
  }

  const board = hotelSegment?.meal?.title ?? "Viskas įskaičiuota";
  const hotelUrl =
    hotelSegment?.content?.url ??
    `https://www.itaka.lt/lt/offers?destinations=turkija&transport=flight&meal=A&rateType=holidays&adultsNumber=${config.adults}&query=${encodeURIComponent(hotelKeyword(hotel))}`;

  return {
    id: `itaka-${hotel.hotelId}-${departureIso}-${nights}-${rate.id.slice(0, 12)}`,
    hotelId: hotel.hotelId,
    departureDate,
    nights,
    returnDate,
    resort: hotel.resort,
    country: "Turkija",
    hotelName: hotelTitle,
    hotelUrl: hotelUrl.startsWith("http")
      ? hotelUrl
      : `https://www.itaka.lt${hotelUrl}`,
    board,
    roomType: "Standard",
    totalPrice: pricePerPerson * config.adults,
    pricePerPerson,
    adults: config.adults,
    departureCity: flight?.departure?.title ?? "Vilnius",
    guestRating: hotel.guestRating,
    valueScore: calculateValueScore(hotel.guestRating, pricePerPerson),
    source: "itaka",
    foundAt: new Date().toISOString(),
    inTargetRange: isInTargetRange(pricePerPerson, config),
  };
}

let cachedRatesHtml: string | null = null;

async function loadItakaRates(): Promise<ItakaRate[]> {
  if (!cachedRatesHtml) {
    const url =
      "https://www.itaka.lt/lt/offers?destinations=turkija&transport=flight&meal=A&rateType=holidays&adultsNumber=2";
    cachedRatesHtml = await fetchText(url);
  }
  return parseItakaRates(cachedRatesHtml);
}

export function resetItakaCache(): void {
  cachedRatesHtml = null;
}

export async function searchItakaDeals(
  config: SweeperConfig,
  hotel: WatchlistHotel
): Promise<TravelDeal[]> {
  const rates = await loadItakaRates();
  const deals: TravelDeal[] = [];

  for (const rate of rates) {
    const deal = buildItakaDeal(hotel, rate, config);
    if (deal) deals.push(deal);
  }

  return deals.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
}
