import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../utils/constants';

export default function AdminDashboardScreen() {
  const navigation = useAppNavigation();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'claims' | 'users'>('claims');
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['admin', 'claims'],
    queryFn: async () => {
      const response = await api.get('/api/admin/claims');
      return response.data;
    },
    enabled: isAdmin,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get('/api/admin/users');
      return response.data;
    },
    enabled: isAdmin && tab === 'users',
  });

  const updateClaim = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      await api.patch(`/api/admin/claims/${id}`, { action });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'claims'] }),
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/api/admin/users/${id}`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="shield" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Admin Access Required</Text>
        <Button mode="contained" onPress={() => navigation.navigate('ProviderLogin')} style={styles.btn}>
          Sign In
        </Button>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={48} color={COLORS.danger} />
        <Text style={styles.emptyTitle}>Access Denied</Text>
        <Text style={styles.emptyDesc}>You don't have admin privileges.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'claims' && styles.tabActive]}
          onPress={() => setTab('claims')}
        >
          <Text style={[styles.tabText, tab === 'claims' && styles.tabTextActive]}>Claims</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'users' && styles.tabActive]}
          onPress={() => setTab('users')}
        >
          <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
      </View>

      {tab === 'claims' && (
        <>
          {claimsLoading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}
          <FlatList
            data={claims?.filter((c: any) => c.status === 'pending_admin') || []}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.claimTitle}>{item.daycare?.name || 'Unknown Daycare'}</Text>
                  <Text style={styles.claimMeta}>Provider: {item.provider?.name || item.provider?.email}</Text>
                  <Text style={styles.claimMeta}>Submitted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                  <View style={styles.claimActions}>
                    <Button
                      mode="contained"
                      buttonColor={COLORS.success}
                      compact
                      onPress={() => updateClaim.mutate({ id: item.id, action: 'approve' })}
                      loading={updateClaim.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      mode="outlined"
                      textColor={COLORS.danger}
                      compact
                      onPress={() => updateClaim.mutate({ id: item.id, action: 'reject' })}
                    >
                      Reject
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No pending claims.</Text>}
          />
        </>
      )}

      {tab === 'users' && (
        <>
          {usersLoading && <ActivityIndicator style={styles.loader} color={COLORS.primary} />}
          <FlatList
            data={users || []}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }: { item: any }) => (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.userName}>{item.name || item.email}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <View style={styles.roleRow}>
                    {['parent', 'provider', 'admin'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[styles.roleBadge, item.role === role && styles.roleBadgeActive]}
                        onPress={() => {
                          const adminCount = users?.filter((u: any) => u.role === 'admin').length || 0;
                          if (item.role === 'admin' && role !== 'admin' && adminCount <= 1) {
                            Alert.alert('Error', 'Cannot remove the last admin.');
                            return;
                          }
                          updateUserRole.mutate({ id: item.id, role });
                        }}
                      >
                        <Text style={[styles.roleText, item.role === role && styles.roleTextActive]}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
  btn: { borderRadius: 10, marginTop: 16 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.primary },
  loader: { marginVertical: 20 },
  card: { marginHorizontal: 12, marginVertical: 6, borderRadius: 12 },
  claimTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  claimMeta: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  claimActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.border },
  roleBadgeActive: { backgroundColor: COLORS.primary },
  roleText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
});
