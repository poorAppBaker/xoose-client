import React from 'react';
import { SafeAreaView } from 'react-native';
import TripEndedScreen from '../components/maps/TripEndedModal';

export default function TripEndedPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TripEndedScreen />
    </SafeAreaView>
  );
}
