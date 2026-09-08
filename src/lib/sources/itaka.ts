import { searchItakaDeals } from "../itaka-api";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "../types";
import type { PriceSource } from "./types";

export const itakaSource: PriceSource = {
  id: "itaka",
  name: "Itaka",
  automated: true,
  searchDeals: searchItakaDeals,
};
