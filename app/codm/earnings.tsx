import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function Earnings() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Total Earned</ThemedText>
      <ThemedText style={{ marginTop: 12 }}>Earnings overview (placeholder)</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24 } });
