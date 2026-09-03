export interface WatchlistHotel {
  hotelId: number;
  name: string;
  url: string;
  resort: string;
  countryId: number;
  stars: number;
  qualityScore: number;
  note: string;
}

export interface SweeperConfig {
  adults: number;
  pricePerPersonMin: number;
  pricePerPersonMax: number;
  minStars: number;
  nightsMin: number;
  nightsMax: number;
  departureCityId: number;
  dateRangeDays: number;
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
  qualityScore: number;
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
  qualityScore: number;
  note: string;
  cheapestDeal: TravelDeal | null;
  valueScore: number;
}

export interface ScanResult {
  scannedAt: string;
  hotelsScanned: number;
  totalFound: number;
  matchingDeals: TravelDeal[];
  targetAlerts: TravelDeal[];
  bestDeal: TravelDeal | null;
  hotelSummaries: HotelSummary[];
}
