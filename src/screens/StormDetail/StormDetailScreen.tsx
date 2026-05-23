import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {StormEventRepository} from '../../services/database';
import {StormEvent} from '../../models';
import {Colors, Typography} from '../../theme';
import WeatherIcon from '../../components/WeatherIcon';

type RouteProps = RouteProp<RootStackParamList, 'StormDetail'>;
type NavProp = NativeStackNavigationProp<RootStackParamList>;

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

// ─── Detail row ───────────────────────────────────────────────────────────────
const DetailRow: React.FC<{icon: string; label: string; value: string}> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailIcon}>{icon}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const StormDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const {stormId} = route.params;

  const [event, setEvent] = useState<StormEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const found = await StormEventRepository.findById(stormId);
        setEvent(found);
      } catch (err) {
        console.error('[StormDetailScreen] Load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [stormId]);

  const handleDelete = () => {
    if (!event) {return;}
    Alert.alert(
      'Delete Storm Event',
      `Delete "${event.title}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StormEventRepository.delete(event.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          color={Colors.primary}
          size="large"
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundIcon}>🌤</Text>
          <Text style={Typography.h2}>Event Not Found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = STORM_TYPE_COLORS[event.stormType] ?? Colors.other;
  const typeIcon = STORM_TYPE_ICONS[event.stormType] ?? '🌩';
  const w = event.weatherConditions;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Full-width photo */}
        <Image source={{uri: event.photoUri}} style={styles.photo} />

        {/* Type badge overlay */}
        <View style={[styles.typeBadge, {backgroundColor: typeColor}]}>
          <Text style={styles.typeBadgeText}>
            {typeIcon} {event.stormType.charAt(0).toUpperCase() + event.stormType.slice(1)}
          </Text>
        </View>

        <View style={styles.content}>
          {/* Title & date */}
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>
            📅{' '}
            {new Date(event.capturedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          {/* Notes */}
          {event.notes ? (
            <View style={styles.notesCard}>
              <Text style={[Typography.label, styles.sectionTitle]}>Notes</Text>
              <Text style={styles.notes}>{event.notes}</Text>
            </View>
          ) : null}

          {/* Location */}
          <View style={styles.section}>
            <Text style={[Typography.label, styles.sectionTitle]}>Location</Text>
            <DetailRow
              icon="📍"
              label="Coordinates"
              value={`${event.location.latitude.toFixed(5)}, ${event.location.longitude.toFixed(5)}`}
            />
            {event.location.altitude !== undefined && (
              <DetailRow
                icon="⛰"
                label="Altitude"
                value={`${Math.round(event.location.altitude)} m`}
              />
            )}
            {event.locationName && (
              <DetailRow icon="🏙" label="Location" value={event.locationName} />
            )}
          </View>

          {/* Weather conditions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.label, styles.sectionTitle]}>
                Weather Conditions
              </Text>
              <WeatherIcon weatherCode={w.weatherCode} size={24} />
            </View>
            <DetailRow icon="🌡" label="Temperature" value={`${Math.round(w.temperature)}°C`} />
            <DetailRow icon="🤔" label="Feels Like" value={`${Math.round(w.feelsLike)}°C`} />
            <DetailRow icon="💨" label="Wind Speed" value={`${Math.round(w.windSpeed)} km/h`} />
            <DetailRow icon="🌬" label="Wind Gusts" value={`${Math.round(w.windGusts)} km/h`} />
            <DetailRow icon="🧭" label="Wind Direction" value={`${Math.round(w.windDirection)}°`} />
            <DetailRow icon="🌧" label="Precipitation" value={`${w.precipitation.toFixed(1)} mm`} />
            <DetailRow icon="💧" label="Humidity" value={`${Math.round(w.humidity)}%`} />
            <DetailRow icon="🔵" label="Pressure" value={`${Math.round(w.pressure)} hPa`} />
            <DetailRow icon="👁" label="Visibility" value={`${w.visibility.toFixed(1)} km`} />
            <DetailRow icon="☀️" label="UV Index" value={w.uvIndex.toFixed(1)} />
            <DetailRow icon="🌤" label="Condition" value={w.description} />
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete this storm event">
            <Text style={styles.deleteButtonText}>🗑 Delete Event</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  loader: {flex: 1},
  photo: {width: '100%', height: 280, resizeMode: 'cover'},
  typeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {color: '#fff', fontWeight: '700', fontSize: 13},
  content: {padding: 16},
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  date: {...Typography.bodySmall, marginBottom: 16},
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notes: {...Typography.body, lineHeight: 22},
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {marginBottom: 10},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {fontSize: 15, width: 26},
  detailLabel: {...Typography.bodySmall, width: 110, color: Colors.textSecondary},
  detailValue: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {color: Colors.danger, fontWeight: '700', fontSize: 15},
  // Not found
  notFound: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  notFoundIcon: {fontSize: 64, marginBottom: 16},
  backButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {color: '#fff', fontWeight: '700'},
  bottomPadding: {height: 32},
});

export default StormDetailScreen;
