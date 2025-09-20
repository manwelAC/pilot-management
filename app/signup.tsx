import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const cardBg = bg;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function handleSignup() {
    if (!username || !password || !confirm) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }

    try {
      const existing = await AsyncStorage.getItem(`user:${username}`);
      if (existing) {
        Alert.alert('Taken', 'Username already exists');
        return;
      }

      const user = { username, password };
      await AsyncStorage.setItem(`user:${username}`, JSON.stringify(user));
  await AsyncStorage.setItem('session:user', username);
  router.replace('/customize');
    } catch (e) {
      Alert.alert('Error', 'An error occurred while creating account');
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.center}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Image source={require('../assets/images/react-logo.png')} style={styles.logo} accessibilityLabel="app-logo" />

          <ThemedText type="title" style={styles.title}>
            Create Account
          </ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>
            Start using the app with your new account
          </ThemedText>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Username"
                placeholderTextColor="#9BA1A6"
                style={[styles.input, { color: tint }]}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                accessibilityLabel="signup-username"
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9BA1A6"
                style={[styles.input, { color: tint }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="signup-password"
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#9BA1A6"
                style={[styles.input, { color: tint }]}
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                accessibilityLabel="signup-confirm"
              />
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: tint }]} onPress={handleSignup} accessibilityLabel="signup-button">
              <ThemedText style={styles.buttonText}>Sign up</ThemedText>
            </TouchableOpacity>

            {/* social sign-up removed */}

            <View style={styles.row}>
              <ThemedText>Already have an account? </ThemedText>
              <Link href="/login" style={{ marginLeft: 6 }}>
                <ThemedText type="link">Sign in</ThemedText>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'stretch',
  },
  logo: {
    width: 56,
    height: 56,
    alignSelf: 'center',
    marginBottom: 12,
    opacity: 0.95,
  },
  title: {
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#9BA1A6',
  },
  form: {
    width: '100%',
  },
  inputRow: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
    color: '#ECEDEE',
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#151718',
    fontWeight: '700',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
