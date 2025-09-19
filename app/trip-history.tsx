import React from 'react';
import { SafeAreaView } from 'react-native';
import TripHistoryScreen from '../components/maps/TripHistoryScreen';

export default function TripHistoryPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TripHistoryScreen />
    </SafeAreaView>
  );
}
