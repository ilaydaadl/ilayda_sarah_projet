export interface TripData {
  city: string;
  temp: number;
  description: string;
  icon: string;
  condition: 'hot' | 'cold' | 'rainy' | 'default';
}

export interface Trip {
  latitude: number;
  longitude: number;
  city?: string;

  narration?: string;

  days: {
    day: number;
    activities: string[];
  }[];
}
