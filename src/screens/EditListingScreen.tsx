import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { TextInput, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDaycare } from '../hooks/useDaycares';
import { useUpdateDaycare, useUploadPhoto } from '../hooks/useProvider';
import { COLORS } from '../utils/constants';

export default function EditListingScreen() {
  const route = useRoute();
  const navigation = useAppNavigation();
  const { id } = route.params as { id: string };
  const { data: daycare, isLoading } = useDaycare(id);
  const update = useUpdateDaycare();
  const upload = useUploadPhoto();

  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    if (daycare) {
      setDescription(daycare.description || '');
      setEmail(daycare.email || '');
      setWebsite(daycare.website || '');
      setPriceRange(daycare.priceRange || '');
    }
  }, [daycare]);

  const handleSave = async () => {
    try {
      await update.mutateAsync({ id, data: { description, email, website, priceRange } });
      Alert.alert('Success', 'Listing updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await upload.mutateAsync({ daycareId: id, uri: result.assets[0].uri });
        Alert.alert('Success', 'Photo uploaded');
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.error || 'Failed to upload');
      }
    }
  };

  if (isLoading || !daycare) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh" size={32} color={COLORS.textLight} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit {daycare.name}</Text>

      <Card style={styles.section}>
        <Card.Content style={{ gap: 12 }}>
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            label="Website"
            value={website}
            onChangeText={setWebsite}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Price Range"
            value={priceRange}
            onChangeText={setPriceRange}
            mode="outlined"
            placeholder="e.g. $$"
            style={styles.input}
          />
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyLabel}>Phone (read-only)</Text>
            <Text style={styles.readOnlyValue}>{daycare.phone || 'Not available'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Photos" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.photosRow}>
            {daycare.photos?.map((photo, i) => (
              <Image key={i} source={{ uri: photo }} style={styles.photoThumb} />
            ))}
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={update.isPending}
        style={[styles.section, styles.saveBtn]}
      >
        Save Changes
      </Button>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, padding: 16 },
  section: { margin: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  input: { backgroundColor: COLORS.surface },
  readOnly: { padding: 12, backgroundColor: COLORS.border, borderRadius: 8 },
  readOnlyLabel: { fontSize: 12, color: COLORS.textLight },
  readOnlyValue: { fontSize: 16, color: COLORS.text, marginTop: 4 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoThumb: { width: 80, height: 80, borderRadius: 8 },
  addPhotoBtn: { width: 80, height: 80, borderRadius: 8, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addPhotoText: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  saveBtn: { borderRadius: 10 },
});
