import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  // 'subtle' is not a supported token in useThemeColor; compute a safe card background
  const cardBg = bg; 

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Please enter username and password');
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(`user:${username}`);
      if (!raw) {
        Alert.alert('Not found', 'No user found with that username');
        return;
      }

      const user = JSON.parse(raw);
      if (user.password !== password) {
        Alert.alert('Invalid', 'Incorrect password');
        return;
      }

      await AsyncStorage.setItem('session:user', username);

      // If user already has CODM prices saved, go straight to the CODM dashboard
      const pricesKey = `prices:${username}:codm`;
      const existing = await AsyncStorage.getItem(pricesKey);
      if (existing) {
        router.replace('/codm' as any);
        return;
      }

      // Otherwise, if they already selected a game, send them accordingly
      const game = await AsyncStorage.getItem('session:game');
      if (game === 'Call of Duty: Mobile') {
        router.replace('/set-prices/codm');
        return;
      }

      router.replace('/customize');
    } catch (e) {
      Alert.alert('Error', 'An error occurred while logging in');
    }
  }

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: bg }]}
      accessibilityLabel="login-screen">
      <View style={styles.center}>
        <View style={[styles.card, { backgroundColor: cardBg }]}
          accessibilityRole="none">
          <Image
            source={require('../assets/images/react-logo.png')}
            style={styles.logo}
            accessibilityLabel="app-logo"
          />

          <ThemedText type="title" style={styles.title}>
            Welcome back
          </ThemedText>

          <ThemedText type="subtitle" style={styles.subtitle}>
            Sign in to continue
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
                accessibilityLabel="username-input"
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
                accessibilityLabel="password-input"
              />
              <Pressable onPress={() => Alert.alert('Forgot Password', 'Password reset flow not implemented')} accessibilityLabel="forgot-password">
                <ThemedText type="link" style={styles.forgot}>Forgot?</ThemedText>
              </Pressable>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: tint }]}
              onPress={handleLogin}
              accessibilityLabel="sign-in-button">
              <ThemedText style={styles.buttonText}>Sign in</ThemedText>
            </TouchableOpacity>

            {/* social sign-in removed */}

            <View style={styles.row}>
              <ThemedText>Don't have an account? </ThemedText>
              <Link href="/signup" style={{ marginLeft: 6 }}>
                <ThemedText type="link">Create one</ThemedText>
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
  forgot: {
    position: 'absolute',
    right: 6,
    top: 12,
    fontSize: 13,
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
