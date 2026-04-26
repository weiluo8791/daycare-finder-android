import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from 'react-native-paper';
import { useSearchEEC, useClaimDaycare } from '../hooks/useProvider';
import { COLORS } from '../utils/constants';

export default function ClaimDaycareScreen() {
  const navigation = useAppNavigation();
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchEEC(query);
  const claimMutation = useClaimDaycare();

  const handleClaim = async (daycareId: string) => {
    try {
      await claimMutation.mutateAsync(daycareId);
      Alert.alert('Success', 'Claim request submitted for admin approval.', [
        { text: 'OK', onPress: () => navigation.navigate('ProviderDashboard') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit claim');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.input}
          placeholder="Search by name, address, city, or phone"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {isLoading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}

      <FlatList
        data={results || []}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.address}, {item.city}</Text>
              {item.phone && <Text style={styles.meta}>📞 {item.phone}</Text>}
              <View style={styles.row}>
                {item.programType && <Text style={styles.tag}>{item.programType}</Text>}
                {item.capacity && <Text style={styles.tag}>Capacity: {item.capacity}</Text>}
              </View>
              {item.claimed ? (
                <Button mode="outlined" disabled compact style={styles.claimBtn}>Already Claimed</Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => handleClaim(item.id)}
                  loading={claimMutation.isPending}
                  compact
                  style={styles.claimBtn}
                >
                  Claim
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          query.length >= 2 && !isLoading ? (
            <Text style={styles.empty}>No results found. Try a different search.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.text },
  loader: { marginVertical: 20 },
  card: { marginHorizontal: 12, marginVertical: 6, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 10 },
  tag: { fontSize: 12, color: COLORS.primary, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontWeight: '600' },
  claimBtn: { borderRadius: 8, alignSelf: 'flex-start' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
});
