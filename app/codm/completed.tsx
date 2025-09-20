import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

export default function Completed() {
  const router = useRouter();
  const [pilots, setPilots] = useState<any[]>([]);

  const load = useCallback(async () => {
    const user = await AsyncStorage.getItem('session:user');
    if (!user) {
      router.replace('/login');
      return;
    }
    const raw = await AsyncStorage.getItem(`pilots:${user}`);
    const all = raw ? JSON.parse(raw) : [];
    setPilots(all.filter((p: any) => (p.status ?? 'pending') === 'completed'));
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Completed</ThemedText>
      <View style={{ height: 12 }} />
      <FlatList
        data={pilots}
        keyExtractor={(_, idx) => String(idx)}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <ThemedText type="subtitle">{item.clientName}</ThemedText>
            <ThemedText style={{ marginTop: 6 }}>{item.date} — {item.total ?? 0} — {item.status ?? 'pending'}</ThemedText>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={() => <ThemedText style={{ marginTop: 12 }}>No completed pilots</ThemedText>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 } });
