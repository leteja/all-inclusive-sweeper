import { tezSource } from "./tez";
import type { PriceSource } from "./types";

/** Šaltiniai, kuriuos tikrina GitHub Actions automatiškai */
export const AUTOMATED_SOURCES: PriceSource[] = [tezSource];

export { ALL_SOURCES, getCompareLinks } from "./compare-links";
export type { CompareLink, PriceSource, PriceSourceId } from "./types";
