import type { WatchlistHotel } from "../types";
import type { CompareLink, PriceSourceId } from "./types";

function encodeQuery(value: string): string {
  return encodeURIComponent(value.trim());
}

/** Rankinės paieškos nuorodos į kitas LT kelionių agentūras */
export function getCompareLinks(hotel: WatchlistHotel): CompareLink[] {
  const keyword = hotel.searchKeyword ?? hotel.name.replace(/\s+\d\*.*$/, "");
  const q = encodeQuery(keyword);

  const links: Array<Omit<CompareLink, "automated"> & { automated?: boolean }> = [
    {
      sourceId: "tez-tour",
      name: "TEZ Tour",
      url: hotel.url,
      automated: true,
    },
    {
      sourceId: "novaturas",
      name: "Novaturas",
      url: `https://www.novaturas.lt/country/TR?search=${q}`,
    },
    {
      sourceId: "westexpress",
      name: "West Express",
      url: `https://www.westexpress.lt/kelione-i-turkija?search=${q}`,
    },
    {
      sourceId: "joinup",
      name: "JoinUP",
      url: `https://joinup.lt/lt/search-tour?destination=turkey`,
    },
    {
      sourceId: "coral",
      name: "Coral Travel",
      url: `https://www.coraltravel.lt/`,
    },
    {
      sourceId: "pasirinksparnus",
      name: "Pasirink Sparnus",
      url: `https://www.pasirinksparnus.lt/kelione-i-turkija`,
    },
    {
      sourceId: "kelioniupanorama",
      name: "Kelionių Panorama",
      url: `https://www.kelioniupanorama.lt/keliones/turkija/`,
    },
    {
      sourceId: "tez-ispardavimas",
      name: "TEZ Išpardavimas",
      url: "https://ispardavimas.teztour.lt/",
    },
  ];

  return links.map((link) => ({
    sourceId: link.sourceId as PriceSourceId,
    name: link.name,
    url: link.url,
    automated: link.automated ?? false,
  }));
}

export const ALL_SOURCES: Array<{
  id: PriceSourceId;
  name: string;
  automated: boolean;
}> = [
  { id: "tez-tour", name: "TEZ Tour", automated: true },
  { id: "novaturas", name: "Novaturas", automated: false },
  { id: "westexpress", name: "West Express", automated: false },
  { id: "joinup", name: "JoinUP", automated: false },
  { id: "coral", name: "Coral Travel", automated: false },
  { id: "pasirinksparnus", name: "Pasirink Sparnus", automated: false },
  { id: "kelioniupanorama", name: "Kelionių Panorama", automated: false },
  { id: "tez-ispardavimas", name: "TEZ Ispardavimas", automated: false },
];
