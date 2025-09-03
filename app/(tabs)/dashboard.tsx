// app/(tabs)/dashboard.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import useDashboardStore from '../../store/dashboardStore';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const user = useAuthStore(state => state.user);
  const {
    allAppointments,
    fetchAllAppointments,
  } = useDashboardStore();

  const isManager = user?.role === 'manager';

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchAllAppointments();
      }
    }, [fetchAllAppointments, user])
  );

  const styles = createStyles(theme);

  // Create sections for FlatList
  const sections = [
    { type: 'calendar', id: 'calendar-section' },
    { type: 'dailyOverview', id: 'daily-overview-section' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('tab_dashboard.home')}</Text>
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