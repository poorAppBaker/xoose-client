import React from 'react';
import { SafeAreaView } from 'react-native';
import TripEndedScreen from '../components/maps/TripEndedModal';
import { useLocalSearchParams } from 'expo-router';

export default function TripEndedPage() {
  const { driverId, tripFare, bookingId } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TripEndedScreen 
        driverId={driverId as string}
        tripFare={tripFare ? parseFloat(tripFare as string) : undefined}
        bookingId={bookingId as string}
      />
    </SafeAreaView>
  );
}
