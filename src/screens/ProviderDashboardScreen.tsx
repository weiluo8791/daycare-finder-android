import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useClaimedDaycares } from '../hooks/useProvider';
import { useFavorites } from '../hooks/useDaycares';
import DaycareCard from '../components/DaycareCard';
import { COLORS } from '../utils/constants';

export default function ProviderDashboardScreen() {
  const navigation = useAppNavigation();
  const { user, logout, isAuthenticated } = useAuth();
  const { data: claimed, isLoading: claimedLoading } = useClaimedDaycares();
  const { data: favorites } = useFavorites();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="business" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Provider Access</Text>
        <Text style={styles.emptyDesc}>Sign in to manage your daycare listings.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('ProviderLogin')} style={styles.btn}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name || user?.email}</Text>
            <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => {
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
          ]);
        }}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          icon={() => <Ionicons name="add-circle" size={18} color="#fff" />}
          onPress={() => navigation.navigate('ClaimDaycare')}
          style={styles.actionBtn}
        >
          Claim a Daycare
        </Button>
      </View>

      {favorites && favorites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Favorites ({favorites.length})</Text>
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DaycareCard daycare={{ ...item, distanceMeters: 0 }} onPress={() => navigation.navigate('DaycareDetail', { id: item.id })} />
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claimed Daycares {claimed ? `(${claimed.length})` : ''}</Text>

        {claimedLoading && <Text style={styles.loading}>Loading...</Text>}

        {!claimedLoading && claimed?.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>You haven't claimed any daycares yet.</Text>
              <Button mode="outlined" onPress={() => navigation.navigate('ClaimDaycare')} style={{ marginTop: 12 }}>
                Claim Your First Daycare
              </Button>
            </Card.Content>
          </Card>
        )}

        {claimed?.map((daycare: any) => (
          <Card key={daycare.id} style={styles.claimedCard}>
            <Card.Content>
              <Text style={styles.claimedName}>{daycare.name}</Text>
              <Text style={styles.claimedMeta}>{daycare.enrichmentStatus} • {daycare.photos?.length || 0} photos</Text>
              <View style={styles.claimedActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => navigation.navigate('EditListing', { id: daycare.id })}
                >
                  Edit
                </Button>
                <Button
                  mode="outlined"
                  compact
                  textColor={COLORS.danger}
                  onPress={() => {
                    Alert.alert('Unclaim Daycare', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Unclaim', style: 'destructive', onPress: () => { /* mutation */ } },
                    ]);
                  }}
                >
                  Unclaim
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  btn: { borderRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.surface },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  role: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  actions: { padding: 16 },
  actionBtn: { borderRadius: 10 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  loading: { color: COLORS.textLight, textAlign: 'center', marginVertical: 20 },
  emptyCard: { borderRadius: 12 },
  emptyText: { color: COLORS.textLight, textAlign: 'center' },
  claimedCard: { marginBottom: 12, borderRadius: 12 },
  claimedName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  claimedMeta: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  claimedActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
