import type { SweeperConfig } from "./types";

export const TEZ_API_BASE = "https://search.tez-tour.com/tariffsearch/getResult";

export const CURRENCY_EUR = 5561;

export const HOTEL_CLASS_IDS: Record<number, number> = {
  3: 2568,
  4: 2569,
  5: 2570,
};

export const MEAL_PLAN_AI = 2424;

export const ACCOMMODATION_DOUBLE = 2;

export const DEPARTURE_CITIES = [
  { id: 4800, name: "Vilnius", iata: "VNO" },
] as const;

export const DESTINATION_COUNTRIES = [
  { id: 1104, name: "Turkija", note: "Geriausias kainos/kokybės santykis jūsų biudžete" },
  { id: 5732, name: "Egiptas", note: "Hurgada, Sharm — dažnai pigiau nei Turkija" },
  { id: 136683, name: "Bulgarija", note: "Paplūdimys, bet AI retesnis" },
  { id: 5733, name: "Graikija", note: "4* AI retai telpa į 300–400 €" },
] as const;

export const DEFAULT_CONFIG = {
  adults: 2,
  pricePerPersonMin: 300,
  pricePerPersonMax: 400,
  minStars: 4,
  nightsMin: 7,
  nightsMax: 10,
  departureCityId: 4800,
  countryIds: [1104, 5732],
  dateRangeDays: 45,
  notifyOnlyNew: true,
  telegram: {
    enabled: false,
    botToken: "",
    chatId: "",
  },
} as SweeperConfig;
