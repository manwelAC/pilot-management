import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

function Card({ title, subtitle, onPress }: { title: string; subtitle?: string; onPress?: () => void }) {
  const tint = useThemeColor({}, 'tint');
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: tint }]} onPress={onPress} activeOpacity={0.9}>
      <ThemedText type="title" style={styles.cardTitle}>{title}</ThemedText>
      {subtitle ? <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText> : null}
    </TouchableOpacity>
  );
}

export default function CodmIndex() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'CODM' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">CODM Dashboard</ThemedText>

        {/* Chart removed as requested; keeping the dashboard header and cards */}


        <View style={styles.grid}>
          <Card title="Create Pilot" subtitle="Add a new pilot job" onPress={() => router.push('/codm/create-pilot')} />
          <Card title="Pilot List" subtitle="View current pilots" onPress={() => router.push('/codm/pilot-list')} />
          <Card title="Completed" subtitle="Completed jobs" onPress={() => router.push('/codm/completed')} />
          <Card title="Pending" subtitle="Pending jobs" onPress={() => router.push('/codm/pending')} />
          <Card title="Edit Prices" subtitle="Adjust CODM tier prices" onPress={() => router.push('/set-prices/codm')} />
          <Card title="Total Earned" subtitle="Earnings overview" onPress={() => router.push('/codm/earnings')} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  grid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '700' },
  cardSubtitle: { marginTop: 6, color: '#333' },
});
