import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import DaycareCard from '../components/DaycareCard';
import { useFavorites } from '../hooks/useDaycares';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function FavoritesScreen() {
  const navigation = useAppNavigation();
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading } = useFavorites();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Sign in to save favorites</Text>
        <Button mode="contained" onPress={() => navigation.navigate('ProviderLogin')} style={styles.btn}>
          Sign In
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh" size={32} color={COLORS.textLight} />
      </View>
    );
  }

  if (!favorites?.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyDesc}>Browse daycares and tap the heart to save them here.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Search')} style={styles.btn}>
          Browse Daycares
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Favorites ({favorites.length})</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DaycareCard
            daycare={{ ...item, distanceMeters: 0 }}
            onPress={() => navigation.navigate('DaycareDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  btn: { borderRadius: 10, marginTop: 8 },
  header: { fontSize: 20, fontWeight: '800', color: COLORS.text, padding: 16 },
  list: { paddingBottom: 20 },
});
