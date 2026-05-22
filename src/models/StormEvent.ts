/**
 * StormEvent — core data model for a documented storm observation.
 */
export type StormType =
  | 'tornado'
  | 'hurricane'
  | 'thunderstorm'
  | 'hail'
  | 'blizzard'
  | 'flood'
  | 'other';

export interface WeatherConditions {
  temperature: number;       // °C
  windSpeed: number;         // km/h
  windDirection: number;     // degrees
  precipitation: number;     // mm
  humidity: number;          // %
  pressure: number;          // hPa
  weatherCode: number;       // WMO weather code
  description: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface StormEvent {
  id: string;
  photoUri: string;
  stormType: StormType;
  title: string;
  notes: string;
  location: Coordinates;
  locationName?: string;
  weatherConditions: WeatherConditions;
  capturedAt: string;        // ISO 8601 date string
  createdAt: string;         // ISO 8601 date string
}

/**
 * Partial type used when creating a new storm event before saving.
 */
export type NewStormEvent = Omit<StormEvent, 'id' | 'createdAt'>;
