import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { COLORS } from '../utils/constants';

interface Props {
  onSearch: (address: string, name: string) => void;
  onUseLocation: () => void;
  isLoading?: boolean;
}

export default function SearchControls({ onSearch, onUseLocation, isLoading }: Props) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="location-outline" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.input}
          placeholder="Enter address or city"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputRow}>
        <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.input}
          placeholder="Daycare name (optional)"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={() => onSearch(address, name)} loading={isLoading} style={styles.searchBtn}>
          Search
        </Button>
        <TouchableOpacity style={styles.locationBtn} onPress={onUseLocation}>
          <Ionicons name="locate" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.surface, gap: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.text },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBtn: { flex: 1, borderRadius: 10 },
  locationBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
});
