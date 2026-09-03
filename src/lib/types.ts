export interface WatchlistHotel {
  hotelId: number;
  name: string;
  url: string;
  resort: string;
  countryId: number;
  stars: number;
  /** Svečių įvertinimas 10 balų skalėje (Booking/TripAdvisor) */
  guestRating: number;
  note: string;
}

export interface SweeperConfig {
  adults: number;
  pricePerPersonMin: number;
  pricePerPersonMax: number;
  minStars: number;
  minGuestRating: number;
  nightsMin: number;
  nightsMax: number;
  departureCityId: number;
  dateRangeDays: number;
  priceDropThreshold: number;
  watchlist: WatchlistHotel[];
}

export interface TravelDeal {
  id: string;
  hotelId: number;
  departureDate: string;
  nights: number;
  returnDate: string;
  resort: string;
  country: string;
  hotelName: string;
  hotelUrl: string;
  hotelImage?: string;
  board: string;
  roomType: string;
  totalPrice: number;
  pricePerPerson: number;
  adults: number;
  departureCity: string;
  guestRating: number;
  valueScore: number;
  source: "tez-tour";
  foundAt: string;
  inTargetRange?: boolean;
}

export interface HotelSummary {
  hotelId: number;
  name: string;
  url: string;
  resort: string;
  stars: number;
  guestRating: number;
  note: string;
  cheapestDeal: TravelDeal | null;
  valueScore: number;
  previousLowest: number | null;
  priceDropped: boolean;
  dropAmount: number;
}

export interface PriceDropAlert {
  hotelId: number;
  hotelName: string;
  previousPrice: number;
  newPrice: number;
  dropAmount: number;
  deal: TravelDeal;
}

export interface ScanResult {
  scannedAt: string;
  hotelsScanned: number;
  totalFound: number;
  matchingDeals: TravelDeal[];
  targetAlerts: TravelDeal[];
  priceDrops: PriceDropAlert[];
  bestDeal: TravelDeal | null;
  hotelSummaries: HotelSummary[];
}
