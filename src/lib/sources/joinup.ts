import { searchJoinupDeals } from "../joinup-api";
import type { SweeperConfig, TravelDeal, WatchlistHotel } from "../types";
import type { PriceSource } from "./types";

export const joinupSource: PriceSource = {
  id: "joinup",
  name: "JoinUP",
  automated: true,
  searchDeals: searchJoinupDeals,
};
