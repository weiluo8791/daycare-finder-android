import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DaycareNearby } from '../types/entities';
import { COLORS } from '../utils/constants';
import SaveButton from './SaveButton';

interface Props {
  daycare: DaycareNearby;
  onPress: () => void;
}

export default function DaycareCard({ daycare, onPress }: Props) {
  const distanceText = daycare.distanceMeters < 1000
    ? `${daycare.distanceMeters}m`
    : `${(daycare.distanceMeters / 1000).toFixed(1)}mi`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {daycare.photos?.[0] ? (
            <Image source={{ uri: daycare.photos[0] }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.emoji}>🏫</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{daycare.name}</Text>
            <Text style={styles.address} numberOfLines={1}>{daycare.address}, {daycare.city}</Text>
            <View style={styles.row}>
              {daycare.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>{daycare.rating.toFixed(1)}</Text>
                </View>
              )}
              <Text style={styles.distance}>{distanceText}</Text>
              {daycare.priceRange && (
                <Text style={styles.price}>{daycare.priceRange}</Text>
              )}
            </View>
          </View>
          <SaveButton daycareId={daycare.id} />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginVertical: 6, elevation: 2 },
  content: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  thumbnail: { width: 72, height: 72, borderRadius: 8 },
  thumbnailPlaceholder: { width: 72, height: 72, borderRadius: 8, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 28 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  address: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  distance: { fontSize: 13, color: COLORS.textLight },
  price: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
