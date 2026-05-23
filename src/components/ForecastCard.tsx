import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ForecastDay} from '../models';
import {Colors, Typography} from '../theme';
import WeatherIcon from './WeatherIcon';

interface ForecastCardProps {
  day: ForecastDay;
}

const formatDay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
};

/**
 * ForecastCard — single day forecast row.
 */
const ForecastCard: React.FC<ForecastCardProps> = ({day}) => (
  <View style={styles.card}>
    <Text style={styles.day}>{formatDay(day.date)}</Text>
    <WeatherIcon weatherCode={day.weatherCode} size={22} />
    <Text style={styles.desc} numberOfLines={1}>
      {day.description}
    </Text>
    <View style={styles.temps}>
      <Text style={styles.maxTemp}>{Math.round(day.maxTemp)}°</Text>
      <Text style={styles.minTemp}>{Math.round(day.minTemp)}°</Text>
    </View>
    {day.precipitationSum > 0 && (
      <Text style={styles.precip}>💧 {day.precipitationSum.toFixed(1)}mm</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
  },
  day: {
    ...Typography.label,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 80,
  },
  temps: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  maxTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  minTemp: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  precip: {
    ...Typography.caption,
    marginTop: 4,
    color: Colors.info,
  },
});

export default ForecastCard;
