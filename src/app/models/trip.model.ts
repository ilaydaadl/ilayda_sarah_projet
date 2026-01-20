export interface TripData {
  city: string;
  temp: number;
  description: string;
  icon: string;
  condition: 'hot' | 'cold' | 'rainy' | 'default';
}
