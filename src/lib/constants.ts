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

/**
 * 5 atrinkti viešbučiai su tikrais svečių įvertinimais ≥ 8.0/10.
 * Belpoint Beach ir panašūs pašalinti — žemos apžvalgos (2–3 žv. realybėje).
 */
export const DEFAULT_WATCHLIST: WatchlistHotel[] = [
  {
    hotelId: 648058,
    name: "Dedeman Kemer Resort 5*",
    url: "https://www.tez-tour.com/hotel.html?id=648058",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 8.5,
    note: "Patikimas 5* Kemere, geras aptarnavimas, ~810 €/asm",
  },
  {
    hotelId: 9003188,
    name: "White Lilyum Hotel 5*",
    url: "https://www.tez-tour.com/hotel.html?id=9003188",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 8.3,
    note: "Arti paplūdimio, daug kartotinių svečių, 8.3/10",
  },
  {
    hotelId: 42202,
    name: "Holiday Garden Resort 5*",
    url: "https://www.tez-tour.com/hotel.html?id=42202",
    resort: "Alanija",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 8.2,
    note: "Plati teritorija, vandens parkas, 8.2/10",
  },
  {
    hotelId: 42667,
    name: "Orange County Kemer 5*",
    url: "https://www.tez-tour.com/hotel.html?id=42667",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 8.6,
    note: "1-a linija, tematika, TripAdvisor 4.3/5",
  },
  {
    hotelId: 14795,
    name: "Limak Limra Hotel & Resort 5*",
    url: "https://www.tez-tour.com/hotel.html?id=14795",
    resort: "Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 9.1,
    note: "Geriausia kokybė sąraše — 9.1/10, Zoover sidabras",
  },
];

export const DEFAULT_CONFIG: SweeperConfig = {
  adults: 2,
  pricePerPersonMin: 300,
  pricePerPersonMax: 400,
  minStars: 4,
  minGuestRating: 8.0,
  nightsMin: 7,
  nightsMax: 10,
  departureCityId: 4800,
  dateRangeDays: 45,
  priceDropThreshold: 15,
  watchlist: DEFAULT_WATCHLIST,
};
