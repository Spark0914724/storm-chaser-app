/**
 * WeatherData — model for current weather and forecast from Open-Meteo API.
 */
export interface CurrentWeather {
  temperature: number;        // °C
  feelsLike: number;          // °C
  windSpeed: number;          // km/h
  windDirection: number;      // degrees
  windGusts: number;          // km/h
  precipitation: number;      // mm
  humidity: number;           // %
  pressure: number;           // hPa
  visibility: number;         // km
  uvIndex: number;
  weatherCode: number;        // WMO code
  description: string;
  isDay: boolean;
  updatedAt: string;          // ISO 8601
}

export interface ForecastDay {
  date: string;               // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;
  maxWindSpeed: number;
  weatherCode: number;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  latitude: number;
  longitude: number;
}
