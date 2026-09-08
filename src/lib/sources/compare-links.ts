import type { WatchlistHotel } from "../types";
import type { CompareLink, PriceSourceId } from "./types";

function encodeQuery(value: string): string {
  return encodeURIComponent(value.trim());
}

function hotelKeyword(hotel: WatchlistHotel): string {
  return hotel.searchKeyword ?? hotel.name.replace(/\s+\d\*.*$/, "").trim();
}

/** Rankinės paieškos nuorodos į LT kelionių agentūras (be TEZ API) */
export function getCompareLinks(hotel: WatchlistHotel): CompareLink[] {
  const keyword = hotelKeyword(hotel);
  const q = encodeQuery(keyword);
  const qPlus = encodeQuery(keyword.replace(/\s+/g, "+"));

  const links: Array<Omit<CompareLink, "automated"> & { automated?: boolean }> = [
    {
      sourceId: "tez-tour",
      name: "TEZ Tour",
      url: hotel.url,
      automated: true,
    },
    {
      sourceId: "tez-ispardavimas",
      name: "TEZ Išpardavimas",
      url: "https://ispardavimas.teztour.lt/",
    },
    {
      sourceId: "novaturas",
      name: "Novaturas",
      url: `https://www.novaturas.lt/country/TR?search=${q}`,
    },
    {
      sourceId: "westexpress",
      name: "West Express",
      url: `https://www.westexpress.lt/keliones/poilsines-keliones-i-turkija?search=${q}`,
    },
    {
      sourceId: "joinup",
      name: "JoinUP",
      url: `https://joinup.lt/lt/search-tour?destination=turkey&query=${qPlus}`,
      automated: true,
    },
    {
      sourceId: "coral",
      name: "Coral Travel",
      url: `https://www.coraltravel.lt/keliones/poilsines-keliones/turkija?search=${q}`,
    },
    {
      sourceId: "anextour",
      name: "Anex Tour",
      url: `https://www.anextour.lt/lt/search?query=${q}`,
    },
    {
      sourceId: "itaka",
      name: "Itaka",
      url: `https://www.itaka.lt/paieska?q=${q}`,
      automated: true,
    },
    {
      sourceId: "pasirinksparnus",
      name: "Pasirink Sparnus",
      url: `https://www.pasirinksparnus.lt/keliones/islaidu/turkija?search=${q}`,
    },
    {
      sourceId: "kelioniupanorama",
      name: "Kelionių Panorama",
      url: `https://www.kelioniupanorama.lt/keliones/turkija/?search=${q}`,
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
  { id: "tez-ispardavimas", name: "TEZ Išpardavimas", automated: false },
  { id: "novaturas", name: "Novaturas", automated: false },
  { id: "westexpress", name: "West Express", automated: false },
  { id: "joinup", name: "JoinUP", automated: true },
  { id: "coral", name: "Coral Travel", automated: false },
  { id: "anextour", name: "Anex Tour", automated: false },
  { id: "itaka", name: "Itaka", automated: true },
  { id: "pasirinksparnus", name: "Pasirink Sparnus", automated: false },
  { id: "kelioniupanorama", name: "Kelionių Panorama", automated: false },
];
