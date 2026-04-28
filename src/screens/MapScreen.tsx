import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { DaycareNearby } from '../types/entities';
import { COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { daycares, lat, lng } = route.params as { daycares: DaycareNearby[]; lat?: number; lng?: number };

  const initialRegion: Region = {
    latitude: lat || 42.3601,
    longitude: lng || -71.0589,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {daycares.map((daycare) => (
          <Marker
            key={daycare.id}
            coordinate={{ latitude: daycare.lat, longitude: daycare.lng }}
            title={daycare.name}
            description={daycare.address}
            onCalloutPress={() => navigation.navigate('DaycareDetail', { id: daycare.id })}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} testID="back-button">
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.countBadge}>
        <Text style={styles.countText}>{daycares.length} daycares</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: COLORS.surface, padding: 10, borderRadius: 30, elevation: 4 },
  countBadge: { position: 'absolute', top: 50, right: 16, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 4 },
  countText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
