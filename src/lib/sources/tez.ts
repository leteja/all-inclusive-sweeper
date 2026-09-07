import { searchHotelDeals } from "../tez-api";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "../types";
import type { PriceSource } from "./types";

export const tezSource: PriceSource = {
  id: "tez-tour",
  name: "TEZ Tour",
  automated: true,
  searchDeals: searchHotelDeals,
};
