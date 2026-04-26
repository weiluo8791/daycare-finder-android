import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useAppNavigation } from '../hooks/useAppNavigation';

export default function LandingScreen() {
  const navigation = useAppNavigation();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🏫</Text>
        <Text style={styles.title}>Find the perfect daycare</Text>
        <Text style={styles.subtitle}>Browse Massachusetts licensed daycares near you. Verified providers, real reviews, and all the details you need.</Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="search" size={18} color="#fff" />}
          onPress={() => navigation.navigate('Search')}
          style={styles.primaryBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Browse Daycares Near Me
        </Button>

        <Button
          mode="outlined"
          icon={() => <Ionicons name="business" size={18} color={COLORS.primary} />}
          onPress={() => navigation.navigate('ProviderDashboard')}
          style={styles.secondaryBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Provider Dashboard
        </Button>
      </View>

      <View style={styles.features}>
        {[
          { icon: 'location-outline', title: 'Nearby Search', desc: 'Find daycares within your radius' },
          { icon: 'shield-checkmark-outline', title: 'Verified Listings', desc: 'All programs are state-licensed' },
          { icon: 'star-outline', title: 'Reviews & Ratings', desc: 'Real parent feedback and ratings' },
        ].map((f, i) => (
          <View key={i} style={styles.feature}>
            <Ionicons name={f.icon as any} size={28} color={COLORS.primary} />
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background },
  hero: { padding: 32, alignItems: 'center', paddingTop: 60 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  actions: { paddingHorizontal: 24, gap: 12, marginTop: 8 },
  primaryBtn: { borderRadius: 12, backgroundColor: COLORS.primary },
  secondaryBtn: { borderRadius: 12, borderColor: COLORS.primary },
  features: { flexDirection: 'row', justifyContent: 'space-around', padding: 24, marginTop: 16 },
  feature: { alignItems: 'center', flex: 1, padding: 8 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  featureDesc: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 4 },
});
