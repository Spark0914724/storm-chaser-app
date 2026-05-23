import React from 'react';
import {Text} from 'react-native';

interface WeatherIconProps {
  weatherCode: number;
  isDay?: boolean;
  size?: number;
}

/**
 * WeatherIcon — maps WMO weather codes to emoji icons.
 * Lightweight alternative to a vector icon library.
 */
const WeatherIcon: React.FC<WeatherIconProps> = ({
  weatherCode,
  isDay = true,
  size = 48,
}) => {
  const getIcon = (): string => {
    if (weatherCode === 0) {
      return isDay ? '☀️' : '🌙';
    }
    if (weatherCode <= 2) {
      return isDay ? '🌤' : '🌤';
    }
    if (weatherCode === 3) {return '☁️';}
    if (weatherCode <= 48) {return '🌫';}
    if (weatherCode <= 57) {return '🌦';}
    if (weatherCode <= 67) {return '🌧';}
    if (weatherCode <= 77) {return '❄️';}
    if (weatherCode <= 82) {return '🌧';}
    if (weatherCode <= 86) {return '🌨';}
    if (weatherCode <= 99) {return '⛈';}
    return '🌡';
  };

  return <Text style={{fontSize: size}}>{getIcon()}</Text>;
};

export default WeatherIcon;
