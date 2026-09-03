export interface SweeperConfig {
  adults: number;
  pricePerPersonMin: number;
  pricePerPersonMax: number;
  minStars: number;
  nightsMin: number;
  nightsMax: number;
  departureCityId: number;
  countryIds: number[];
  dateRangeDays: number;
  notifyOnlyNew: boolean;
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
}

export interface TravelDeal {
  id: string;
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
  source: "tez-tour";
  foundAt: string;
  isNew?: boolean;
}

export interface ScanResult {
  scannedAt: string;
  countriesScanned: number[];
  totalFound: number;
  matchingDeals: TravelDeal[];
  newDeals: TravelDeal[];
  notificationsSent: number;
}
