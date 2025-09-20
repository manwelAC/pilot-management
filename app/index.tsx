import { ThemedView } from '@/components/themed-view';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
      <Redirect href="/login" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
