import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function ProviderLoginScreen() {
  const navigation = useAppNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.navigate('ProviderDashboard' as never);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="business" size={48} color={COLORS.primary} />
        <Text style={styles.title}>Provider Login</Text>
        <Text style={styles.subtitle}>Sign in to manage your daycare listings</Text>
      </View>

      <View style={styles.form}>
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

        <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.loginBtn}>
          Sign In
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProviderRegister')}>
          <Text style={styles.link}>Register as Provider</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginTop: 6, textAlign: 'center' },
  form: { gap: 12 },
  input: { backgroundColor: COLORS.surface },
  loginBtn: { borderRadius: 10, marginTop: 8 },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: COLORS.textLight },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '700', marginTop: 4 },
});
