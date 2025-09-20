import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Customize() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await AsyncStorage.getItem('session:user');
      if (!session) {
        router.replace('/login');
        return;
      }
      setChecking(false);
    })();
  }, []);

  async function chooseGame(game: string) {
    setSaving(true);
    try {
      await AsyncStorage.setItem('session:game', game);
      if (game === 'Call of Duty: Mobile') {
        router.push('/set-prices/codm');
      } else {
        // placeholder: navigate home
        router.replace('/');
      }
    } catch (e) {
      // ignore for now
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Customize' }} />

      <ThemedText type="title">Customize Your Experience</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        What game do you pilot? only choose 1 for your account
      </ThemedText>

      <View style={styles.choices}>
        <TouchableOpacity
          style={[styles.choice, { backgroundColor: tint }]}
          activeOpacity={0.9}
          onPress={() => chooseGame('Call of Duty: Mobile')}
          accessibilityLabel="choose-codm">
          <ThemedText style={styles.choiceText}>Call of Duty: Mobile</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.choice, { backgroundColor: tint }]}
          activeOpacity={0.9}
          onPress={() => chooseGame('Mobile Legends: Bang Bang')}
          accessibilityLabel="choose-mlbb">
          <ThemedText style={styles.choiceText}>Mobile Legends: Bang Bang</ThemedText>
        </TouchableOpacity>
      </View>

      {saving && (
        <ThemedView style={styles.centerSmall}>
          <ActivityIndicator />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'flex-start' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerSmall: { marginTop: 16, alignItems: 'center' },
  subtitle: { marginTop: 8, marginBottom: 20, color: '#9BA1A6' },
  choices: { marginTop: 12 },
  choice: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  choiceText: {
    color: '#151718',
    fontWeight: '700',
    fontSize: 16,
  },
});
