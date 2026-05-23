import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {useStormStore} from '../../store';
import {StormEvent} from '../../models';
import {Colors, Typography} from '../../theme';
import StormEventCard from '../../components/StormEventCard';
import SkeletonLoader from '../../components/SkeletonLoader';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>🌤</Text>
    <Text style={[Typography.h2, styles.emptyTitle]}>No Storms Logged</Text>
    <Text style={[Typography.bodySmall, styles.emptyMessage]}>
      Head to the Document tab to capture your first storm observation.
    </Text>
  </View>
);

// ─── List skeleton ────────────────────────────────────────────────────────────
const ListSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3].map(i => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonLoader width={90} height={110} borderRadius={0} />
        <View style={styles.skeletonContent}>
          <SkeletonLoader width={80} height={18} style={styles.skeletonRow} />
          <SkeletonLoader width="90%" height={16} style={styles.skeletonRow} />
          <SkeletonLoader width={120} height={13} style={styles.skeletonRow} />
          <SkeletonLoader width="70%" height={13} />
        </View>
      </View>
    ))}
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const StormLogScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const {events, status, error, load, remove} = useStormStore();

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Reload when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = useCallback(
    (event: StormEvent) => {
      Alert.alert(
        'Delete Storm Event',
        `Are you sure you want to delete "${event.title}"? This cannot be undone.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => remove(event.id),
          },
        ],
      );
    },
    [remove],
  );

  const handlePress = useCallback(
    (event: StormEvent) => {
      navigation.navigate('StormDetail', {stormId: event.id});
    },
    [navigation],
  );

  const isLoading = status === 'loading' && events.length === 0;
  const isRefreshing = status === 'loading' && events.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={Typography.h1}>📋 Storm Log</Text>
        {events.length > 0 && (
          <Text style={Typography.bodySmall}>
            {events.length} event{events.length !== 1 ? 's' : ''} recorded
          </Text>
        )}
      </View>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <StormEventCard
              event={item}
              onPress={() => handlePress(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            events.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={load}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listEmpty: {
    flex: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {fontSize: 72, marginBottom: 16},
  emptyTitle: {marginBottom: 8, textAlign: 'center'},
  emptyMessage: {textAlign: 'center'},
  // Error banner
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  errorText: {...Typography.bodySmall, color: Colors.danger, flex: 1},
  retryText: {color: Colors.primary, fontWeight: '600', marginLeft: 8},
  // Skeleton
  skeletonContainer: {padding: 16},
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skeletonContent: {flex: 1, padding: 10, justifyContent: 'space-between'},
  skeletonRow: {marginBottom: 8},
});

export default StormLogScreen;
