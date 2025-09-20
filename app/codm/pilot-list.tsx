import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function PilotList() {
  const router = useRouter();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [pilots, setPilots] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editClient, setEditClient] = useState('');
  const [editDate, setEditDate] = useState('');
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem('session:user');
      if (!user) {
        router.replace('/login');
        return;
      }
      setUsername(user);
      await loadPilots(user);
    })();
  }, []);

  async function loadPilots(user: string) {
    setLoading(true);
    const key = `pilots:${user}`;
    const raw = await AsyncStorage.getItem(key);
    setPilots(raw ? JSON.parse(raw) : []);
    setLoading(false);
  }

  async function saveAll(updated: any[]) {
    if (!username) return;
    const key = `pilots:${username}`;
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    setPilots(updated);
  }

  function onEdit(item: any, idx: number) {
    setEditingId(idx);
    setEditClient(item.clientName);
    setEditDate(item.date);
  }

  async function onSaveEdit(idx: number) {
    if (!username) return;
    if (!editClient || !editDate) {
      Alert.alert('Missing data', 'Client and date are required.');
      return;
    }
    const updated = [...pilots];
    updated[idx] = { ...updated[idx], clientName: editClient, date: editDate };
    await saveAll(updated);
    setEditingId(null);
  }

  async function onDelete(idx: number) {
    if (!username) return;
    Alert.alert('Delete', 'Delete this pilot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const updated = pilots.filter((_, i) => i !== idx);
        await saveAll(updated);
      } }
    ]);
  }

  async function setStatus(idx: number, status: 'pending' | 'completed') {
    if (!username) return;
    const updated = [...pilots];
    updated[idx] = { ...updated[idx], status };
    await saveAll(updated);
    setProcessingIndex(null);
  }

  if (loading) return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ThemedText>Loading…</ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ThemedText type="title">Pilot List</ThemedText>
      <View style={{ height: 12 }} />
      <FlatList
        data={pilots}
        keyExtractor={(_, idx) => String(idx)}
        nestedScrollEnabled
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            {editingId === index ? (
              <View style={{ flex: 1 }}>
                <TextInput style={[styles.input, { borderColor: tint }]} value={editClient} onChangeText={setEditClient} />
                <TextInput style={[styles.input, { borderColor: tint, marginTop: 6 }]} value={editDate} onChangeText={setEditDate} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={[styles.smallBtn, { backgroundColor: tint }]} onPress={() => onSaveEdit(index)}>
                    <ThemedText>Save</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallBtn]} onPress={() => setEditingId(null)}>
                    <ThemedText>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle">{item.clientName}</ThemedText>
                <ThemedText style={{ marginTop: 6 }}>{item.date} — {item.total ?? 0} — {item.status ?? 'pending'}</ThemedText>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setOpenMenuIndex(openMenuIndex === index ? null : index)} style={styles.menuButton}>
                <ThemedText>⋯</ThemedText>
              </TouchableOpacity>
              {openMenuIndex === index && (
                <View style={[styles.menuBox, { borderColor: tint }]}> 
                  {processingIndex === index ? (
                    <View>
                      <TouchableOpacity onPress={() => setStatus(index, 'pending')} style={styles.menuItem}>
                        <ThemedText>Pending</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setStatus(index, 'completed')} style={styles.menuItem}>
                        <ThemedText>Completed</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setProcessingIndex(null)} style={styles.menuItem}>
                        <ThemedText>Cancel</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <TouchableOpacity onPress={() => { setOpenMenuIndex(null); onEdit(item, index); }} style={styles.menuItem}>
                        <ThemedText>Edit</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setOpenMenuIndex(null); onDelete(index); }} style={styles.menuItem}>
                        <ThemedText>Delete</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setProcessingIndex(index)} style={styles.menuItem}>
                        <ThemedText>Process</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)' },
  actionBtn: { marginBottom: 8 },
  menuButton: { padding: 6 },
  actions: { marginLeft: 12, justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  menuBox: { position: 'absolute', right: 0, top: 24, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderRadius: 8, padding: 6, zIndex: 100, minWidth: 120, maxWidth: 220, elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  menuItem: { paddingVertical: 6, paddingHorizontal: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 8, color: '#ECEDEE' },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }
});
