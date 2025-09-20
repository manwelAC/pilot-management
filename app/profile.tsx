import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('session:user');
      if (!u) {
        router.replace('/login');
        return;
      }
      setUser(u);
    })();
  }, []);

  async function handleSignOut() {
    await AsyncStorage.removeItem('session:user');
    router.replace('/login');
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={{ marginTop: 12 }}>{user ? `Signed in as ${user}` : ''}</ThemedText>

      <View style={{ marginTop: 18 }}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/set-prices/codm')}>
          <ThemedText style={styles.buttonText}>Manage CODM Prices</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => Alert.alert('Coming soon', 'MLBB price editor coming soon')}>
          <ThemedText style={styles.buttonText}>Manage MLBB Prices</ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, { marginTop: 24, backgroundColor: '#FF6B6B' }]} onPress={handleSignOut}>
        <ThemedText style={styles.buttonText}>Sign out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  button: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', alignItems: 'center' },
  buttonText: { fontWeight: '700' },
});
