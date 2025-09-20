import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const RANKS = ['Rookie','Veteran','Elite','Pro','Master','Grandmaster','Legendary'];
// For tiered inputs we exclude the peak "Legendary" rank (no tiers)
const DISPLAY_RANKS = RANKS.filter(r => r !== 'Legendary');
const TIERS = ['I','II','III','IV','V'];

export default function CodmPrices() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prices, setPrices] = useState<Record<string,string>>({});
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem('session:user');
      if (!user) {
        router.replace('/login');
        return;
      }
      setUsername(user);
      const key = `prices:${user}:codm`;
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Remove any legacy Legendary-tier keys — Legendary has no tiers
        const filtered: Record<string,string> = {};
        Object.entries(parsed).forEach(([k,v]) => {
          if (k.startsWith('Legendary-')) return;
          filtered[k] = String(v);
        });
        setPrices(filtered);
      }
      setLoading(false);
    })();
  }, []);

  function setPriceFor(key: string, value: string) {
    setPrices(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!username) return;
    setSaving(true);
    try {
      const key = `prices:${username}:codm`;
      // normalize numbers (allow empty -> remove) and skip Legendary keys
      const normalized: Record<string, number> = {};
      Object.entries(prices).forEach(([k,v]) => {
        if (k.startsWith('Legendary-')) return;
        const n = Number(v);
        if (!Number.isNaN(n)) normalized[k] = n;
      });
      await AsyncStorage.setItem(key, JSON.stringify(normalized));
      Alert.alert('Saved', 'Prices saved successfully');
      router.replace('/codm' as any);
    } catch (e) {
      Alert.alert('Error', 'Failed to save prices');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <ThemedView style={[styles.center, { backgroundColor: bg }]}>
      <ThemedText>Loading…</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Set Your Prices</ThemedText>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Call of Duty: Mobile — set prices per tier</ThemedText>

        {DISPLAY_RANKS.map(rank => (
          <View key={rank} style={styles.rankBlock}>
            <ThemedText type="subtitle">{rank}</ThemedText>
            <View style={styles.tiersRow}>
              {TIERS.map(tier => {
                const key = `${rank}-${tier}`;
                return (
                  <View key={key} style={styles.tierItem}>
                    <ThemedText style={styles.tierLabel}>{tier}</ThemedText>
                    <TextInput
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9BA1A6"
                      style={[styles.input, { borderColor: tint }]}
                      value={prices[key] ?? ''}
                      onChangeText={v => setPriceFor(key, v)}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tint }]} onPress={handleSave} disabled={saving}>
          <ThemedText style={styles.saveText}>{saving ? 'Saving...' : 'Save Prices'}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rankBlock: { marginBottom: 18 },
  tiersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tierItem: { width: '18%', minWidth: 64, alignItems: 'center' },
  tierLabel: { marginBottom: 6 },
  input: { height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, width: '100%', color: '#ECEDEE' },
  saveBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { color: '#151718', fontWeight: '700' },
});
