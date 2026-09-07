import type { SweeperConfig, TravelDeal, WatchlistHotel } from "../types";

export type PriceSourceId =
  | "tez-tour"
  | "novaturas"
  | "westexpress"
  | "joinup"
  | "coral"
  | "anextour"
  | "itaka"
  | "pasirinksparnus"
  | "kelioniupanorama"
  | "tez-ispardavimas";

export interface CompareLink {
  sourceId: PriceSourceId;
  name: string;
  url: string;
  /** Ar šaltinis tikrinamas automatiškai (GitHub Actions) */
  automated: boolean;
}

export interface PriceSource {
  id: PriceSourceId;
  name: string;
  automated: boolean;
  searchDeals: (
    config: SweeperConfig,
    hotel: WatchlistHotel
  ) => Promise<TravelDeal[]>;
  getCompareLink?: (hotel: WatchlistHotel) => CompareLink;
}
