// app/(tabs)/dashboard.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import { useSidebarContext } from '../../contexts/SidebarContext';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const { toggleSidebar } = useSidebarContext();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton} activeOpacity={0.8}>
            <Ionicons name="menu" size={28} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: theme.colors.backgroundSurface,
  },
  header: {
    backgroundColor: theme.colors.backgroundSurface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontWeight: '600',
  },
  sectionContainer: {
    // Container for each section
  },
  contentContainer: {
    paddingBottom: 100
  },
});