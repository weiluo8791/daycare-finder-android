import React, { useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import * as Location from 'expo-location';
import SearchControls from '../components/SearchControls';
import DaycareCard from '../components/DaycareCard';
import { useSearchDaycares } from '../hooks/useDaycares';
import { SearchParams, DaycareNearby } from '../types/entities';
import { COLORS } from '../utils/constants';
import api from '../api/client';

export default function SearchScreen() {
  const navigation = useAppNavigation();
  const [params, setParams] = useState<SearchParams>({ limit: 20 });
  const { data, isLoading, error } = useSearchDaycares(params);

  const handleSearch = async (address: string, name: string) => {
    if (!address && !name) return;

    const newParams: SearchParams = { name: name || undefined, limit: 20 };

    if (address) {
      try {
        const response = await api.get('/api/geocode', { params: { address } });
        const { lat, lng } = response.data;
        newParams.lat = lat;
        newParams.lng = lng;
        newParams.radius = 10000;
      } catch {
        // If geocoding fails, search by name only
      }
    }

    setParams(newParams);
  };

  const handleUseLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    setParams({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      radius: 10000,
      limit: 20,
    });
  };

  const loadMore = () => {
    if (data?.hasMore && data.nextCursor) {
      setParams((prev) => ({ ...prev, cursor: data.nextCursor }));
    }
  };

  const renderItem = useCallback(({ item }: { item: DaycareNearby }) => (
    <DaycareCard
      daycare={item}
      onPress={() => navigation.navigate('DaycareDetail', { id: item.id })}
    />
  ), [navigation]);

  return (
    <View style={styles.container}>
      <SearchControls onSearch={handleSearch} onUseLocation={handleUseLocation} isLoading={isLoading} />

      <View style={styles.toggleRow}>
        <Text style={styles.resultCount}>{data?.total || 0} results</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Map', { daycares: data?.daycares || [], lat: params.lat, lng: params.lng })}>
          <Text style={styles.mapLink}>View Map 🗺️</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !data && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}

      {error && <Text style={styles.error}>Failed to load daycares. Try again.</Text>}

      <FlatList
        data={data?.daycares || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading && data ? <ActivityIndicator style={styles.loader} /> : null}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.surface },
  resultCount: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  mapLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  loader: { marginVertical: 20 },
  error: { color: COLORS.danger, textAlign: 'center', margin: 20 },
  list: { paddingBottom: 20 },
});
