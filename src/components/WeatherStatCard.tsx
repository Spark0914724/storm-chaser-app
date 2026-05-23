import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Typography} from '../theme';

interface WeatherStatCardProps {
  icon: string;
  label: string;
  value: string;
  unit?: string;
}

/**
 * WeatherStatCard — displays a single meteorological stat (icon + label + value).
 */
const WeatherStatCard: React.FC<WeatherStatCardProps> = ({
  icon,
  label,
  value,
  unit,
}) => (
  <View style={styles.card}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueRow}>
      <Text style={styles.value}>{value}</Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '47%',
    marginBottom: 12,
  },
  icon: {
    fontSize: 26,
    marginBottom: 6,
  },
  label: {
    ...Typography.label,
    marginBottom: 4,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  unit: {
    ...Typography.bodySmall,
    marginLeft: 3,
    marginBottom: 2,
  },
});

export default WeatherStatCard;
