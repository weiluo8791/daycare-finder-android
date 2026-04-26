import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from 'react-native-paper';
import { useDaycare } from '../hooks/useDaycares';
import { useAuth } from '../context/AuthContext';
import SaveButton from '../components/SaveButton';
import { COLORS } from '../utils/constants';

export default function DaycareDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { data: daycare, isLoading } = useDaycare(id);
  const { user } = useAuth();

  const isOwner = user?.role === 'provider' && daycare?.claimedByProviderId === user?.id;
  const isAdmin = user?.role === 'admin';

  const openMap = () => {
    if (daycare) {
      const url = `https://www.google.com/maps/search/?api=1&query=${daycare.lat},${daycare.lng}`;
      Linking.openURL(url);
    }
  };

  const callPhone = () => {
    if (daycare?.phone) Linking.openURL(`tel:${daycare.phone}`);
  };

  const sendEmail = () => {
    if (daycare?.email) Linking.openURL(`mailto:${daycare.email}`);
  };

  const openWebsite = () => {
    if (daycare?.website) Linking.openURL(daycare.website);
  };

  if (isLoading || !daycare) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh" size={32} color={COLORS.textLight} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {daycare.photos?.[0] ? (
        <Image source={{ uri: daycare.photos[0] }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroEmoji}>🏫</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{daycare.name}</Text>
            {daycare.claimed && (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
                <Text style={styles.badgeText}>Verified Provider</Text>
              </View>
            )}
          </View>
          <SaveButton daycareId={daycare.id} />
        </View>

        <Text style={styles.address}>{daycare.address}, {daycare.city}{daycare.state ? `, ${daycare.state}` : ''} {daycare.zipCode || ''}</Text>

        {daycare.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#f59e0b" />
            <Text style={styles.rating}>{daycare.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({daycare.reviewSnippets?.length || 0} reviews)</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {daycare.phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={callPhone}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
        )}
        {daycare.email && (
          <TouchableOpacity style={styles.actionBtn} onPress={sendEmail}>
            <Ionicons name="mail" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        )}
        {daycare.website && (
          <TouchableOpacity style={styles.actionBtn} onPress={openWebsite}>
            <Ionicons name="globe" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {daycare.description && (
        <Card style={styles.section}>
          <Card.Title title="About" titleStyle={styles.sectionTitle} />
          <Card.Content>
            <Text style={styles.description}>{daycare.description}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.section}>
        <Card.Title title="Key Information" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.infoGrid}>
            {daycare.licenseNumber && <InfoRow label="License" value={daycare.licenseNumber} />}
            {daycare.capacity && <InfoRow label="Capacity" value={`${daycare.capacity} children`} />}
            {daycare.programType && <InfoRow label="Program Type" value={daycare.programType} />}
            {daycare.licensedStatus && <InfoRow label="Status" value={daycare.licensedStatus} />}
            {daycare.priceRange && <InfoRow label="Price Range" value={daycare.priceRange} />}
          </View>
        </Card.Content>
      </Card>

      {daycare.hours && Object.keys(daycare.hours).length > 0 && (
        <Card style={styles.section}>
          <Card.Title title="Operating Hours" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {Object.entries(daycare.hours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{day}</Text>
                <Text style={styles.hoursValue}>{hours}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {daycare.reviewSnippets?.length > 0 && (
        <Card style={styles.section}>
          <Card.Title title="Reviews" titleStyle={styles.sectionTitle} />
          <Card.Content>
            {daycare.reviewSnippets.map((review, i) => (
              <Text key={i} style={styles.review}>"{review}"</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.section}>
        <Card.Title title="Location" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <TouchableOpacity onPress={openMap}>
            <Text style={styles.mapLink}>📍 Open in Google Maps</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {(isOwner || isAdmin) && (
        <Button
          mode="contained"
          icon={() => <Ionicons name="create" size={18} color="#fff" />}
          onPress={() => { /* navigation.navigate('EditListing', { id }) */ }}
          style={[styles.section, { borderRadius: 10 }]}
        >
          Edit Listing
        </Button>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textLight },
  heroImage: { width: '100%', height: 240 },
  heroPlaceholder: { width: '100%', height: 240, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  heroEmoji: { fontSize: 80 },
  header: { padding: 16, backgroundColor: COLORS.surface },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  badgeText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  address: { fontSize: 14, color: COLORS.textLight, marginTop: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  rating: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  reviewCount: { fontSize: 14, color: COLORS.textLight },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  section: { margin: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  infoGrid: { gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 14, color: COLORS.textLight },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.border },
  hoursDay: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  hoursValue: { fontSize: 14, color: COLORS.textLight },
  review: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', paddingVertical: 8, borderBottomWidth: 1, borderColor: COLORS.border },
  mapLink: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
});
