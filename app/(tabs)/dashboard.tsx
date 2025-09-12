// app/(tabs)/dashboard.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import { useSidebarContext } from '../../contexts/SidebarContext';
import bookingService, { CreateBookingParams } from '../../services/bookingService';
import MapView from '@/components/maps/MapView';
import WhereToGoModal from '@/components/maps/WhereToGoModal';
import InviteFriends from '@/components/maps/InviteFriends';
import ConfirmDestinationModal from '@/components/maps/ConfirmDestinationModal';
import PickupModal from '@/components/maps/PickupModal';
import ConfirmPickupModal from '@/components/maps/ConfirmPickupModal';
import WhereToWhereSection from '@/components/maps/WhereToWhereSection';
import ConfirmDetailsModal from '@/components/maps/ConfirmDetailsModal';
import WhoWillTakeTripModal from '@/components/maps/WhoWillTakeTripModal';
import ProfilePaymentModal from '@/components/maps/ProfilePaymentModal';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const { toggleSidebar } = useSidebarContext();
  const [showWhereToGoModal, setShowWhereToGoModal] = useState(true);
  const [showInviteFriends, setShowInviteFriends] = useState(true);
  const [isWhereToGoFullScreen, setIsWhereToGoFullScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [showConfirmDestination, setShowConfirmDestination] = useState(false);
  const [destination, setDestination] = useState<{
    coordinate: [number, number];
    title: string;
    subtitle: string;
  } | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [isPickupFullScreen, setIsPickupFullScreen] = useState(false);
  const [showConfirmPickup, setShowConfirmPickup] = useState(false);
  const [pickup, setPickup] = useState<{
    coordinate: [number, number];
    title: string;
    subtitle: string;
  } | null>(null);
  const [showConfirmDetails, setShowConfirmDetails] = useState(false);
  const [showWhoWillTakeTrip, setShowWhoWillTakeTrip] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showWhereToWhereSection, setShowWhereToWhereSection] = useState(false);
  const [showProfilePaymentModal, setShowProfilePaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{
    type: string;
    last4: string;
    brand: string;
  } | null>(null);
  const [tripTaker, setTripTaker] = useState<{
    type: 'myself' | 'someone';
    name?: string;
    phone?: string;
  }>({ type: 'myself' });
  const [currentLocation, setCurrentLocation] = useState<{
    coordinate: [number, number];
    address?: string;
  } | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const styles = createStyles(theme);

  // Calculate map height based on modal visibility
  const getMapHeight = () => {
    const { height: screenHeight } = Dimensions.get('window');
    
    // Different height reductions based on modal type
    if (showWhereToGoModal || showPickupModal) {
      return screenHeight * 0.6; // 30% height for large modals (WhereToGo, Pickup)
    } else if (showConfirmDestination || showConfirmPickup) {
      return screenHeight * 0.7; // 70% height for smaller modals (ConfirmDestination, ConfirmPickup)
    } else if (showConfirmDetails || showWhoWillTakeTrip || showProfilePaymentModal) {
      return screenHeight * 0.5; // 40% height for medium modals (ConfirmDetails, WhoWillTakeTrip, ProfilePayment)
    }
    
    return screenHeight; // Full height when no modals
  };

  const handleLocationSelect = (location: any) => {
    if (location.latitude && location.longitude) {
      setSelectedLocation([location.longitude, location.latitude]);
      setDestination({
        coordinate: [location.longitude, location.latitude],
        title: location.title,
        subtitle: location.subtitle
      });
      setShowWhereToGoModal(false);
      setShowConfirmDestination(true);
    }
  };

  const handleConfirmBack = () => {
    setShowConfirmDestination(false);
    setShowWhereToGoModal(true);
  };

  const handleConfirmContinue = () => {
    setShowConfirmDestination(false);
    setShowPickupModal(true);
  };

  const handlePickupSelect = (location: any) => {
    if (location.latitude && location.longitude) {
      setPickup({
        coordinate: [location.longitude, location.latitude],
        title: location.title,
        subtitle: location.subtitle
      });
      setSelectedLocation([location.longitude, location.latitude]); // Move map to pickup location
      setShowPickupModal(false);
      setShowConfirmPickup(true);
    }
  };

  const handlePickupBack = () => {
    setShowConfirmPickup(false);
    setShowPickupModal(true);
  };

  const handlePickupContinue = () => {
    setShowConfirmPickup(false);
    setShowWhereToWhereSection(true);
    setShowConfirmDetails(true);
  };

  const handlePaymentPress = () => {
    setShowProfilePaymentModal(true);
  };

  const handlePaymentMethodSelected = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowProfilePaymentModal(false);
  };

  const handleTripTakerSelected = (tripTakerType: 'myself' | 'someone', personDetails?: { name: string; phone?: string }) => {
    if (tripTakerType === 'myself') {
      setTripTaker({ type: 'myself' });
    } else {
      setTripTaker({
        type: 'someone',
        name: personDetails?.name,
        phone: personDetails?.phone,
      });
    }
    setShowWhoWillTakeTrip(false);
  };

  const createBooking = async () => {
    if (!user || !destination || !pickup || !selectedPaymentMethod || !currentLocation) {
      console.error('Missing required data for booking:', {
        user: !!user,
        destination: !!destination,
        pickup: !!pickup,
        selectedPaymentMethod: !!selectedPaymentMethod,
        currentLocation: !!currentLocation
      });
      return;
    }

    setIsCreatingBooking(true);

    try {
      const bookingData: CreateBookingParams = {
        destination: {
          coordinate: destination.coordinate,
          title: destination.title,
          subtitle: destination.subtitle,
          address: destination.subtitle, // Using subtitle as address
        },
        pickup: {
          coordinate: pickup.coordinate,
          title: pickup.title,
          subtitle: pickup.subtitle,
          address: pickup.subtitle, // Using subtitle as address
        },
        currentLocation: {
          coordinate: currentLocation.coordinate,
          address: currentLocation.address,
        },
        passenger: {
          id: user._id,
          name: user.name || 'Unknown',
          phone: user.phone,
        },
        payment: {
          methodId: selectedPaymentMethod.id || 'unknown',
          type: selectedPaymentMethod.type,
          last4: selectedPaymentMethod.last4,
          brand: selectedPaymentMethod.brand,
        },
        tripTaker: tripTaker,
        // Add waypoints if available
        waypoints: [], // You can add waypoints from the map if needed
      };

      console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
      const bookingId = await bookingService.createBooking(bookingData);
      console.log('Booking created successfully:', bookingId);
      
      // Close the confirm details modal
      setShowConfirmDetails(false);
      
      // You can show a success message or navigate to a booking confirmation screen
      // For now, just log success
      console.log('Booking confirmed!');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      // Error handling is done in the booking service
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapView 
        selectedLocation={selectedLocation} 
        destination={destination ? {
          coordinate: destination.coordinate,
          title: destination.title
        } : undefined}
        pickup={pickup ? {
          coordinate: pickup.coordinate,
          title: pickup.title
        } : undefined}
        onWaypointChange={(waypoints) => {
          console.log('Waypoints changed:', waypoints);
        }}
        onCurrentLocationChange={setCurrentLocation}
        mapHeight={getMapHeight()}
      />
      
      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton} activeOpacity={0.8}>
            <Ionicons name="menu" size={28} color={theme.colors.blue500} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Where to Where Section - Only show after pickup confirmation */}
      {showWhereToWhereSection && (
        <WhereToWhereSection
          pickup={pickup}
          destination={destination}
          onPickupPress={() => setShowPickupModal(true)}
          onDestinationPress={() => setShowWhereToGoModal(true)}
          onAddStop={() => {
            // Add stop functionality - could open a modal or add waypoint
            console.log('Add stop pressed');
          }}
        />
      )}

      {/* Invite Friends Section */}
      <InviteFriends 
        visible={showInviteFriends && !isWhereToGoFullScreen}
        onClose={() => setShowInviteFriends(false)}
      />

      {/* Where to Go Modal */}
      <WhereToGoModal 
        visible={showWhereToGoModal}
        onClose={() => setShowWhereToGoModal(false)}
        onLocationSelect={handleLocationSelect}
        isFullScreen={isWhereToGoFullScreen}
        onFullScreenChange={setIsWhereToGoFullScreen}
      />

      {/* Confirm Destination Modal */}
      <ConfirmDestinationModal
        visible={showConfirmDestination}
        destination={destination}
        onBack={handleConfirmBack}
        onContinue={handleConfirmContinue}
        onClose={() => setShowConfirmDestination(false)}
        onEdit={() => {
          setShowConfirmDestination(false);
          setShowWhereToGoModal(true);
        }}
      />

      {/* Pickup Modal */}
      <PickupModal
        visible={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onLocationSelect={handlePickupSelect}
        isFullScreen={isPickupFullScreen}
        onFullScreenChange={setIsPickupFullScreen}
      />

      {/* Confirm Pickup Modal */}
      <ConfirmPickupModal
        visible={showConfirmPickup}
        pickup={pickup}
        onBack={handlePickupBack}
        onContinue={handlePickupContinue}
        onClose={() => setShowConfirmPickup(false)}
        onEdit={() => {
          setShowConfirmPickup(false);
          setShowPickupModal(true);
        }}
      />

      {/* Confirm Details Modal */}
      <ConfirmDetailsModal
        visible={showConfirmDetails}
        pickup={pickup}
        destination={destination}
        selectedPaymentMethod={selectedPaymentMethod}
        tripTaker={tripTaker}
        isCreatingBooking={isCreatingBooking}
        onBack={() => setShowConfirmDetails(false)}
        onContinue={createBooking}
        onClose={() => setShowConfirmDetails(false)}
        onTripTakerPress={() => setShowWhoWillTakeTrip(true)}
        onPaymentPress={handlePaymentPress}
        onCouponPress={() => setShowCouponModal(true)}
      />

      {/* Who Will Take Trip Modal */}
      <WhoWillTakeTripModal
        visible={showWhoWillTakeTrip}
        onClose={() => setShowWhoWillTakeTrip(false)}
        onSelect={handleTripTakerSelected}
      />

      {/* Profile Payment Modal */}
      <ProfilePaymentModal
        visible={showProfilePaymentModal}
        onClose={() => setShowProfilePaymentModal(false)}
        isSelectionMode={true}
        onPaymentMethodSelect={handlePaymentMethodSelected}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
    paddingHorizontal: theme.spacing.lg,
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