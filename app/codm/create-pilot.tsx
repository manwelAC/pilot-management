import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const RANKS = ['Rookie','Veteran','Elite','Pro','Master','Grandmaster','Legendary'];
const DISPLAY_RANKS = RANKS.filter(r => r !== 'Legendary');
const TIERS = ['I','II','III','IV','V'];

function normalizeKey(rank: string, tier?: string) {
  if (rank === 'Legendary') return 'Legendary';
  return `${rank}-${tier}`;
}

function parseRankTier(input: string) {
  if (!input) return null;
  const val = input.trim();
  // accept formats like "Master I", "Master-I", "Master-I "
  const parts = val.includes('-') ? val.split('-') : val.split(/\s+/);
  if (parts.length === 1) {
    const rankOnly = parts[0].trim();
    if (rankOnly === 'Legendary') return normalizeKey('Legendary');
    return null;
  }
  const rank = parts[0].trim();
  const tier = parts[1].trim().toUpperCase();
  if (!DISPLAY_RANKS.includes(rank) || !TIERS.includes(tier)) return null;
  return normalizeKey(rank, tier);
}

export default function CreatePilot() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  const [clientName, setClientName] = useState('');
  const [start, setStart] = useState('Master I');
  const [end, setEnd] = useState('Grandmaster I');
  const [date, setDate] = useState('');

  const [rangeKeys, setRangeKeys] = useState<string[]>([]);
  const [total, setTotal] = useState<number | null>(null);

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
      if (raw) setPrices(JSON.parse(raw));
      setLoading(false);
    })();
  }, []);

  function buildAllKeys() {
    const arr: string[] = [];
    for (const rank of DISPLAY_RANKS) {
      for (const tier of TIERS) {
        arr.push(normalizeKey(rank, tier));
      }
    }
    // Append Legendary as the peak rank (no tiers)
    arr.push('Legendary');
    return arr;
  }

  function computeRange(startInput: string, endInput: string) {
    const startKey = parseRankTier(startInput);
    const endKey = parseRankTier(endInput);
    if (!startKey || !endKey) {
      Alert.alert('Invalid input', 'Please enter valid start and end ranks (e.g. "Master I").');
      return;
    }
    const all = buildAllKeys();
    const s = all.indexOf(startKey);
    const e = all.indexOf(endKey);
    if (s === -1 || e === -1) {
      Alert.alert('Not supported', 'Selected rank/tier not supported.');
      return;
    }
    // Build an inclusive slice between the two indices, then drop the last item
    // so the end tier is not charged.
    let lower = Math.min(s, e);
    let upper = Math.max(s, e);
    const full = all.slice(lower, upper + 1);
    if (full.length === 0) {
      setRangeKeys([]);
      setTotal(0);
      return;
    }
    const slice = full.slice(0, -1); // drop the end tier
    // If user provided start > end, we swapped; keep order ascending
    setRangeKeys(slice);
    calculateTotal(slice);
  }

  function calculateTotal(keys: string[]) {
    let t = 0;
    for (const k of keys) {
      const v = prices[k];
      if (typeof v === 'number') t += v;
    }
    setTotal(t);
  }

  async function handleSavePilot() {
    if (!username) return;
    if (!clientName) {
      Alert.alert('Missing data', 'Please enter a client name.');
      return;
    }
    if (!date) {
      Alert.alert('Missing data', 'Please enter a date for the job (YYYY-MM-DD).');
      return;
    }
    // validate YYYY-MM-DD
    const match = /^\d{4}-\d{2}-\d{2}$/.exec(date);
    if (!match) {
      Alert.alert('Invalid date', 'Date must be in YYYY-MM-DD format.');
      return;
    }
    const parsed = new Date(date + 'T00:00:00');
    if (Number.isNaN(parsed.getTime())) {
      Alert.alert('Invalid date', 'Date is not a valid calendar date.');
      return;
    }
    if (rangeKeys.length === 0 || !total || total <= 0) {
      Alert.alert('Missing data', 'Please calculate a valid grind range with a non-zero total.');
      return;
    }
    const key = `pilots:${username}`;
    const raw = await AsyncStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
  const job = { clientName, date: date, range: rangeKeys, total, status: 'pending', createdAt: Date.now() } as any;
    existing.push(job);
    await AsyncStorage.setItem(key, JSON.stringify(existing));
    Alert.alert('Saved', 'Pilot job saved');
    router.replace('/codm/pilot-list' as any);
  }

  if (loading) return (
    <ThemedView style={[styles.center, { backgroundColor: bg }]}>
      <ThemedText>Loading…</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Create Pilot</ThemedText>

        <ThemedText style={{ marginTop: 12 }}>Client Name:</ThemedText>
        <TextInput style={[styles.input, { borderColor: tint }]} value={clientName} onChangeText={setClientName} placeholder="Client name" />

        <ThemedText style={{ marginTop: 12 }}>Date:</ThemedText>
        <TextInput style={[styles.input, { borderColor: tint }]} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

        <ThemedText style={{ marginTop: 12 }}>Grind (start):</ThemedText>
        <TextInput style={[styles.input, { borderColor: tint }]} value={start} onChangeText={setStart} placeholder="e.g. Master I" />

        <ThemedText style={{ marginTop: 12 }}>Grind (end):</ThemedText>
        <TextInput style={[styles.input, { borderColor: tint }]} value={end} onChangeText={setEnd} placeholder="e.g. Grandmaster I" />

        <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]} onPress={() => computeRange(start, end)}>
          <ThemedText style={styles.btnText}>Calculate Range</ThemedText>
        </TouchableOpacity>

        {rangeKeys.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <ThemedText type="subtitle">Steps included ({rangeKeys.length}):</ThemedText>
            {rangeKeys.map(k => (
              <ThemedText key={k} style={{ marginTop: 6 }}>{k} — {prices[k] ?? 'N/A'}</ThemedText>
            ))}
            <ThemedText type="subtitle" style={{ marginTop: 8 }}>Total: {total ?? 0}</ThemedText>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: tint }]} onPress={handleSavePilot}>
          <ThemedText style={styles.saveText}>Save Pilot</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginTop: 6, color: '#ECEDEE' },
  btn: { height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  btnText: { fontWeight: '700' },
  saveBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  saveText: { color: '#151718', fontWeight: '700' },
});
