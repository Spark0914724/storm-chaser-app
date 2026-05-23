import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {StormEvent} from '../models';
import {Colors, Typography} from '../theme';

const STORM_TYPE_COLORS: Record<string, string> = {
  tornado: Colors.tornado,
  hurricane: Colors.hurricane,
  thunderstorm: Colors.thunderstorm,
  hail: Colors.hail,
  blizzard: Colors.blizzard,
  flood: Colors.flood,
  other: Colors.other,
};

const STORM_TYPE_ICONS: Record<string, string> = {
  tornado: '🌪',
  hurricane: '🌀',
  thunderstorm: '⛈',
  hail: '🧊',
  blizzard: '❄️',
  flood: '🌊',
  other: '🌩',
};

interface StormEventCardProps {
  event: StormEvent;
  onPress: () => void;
  onDelete: () => void;
}

/**
 * StormEventCard — list item showing photo thumbnail, storm type badge,
 * title, location, date, and key weather stats.
 */
const StormEventCard: React.FC<StormEventCardProps> = ({
  event,
  onPress,
  onDelete,
}) => {
  const typeColor = STORM_TYPE_COLORS[event.stormType] ?? Colors.other;
  const typeIcon = STORM_TYPE_ICONS[event.stormType] ?? '🌩';
  const date = new Date(event.capturedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Storm event: ${event.title}`}>

      {/* Thumbnail */}
      <Image source={{uri: event.photoUri}} style={styles.thumbnail} />

      {/* Content */}
      <View style={styles.content}>
        {/* Type badge */}
        <View style={[styles.badge, {backgroundColor: typeColor + '33', borderColor: typeColor}]}>
          <Text style={styles.badgeIcon}>{typeIcon}</Text>
          <Text style={[styles.badgeText, {color: typeColor}]}>
            {event.stormType.charAt(0).toUpperCase() + event.stormType.slice(1)}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>

        <Text style={styles.date}>{date}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            🌡 {Math.round(event.weatherConditions.temperature)}°C
          </Text>
          <Text style={styles.stat}>
            💨 {Math.round(event.weatherConditions.windSpeed)} km/h
          </Text>
          <Text style={styles.stat}>
            📍 {event.location.latitude.toFixed(2)}, {event.location.longitude.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Delete button */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityRole="button"
        accessibilityLabel="Delete storm event">
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    width: 90,
    height: 110,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeIcon: {fontSize: 11, marginRight: 4},
  badgeText: {fontSize: 11, fontWeight: '700'},
  title: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    ...Typography.caption,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stat: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  deleteIcon: {fontSize: 18},
});

export default StormEventCard;
