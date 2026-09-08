import { itakaSource } from "./itaka";
import { joinupSource } from "./joinup";
import { tezSource } from "./tez";
import type { PriceSource } from "./types";

/** Šaltiniai, kuriuos tikrina GitHub Actions automatiškai */
export const AUTOMATED_SOURCES: PriceSource[] = [
  tezSource,
  joinupSource,
  itakaSource,
];

export { ALL_SOURCES, getCompareLinks } from "./compare-links";
export type { CompareLink, PriceSource, PriceSourceId } from "./types";
