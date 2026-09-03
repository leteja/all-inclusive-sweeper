import type { SweeperConfig, WatchlistHotel } from "./types";

export const TEZ_API_BASE = "https://search.tez-tour.com/tariffsearch/getResult";

export const CURRENCY_EUR = 5561;
export const API_PRICE_MAX = 150000;
export const API_DATE_CHUNK_DAYS = 20;

export const HOTEL_CLASS_IDS: Record<number, number> = {
  3: 2568,
  4: 2569,
  5: 2570,
};

export const MEAL_PLAN_AI = 2424;
export const ACCOMMODATION_DOUBLE = 2;
export const TURKEY_COUNTRY_ID = 1104;

export const DEPARTURE_CITIES = [
  { id: 4800, name: "Vilnius", iata: "VNO" },
] as const;

/** 5 atrinkti 4–5* AI viešbučiai — geriausias kainos/kokybės santykis iš Vilniaus */
export const DEFAULT_WATCHLIST: WatchlistHotel[] = [
  {
    hotelId: 242482,
    name: "Belpoint Beach Hotel 4*",
    url: "https://www.tez-tour.com/hotel.html?id=242482",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    qualityScore: 7.8,
    note: "Pigiausias variantas Kemere, tiesioginis paplūdimys",
  },
  {
    hotelId: 4117593,
    name: "Beldibi Beach Hotel 4*",
    url: "https://www.tez-tour.com/hotel.html?id=4117593",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    qualityScore: 8.0,
    note: "Geras šeimoms, ramus Beldibi kurortas",
  },
  {
    hotelId: 57194,
    name: "Bieno Club Hotel SVS 4*",
    url: "https://www.tez-tour.com/hotel.html?id=57194",
    resort: "Alanija",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    qualityScore: 8.2,
    note: "Populiarus Alanijoje, geras aptarnavimas",
  },
  {
    hotelId: 9001063,
    name: "Garden Park Beldibi Hotel 4*",
    url: "https://www.tez-tour.com/hotel.html?id=9001063",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    qualityScore: 8.4,
    note: "Žalumynai, baseinai, aukštesnė kokybė",
  },
  {
    hotelId: 427996,
    name: "Campus Hill Hotel 5*",
    url: "https://www.tez-tour.com/hotel.html?id=427996",
    resort: "Alanija",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    qualityScore: 8.6,
    note: "5 žvaigždutės už 4* kainą — geriausia kokybė sąraše",
  },
];

export const DEFAULT_CONFIG: SweeperConfig = {
  adults: 2,
  pricePerPersonMin: 300,
  pricePerPersonMax: 400,
  minStars: 4,
  nightsMin: 7,
  nightsMax: 10,
  departureCityId: 4800,
  dateRangeDays: 45,
  watchlist: DEFAULT_WATCHLIST,
};
