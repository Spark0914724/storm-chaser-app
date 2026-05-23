import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useLocation} from '../../hooks/useLocation';
import {useWeather} from '../../hooks/useWeather';
import {Colors, Typography} from '../../theme';
import SkeletonLoader from '../../components/SkeletonLoader';
import WeatherIcon from '../../components/WeatherIcon';
import WeatherStatCard from '../../components/WeatherStatCard';
import ForecastCard from '../../components/ForecastCard';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const WeatherSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <SkeletonLoader width={120} height={120} borderRadius={60} style={styles.skeletonIcon} />
    <SkeletonLoader width={180} height={48} style={styles.skeletonTemp} />
    <SkeletonLoader width={140} height={20} style={styles.skeletonDesc} />
    <View style={styles.statsGrid}>
      {[1, 2, 3, 4].map(i => (
        <SkeletonLoader key={i} width="47%" height={90} style={styles.skeletonCard} />
      ))}
    </View>
  </View>
);

// ─── Not Found ───────────────────────────────────────────────────────────────
const NotFoundView: React.FC<{message: string; onRetry: () => void}> = ({
  message,
  onRetry,
}) => (
  <View style={styles.centerContainer}>
    <Text style={styles.notFoundIcon}>🌩</Text>
    <Text style={[Typography.h2, styles.notFoundTitle]}>Weather Not Found</Text>
    <Text style={[Typography.bodySmall, styles.notFoundMessage]}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
const WeatherScreen: React.FC = () => {
  const {coordinates, status: locationStatus, error: locationError, refresh: refreshLocation} = useLocation();
  const {data: weather, status: weatherStatus, error: weatherError, refresh: refreshWeather} = useWeather(coordinates);

  const isLoading =
    locationStatus === 'requesting' ||
    locationStatus === 'idle' ||
    weatherStatus === 'loading';

  const hasError =
    locationStatus === 'denied' ||
    locationStatus === 'unavailable' ||
    locationStatus === 'error' ||
    weatherStatus === 'error';

  const errorMessage =
    locationError ?? weatherError ?? 'Unable to load weather data.';

  const handleRefresh = () => {
    refreshLocation();
    refreshWeather();
  };

  const isRefreshing = weatherStatus === 'loading' && weather !== null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={Typography.h1}>⛈ Storm Chaser</Text>
          <Text style={Typography.bodySmall}>Fetching weather…</Text>
        </View>
        <WeatherSkeleton />
      </SafeAreaView>
    );
  }

  // ── Error / Not Found ─────────────────────────────────────────────────────
  if (hasError && !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={Typography.h1}>⛈ Storm Chaser</Text>
        </View>
        <NotFoundView message={errorMessage} onRetry={handleRefresh} />
      </SafeAreaView>
    );
  }

  // ── Weather data ──────────────────────────────────────────────────────────
  const current = weather?.current;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }>

        {/* Header */}
        <View style={styles.header}>
          <Text style={Typography.h1}>⛈ Storm Chaser</Text>
          {current && (
            <Text style={Typography.bodySmall}>
              Updated {new Date(current.updatedAt).toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Current weather hero */}
        {current && (
          <View style={styles.heroCard}>
            <WeatherIcon
              weatherCode={current.weatherCode}
              isDay={current.isDay}
              size={72}
            />
            <Text style={styles.temperature}>
              {Math.round(current.temperature)}°C
            </Text>
            <Text style={styles.description}>{current.description}</Text>
            <Text style={styles.feelsLike}>
              Feels like {Math.round(current.feelsLike)}°C
            </Text>
          </View>
        )}

        {/* Stats grid */}
        {current && (
          <>
            <Text style={[Typography.label, styles.sectionTitle]}>
              Conditions
            </Text>
            <View style={styles.statsGrid}>
              <WeatherStatCard
                icon="💨"
                label="Wind Speed"
                value={Math.round(current.windSpeed).toString()}
                unit="km/h"
              />
              <WeatherStatCard
                icon="🌬"
                label="Wind Gusts"
                value={Math.round(current.windGusts).toString()}
                unit="km/h"
              />
              <WeatherStatCard
                icon="💧"
                label="Humidity"
                value={Math.round(current.humidity).toString()}
                unit="%"
              />
              <WeatherStatCard
                icon="🌧"
                label="Precipitation"
                value={current.precipitation.toFixed(1)}
                unit="mm"
              />
              <WeatherStatCard
                icon="🔵"
                label="Pressure"
                value={Math.round(current.pressure).toString()}
                unit="hPa"
              />
              <WeatherStatCard
                icon="👁"
                label="Visibility"
                value={current.visibility.toFixed(1)}
                unit="km"
              />
              <WeatherStatCard
                icon="🧭"
                label="Wind Dir"
                value={`${Math.round(current.windDirection)}°`}
              />
              <WeatherStatCard
                icon="☀️"
                label="UV Index"
                value={current.uvIndex.toFixed(1)}
              />
            </View>
          </>
        )}

        {/* 7-day forecast */}
        {weather && weather.forecast.length > 0 && (
          <>
            <Text style={[Typography.label, styles.sectionTitle]}>
              7-Day Forecast
            </Text>
            <FlatList
              data={weather.forecast}
              keyExtractor={item => item.date}
              renderItem={({item}) => <ForecastCard day={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forecastList}
              scrollEnabled
            />
          </>
        )}

        {/* Stale data warning */}
        {hasError && weather && (
          <View style={styles.staleWarning}>
            <Text style={styles.staleText}>
              ⚠️ Showing cached data — {errorMessage}
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.retryInline}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  description: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  feelsLike: {
    ...Typography.bodySmall,
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  forecastList: {
    paddingBottom: 8,
  },
  staleWarning: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  staleText: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.warning,
  },
  retryInline: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Skeleton
  skeletonContainer: {
    padding: 16,
    alignItems: 'center',
  },
  skeletonIcon: {
    marginBottom: 16,
  },
  skeletonTemp: {
    marginBottom: 12,
  },
  skeletonDesc: {
    marginBottom: 24,
  },
  skeletonCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  // Not found
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  notFoundIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  notFoundTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  notFoundMessage: {
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  bottomPadding: {
    height: 32,
  },
});

export default WeatherScreen;
