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
 * 5 geriausiai įvertinti viešbučiai su mažiausiomis TEZ kainomis (4–5* AI).
 * Atrinkti pagal Booking įvertinimus ≥ 8.0 ir realų nuolaidų potencialą ne sezonu.
 * 400 €/asm — siektina tikslas (akcijos, lapkritis–spalis); dabartinis minimumas ~678 €.
 */
export const DEFAULT_WATCHLIST: WatchlistHotel[] = [
  {
    hotelId: 7003264,
    name: "Rose Garden Premium 4*",
    url: "https://www.tez-tour.com/hotel.html?id=7003264",
    resort: "Beldibi / Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    guestRating: 9.0,
    searchKeyword: "Rose Garden Premium",
    note: "Geriausias kokybės/kainos balansas — 9.0/10, nuo ~678 €/asm lapkritį",
  },
  {
    hotelId: 4118481,
    name: "Ramada Resort by Wyndham Side 4+",
    url: "https://www.tez-tour.com/hotel.html?id=4118481",
    resort: "Sidė",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    guestRating: 8.7,
    searchKeyword: "Ramada Resort Side",
    note: "8.7/10 Booking, nuo ~678 €/asm ne sezonu (spalis–lapkritis)",
  },
  {
    hotelId: 14733,
    name: "Club Hotel Belpinar 4*",
    url: "https://www.tez-tour.com/hotel.html?id=14733",
    resort: "Beldibi / Kemeras",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    guestRating: 8.3,
    searchKeyword: "Club Hotel Belpinar",
    note: "TEZ nuo ~602 €/asm — dažnos akcijos, istoriškai iki ~300 €",
  },
  {
    hotelId: 386383,
    name: "Akdora Elite Hotel & Spa 4*",
    url: "https://www.tez-tour.com/hotel.html?id=386383",
    resort: "Sidė",
    countryId: TURKEY_COUNTRY_ID,
    stars: 4,
    guestRating: 8.0,
    searchKeyword: "Akdora Elite",
    note: "Nuo ~678 €/asm lapkritį, geras kainos/kokybės variantas Alanijoje",
  },
  {
    hotelId: 52579,
    name: "Senza Grand Santana 5*",
    url: "https://www.tez-tour.com/hotel.html?id=52579",
    resort: "Mahmutlar / Alanija",
    countryId: TURKEY_COUNTRY_ID,
    stars: 5,
    guestRating: 8.6,
    searchKeyword: "Senza Grand Santana",
    note: "5* UAI, 8.6/10 — brangesnis (~816 €), bet didesnis nuolaidų potencialas",
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
  dateRangeDays: 120,
  priceDropThreshold: 15,
  watchlist: DEFAULT_WATCHLIST,
};
