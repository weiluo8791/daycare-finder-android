import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useRegisterProvider } from '../hooks/useProvider';
import { COLORS } from '../utils/constants';

export default function ProviderRegisterScreen() {
  const navigation = useAppNavigation();
  const register = useRegisterProvider();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register.mutateAsync({ email, password, name });
      Alert.alert('Success', 'Account created! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('ProviderLogin') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add" size={48} color={COLORS.primary} />
        <Text style={styles.title}>Register as Provider</Text>
        <Text style={styles.subtitle}>Create an account to list and manage your daycare</Text>
      </View>

      <View style={styles.form}>
        <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          mode="outlined"
          style={styles.input}
        />

        <Button mode="contained" onPress={handleRegister} loading={register.isPending} style={styles.btn}>
          Create Account
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginTop: 6, textAlign: 'center' },
  form: { gap: 12 },
  input: { backgroundColor: COLORS.surface },
  btn: { borderRadius: 10, marginTop: 8 },
});
