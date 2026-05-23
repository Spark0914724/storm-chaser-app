import axios from 'axios';
import {WeatherData, CurrentWeather, ForecastDay} from '../../models/WeatherData';
import {getWeatherDescription} from '../../utils/weatherCodeMap';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/** Shape of the raw Open-Meteo API response */
interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    precipitation: number;
    relative_humidity_2m: number;
    surface_pressure: number;
    visibility: number;
    uv_index: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
  };
}

/**
 * WeatherService — fetches current weather and 7-day forecast
 * from the Open-Meteo API (free, no API key required).
 */
export const WeatherService = {
  /**
   * Fetch weather data for the given coordinates.
   * Throws an error if the request fails.
   */
  async fetchWeather(
    latitude: number,
    longitude: number,
  ): Promise<WeatherData> {
    const response = await axios.get<OpenMeteoResponse>(BASE_URL, {
      params: {
        latitude,
        longitude,
        current: [
          'temperature_2m',
          'apparent_temperature',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
          'precipitation',
          'relative_humidity_2m',
          'surface_pressure',
          'visibility',
          'uv_index',
          'weather_code',
          'is_day',
        ].join(','),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'wind_speed_10m_max',
          'weather_code',
        ].join(','),
        forecast_days: 7,
        timezone: 'auto',
      },
      timeout: 10000,
    });

    return mapResponseToWeatherData(response.data);
  },
};

/** Map raw API response to our WeatherData model */
const mapResponseToWeatherData = (raw: OpenMeteoResponse): WeatherData => {
  const c = raw.current;

  const current: CurrentWeather = {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGusts: c.wind_gusts_10m,
    precipitation: c.precipitation,
    humidity: c.relative_humidity_2m,
    pressure: c.surface_pressure,
    visibility: c.visibility / 1000, // convert m → km
    uvIndex: c.uv_index,
    weatherCode: c.weather_code,
    description: getWeatherDescription(c.weather_code),
    isDay: c.is_day === 1,
    updatedAt: new Date(c.time).toISOString(),
  };

  const forecast: ForecastDay[] = raw.daily.time.map((date, i) => ({
    date,
    maxTemp: raw.daily.temperature_2m_max[i],
    minTemp: raw.daily.temperature_2m_min[i],
    precipitationSum: raw.daily.precipitation_sum[i],
    maxWindSpeed: raw.daily.wind_speed_10m_max[i],
    weatherCode: raw.daily.weather_code[i],
    description: getWeatherDescription(raw.daily.weather_code[i]),
  }));

  return {
    current,
    forecast,
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
};
