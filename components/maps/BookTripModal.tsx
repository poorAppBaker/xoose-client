import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { DriverOption } from '../../types/driver';
import MapView from './MapView';
import WhereToWhereSection from './WhereToWhereSection';
import ConnectingDriverModal from './ConnectingDriverModal';
import DriverAcceptedModal from './DriverAcceptedModal';
import DriverArrivingModal from './DriverArrivingModal';
import DriverDeclinedModal from './DriverDeclinedModal';
import bookingService, { BookingData } from '../../services/bookingService';

// Import icon images
const subtractWhiteIcon = require('../../assets/images/icons/subtract-white.png');
const starIcon = require('../../assets/images/icons/star.png');
const languageBarIcon = require('../../assets/images/icons/language-bar.png');
const userIcon = require('../../assets/images/icons/user.png');
const petrolIcon = require('../../assets/images/icons/petrol.png');
const clockIcon = require('../../assets/images/icons/clock.png');
const babyIcon = require('../../assets/images/icons/baby.png');
const petIcon = require('../../assets/images/icons/pet.png');
const wheelchairIcon = require('../../assets/images/icons/wheel-chair.png');
const editIcon = require('../../assets/images/editIcon.png');
const pickupIcon = require('../../assets/images/icons/pickup-icon.png');
const destinationIcon = require('../../assets/images/icons/destination-icon.png');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BookTripModalProps {
  visible: boolean;
  selectedOption: DriverOption | null;
  pickup: any;
  destination: any;
  bookingId?: string | null;
  onClose: () => void;
  onBookNow: () => void;
}

export default function BookTripModal({
  visible,
  selectedOption,
  pickup,
  destination,
  bookingId,
  onClose,
  onBookNow,
}: BookTripModalProps) {
  const { theme } = useTheme();
  const [showConnecting, setShowConnecting] = useState(false);
  const [showDriverAccepted, setShowDriverAccepted] = useState(false);
  const [showDriverArriving, setShowDriverArriving] = useState(false);
  const [showDriverTimeout, setShowDriverTimeout] = useState(false);
  const [showDriverDeclined, setShowDriverDeclined] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Booking management states
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [bookingTimeout, setBookingTimeout] = useState<number | null>(null);

  // ETA calculation states
  const [calculatedPickupETA, setCalculatedPickupETA] = useState<string>('');
  const [calculatedDestinationETA, setCalculatedDestinationETA] = useState<string>('');
  const [calculatedDestinationETAText, setCalculatedDestinationETAText] = useState<string>('');

  // Calculate distance between two coordinates using Haversine formula
  const calculateHaversineDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in kilometers
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Calculate ETA based on distance and speed
  const calculateETA = (distanceKm: number, speedKmH: number): string => {
    const minSpeed = 10; // km/h
    const maxSpeed = 110; // km/h
    const clampedSpeed = Math.max(minSpeed, Math.min(maxSpeed, speedKmH));
    
    const timeHours = distanceKm / clampedSpeed;
    const timeMinutes = Math.ceil(timeHours * 60);
    
    if (timeMinutes < 1) {
      return '< 1 min';
    } else if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Calculate arrival time
  const calculateArrivalTime = (minutesFromNow: number): string => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + minutesFromNow * 60000);
    return arrivalTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };


  // Cleanup timeout on unmount - MUST be before early return
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate ETAs when driver location or speed changes - MUST be before early return
  useEffect(() => {
    if (!visible || !selectedOption) {
      return;
    }

    const { driver } = selectedOption;
    if (!pickup || !destination) {
      return;
    }

    const driverLocation = driver.currentLocation?.coordinate || [
      pickup.coordinate[0] - 0.01, // Mock location slightly west of pickup
      pickup.coordinate[1] + 0.01  // Mock location slightly north of pickup
    ];
    const driverSpeed = 35; // Default city speed in km/h

    // Calculate distances
    const driverToPickupDist = calculateHaversineDistance(driverLocation, pickup.coordinate);
    const pickupToDestDist = calculateHaversineDistance(pickup.coordinate, destination.coordinate);

    // Calculate ETAs
    const pickupETA = calculateETA(driverToPickupDist, driverSpeed);
    const destinationETA = calculateETA(pickupToDestDist, driverSpeed);

    setCalculatedPickupETA(pickupETA);
    setCalculatedDestinationETA(destinationETA);
    setCalculatedDestinationETAText(`Arriving by ${calculateArrivalTime(Math.ceil((driverToPickupDist + pickupToDestDist) / driverSpeed * 60))}`);

    console.log('⏰ BookTripModal calculated ETAs:', {
      driverToPickupDist: `${driverToPickupDist.toFixed(2)} km`,
      pickupToDestDist: `${pickupToDestDist.toFixed(2)} km`,
      pickupETA,
      destinationETA
    });
  }, [visible, selectedOption, pickup, destination]);

  // Cleanup booking timeout when component unmounts
  useEffect(() => {
    return () => {
      if (bookingTimeout) {
        clearTimeout(bookingTimeout);
      }
    };
  }, [bookingTimeout]);

  // Reset states when modal closes
  useEffect(() => {
    if (!visible) {
      setShowConnecting(false);
      setShowDriverAccepted(false);
      setShowDriverArriving(false);
      setShowDriverTimeout(false);
      setIsBookingActive(false);
      setCurrentBookingId(null);
      
      if (bookingTimeout) {
        clearTimeout(bookingTimeout);
        setBookingTimeout(null);
      }
    }
  }, [visible]);

  if (!visible || !selectedOption) {
    return null;
  }

  // Set up real-time listener for booking updates
  const setupBookingListener = (bookingId: string) => {
    console.log('👂 Setting up booking listener for:', bookingId);
    
    const unsubscribe = bookingService.subscribeToBooking(bookingId, (booking: BookingData | null) => {
      console.log('📡 Booking listener triggered with booking:', booking);
      
      if (booking) {
        console.log('📡 Booking update received - isAccepted:', booking.isAccepted, 'isDeclined:', booking.isDeclined);
        console.log('📡 Current modal states - showConnecting:', showConnecting, 'showDriverAccepted:', showDriverAccepted, 'showDriverDeclined:', showDriverDeclined);
        
        if (booking.isAccepted === true) {
          console.log('✅ Driver accepted the booking! Updating modal states...');
          setShowConnecting(false);
          setShowDriverAccepted(true);
          setShowDriverDeclined(false);
          setIsBookingActive(false);
          
          // Clear timeout
          if (bookingTimeout) {
            console.log('🧹 Clearing booking timeout');
            clearTimeout(bookingTimeout);
            setBookingTimeout(null);
          }
        } else if (booking.isDeclined === true) {
          console.log('❌ Driver declined the booking! Updating modal states...');
          setShowConnecting(false);
          setShowDriverAccepted(false);
          setShowDriverDeclined(true);
          setIsBookingActive(false);
          
          // Clear timeout
          if (bookingTimeout) {
            console.log('🧹 Clearing booking timeout');
            clearTimeout(bookingTimeout);
            setBookingTimeout(null);
          }
        } else {
          console.log('⏳ Driver has not responded yet - isAccepted:', booking.isAccepted, 'isDeclined:', booking.isDeclined);
        }
      } else {
        console.log('❌ No booking data received');
      }
    });
    
    // Store unsubscribe function for cleanup
    return unsubscribe;
  };

  const handleBookNow = async () => {
    console.log('🚀 Book Now clicked - updating existing booking with driver');
    
    if (!bookingId) {
      console.error('❌ No bookingId provided - cannot update booking');
      return;
    }
    
    try {
      // Update existing booking with driver info and isAccepted: false
      const driverData = {
        id: selectedOption.driver.id,
        name: selectedOption.driver.name,
        phone: '555-0123', // Mock phone number
        rating: selectedOption.driver.rating,
        vehicle: {
          model: selectedOption.fare.vehicle.model,
          plate: 'ABC-123', // Mock plate number
          color: 'White', // Mock color
        },
      };

      await bookingService.updateDriverAcceptance(bookingId, false, driverData);
      console.log('📝 Booking updated with driver data and isAccepted: false');
      
      setCurrentBookingId(bookingId);
      setIsBookingActive(true);
      setShowConnecting(true);
      
      // Set up real-time listener for booking updates
      setupBookingListener(bookingId);
      
      // Set timeout for driver acceptance (1 minute)
      const timeout = setTimeout(() => {
        if (isBookingActive) {
          console.log('⏰ Driver timeout - showing timeout modal');
          setShowDriverTimeout(true);
          setShowConnecting(false);
        }
      }, 60000); // 1 minute
      
      setBookingTimeout(timeout);
      
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      // Handle error - maybe show an alert
    }
  };

  const handlePullUp = () => {
    console.log('📱 Modal pulled up - showing extended view');
    setIsExtended(true);
  };

  const handlePullDown = () => {
    console.log('📱 Modal pulled down - showing unextended view');
    setIsExtended(false);
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationY } = event;
      
      // If user pulled up (negative translationY) and moved more than 50px
      if (translationY < -50 && !isExtended) {
        runOnJS(handlePullUp)();
      }
      // If user pulled down (positive translationY) and moved more than 50px
      else if (translationY > 50 && isExtended) {
        runOnJS(handlePullDown)();
      }
    });

  const handleCancelConnecting = () => {
    setShowConnecting(false);
  };

  // Note: Driver acceptance is now handled by Firebase real-time updates
  // The setupBookingListener function handles showing the driver accepted modal

  const handleDriverAcceptedContinue = () => {
    setShowDriverAccepted(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Show the DriverArrivingModal
    setShowDriverArriving(true);
  };

  const handleDriverArrivingClose = () => {
    setShowDriverArriving(false);
    onClose();
  };

  const handleCancelRide = () => {
    setShowDriverArriving(false);
    onClose();
  };

  const handleDriverTimeoutContinue = () => {
    setShowDriverTimeout(false);
    // Return to driver selection
    onClose();
  };

  const handleDriverDeclinedClose = () => {
    setShowDriverDeclined(false);
    onClose();
  };

  const handleBookAgain = () => {
    setShowDriverDeclined(false);
    // Reset all modal states and return to driver selection
    setShowConnecting(false);
    setShowDriverAccepted(false);
    setShowDriverArriving(false);
    setShowDriverTimeout(false);
    onClose();
  };

  const { driver, fare } = selectedOption;

  // Debug logging for driver data
  console.log('🚗 BookTripModal driver data:', {
    driverId: driver.id,
    driverName: driver.name,
    currentLocation: driver.currentLocation,
    hasCurrentLocation: !!driver.currentLocation?.coordinate
  });

  return (
    <View style={styles.container}>
      {/* Overlay - Only show when extended */}
      {isExtended && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={() => setIsExtended(false)}
        />
      )}

      {/* Map Section - Only show when not extended */}
      {!isExtended && (
        <View style={styles.mapContainer}>
          <MapView
            pickup={pickup}
            destination={destination}
            selectedLocation={undefined}
            showETALabels={true}
            calculateETAs={true}
            showDriverCar={false}
            driverLocation={driver.currentLocation?.coordinate || [
              pickup.coordinate[0] - 0.01, // Mock location slightly west of pickup
              pickup.coordinate[1] + 0.01  // Mock location slightly north of pickup
            ]}
            driverSpeed={35} // Default city speed in km/h - could be enhanced with real driver speed
            // pickupETA and destinationETA will be calculated automatically by MapView
          />

          {/* From → To Section */}
          <WhereToWhereSection
            pickup={pickup}
            destination={destination}
            onPickupPress={() => { }} // Disabled in this modal
            onDestinationPress={() => { }} // Disabled in this modal
            onAddStop={() => { }} // Disabled in this modal
          />
        </View>
      )}

      {/* Modal Content */}
      {!showDriverAccepted && !showDriverTimeout && (
        <GestureDetector gesture={panGesture}>
          <View style={isExtended ? styles.extendedModal : styles.modal}>

            {/* Pull-up Handle - Only show when not extended */}
            {!isExtended && (
              <View style={styles.pullUpHandle}>
                <View style={styles.pullUpIndicator} />
              </View>
            )}

            {/* Pull-down Handle - Only show when extended */}
            {isExtended && (
              <View style={styles.pullDownHandle}>
                <View style={styles.pullDownIndicator} />
              </View>
            )}

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>Book the Trip</Text>
            </View>
            <View style={styles.popularityIndicator}>
              <View style={styles.popularityDot} />
              <Text style={styles.popularityText}>8 other persons have this driver on their list</Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Driver and Vehicle Section - Side by Side */}
            <View style={styles.mainSection}>
              {/* Driver Section */}
              <View style={styles.driverSection}>
                <View style={styles.profileImageContainer}>
                  <View style={styles.verificationBadge}>
                    <Image source={subtractWhiteIcon} style={styles.filterChipIcon} />
                    <Text style={styles.verificationText}>10k+</Text>
                  </View>
                  <Image
                    source={require('../../assets/images/profile-avatar.png')}
                    style={styles.profileImage}
                  />
                </View>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.ratingLanguagesContainer}>
                  <View style={styles.ratingContainer}>
                    <Image source={starIcon} style={styles.filterChipIcon} />
                    <Text style={styles.rating}>{driver.rating}</Text>
                  </View>
                  <View style={styles.languageTags}>
                    <View style={styles.languageTag}>
                      <Text style={styles.languageText}>PT</Text>
                      <Image source={languageBarIcon} style={styles.filterChipIcon} />
                    </View>
                    <View style={styles.languageTag}>
                      <Text style={styles.languageText}>EN</Text>
                      <Image source={languageBarIcon} style={styles.filterChipIcon} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Vehicle Section */}
              <View style={styles.vehicleSection}>
                <View style={styles.vehicleImageContainer}>
                  <Image
                    source={require('../../assets/images/car.png')}
                    style={styles.vehicleImage}
                  />
                </View>
                <Text style={styles.vehicleModel}>{fare.vehicle.model}</Text>
                <View style={styles.vehicleRatingContainer}>
                  <View style={styles.vehicleRatingContainer}>
                    <Image source={starIcon} style={styles.filterChipIcon} />
                    <Text style={styles.vehicleRating}>{fare.vehicle.rating}</Text>
                  </View>
                  <View style={styles.vehicleFeatures}>
                    <View style={styles.feature}>
                      <Image source={userIcon} style={[styles.filterChipIcon, { tintColor: theme.colors.blue500 }]} />
                      <Text style={styles.featureText}>{fare.vehicle.capacity}</Text>
                    </View>
                    <View style={styles.feature}>
                      <Image source={petrolIcon} style={styles.filterChipIcon} />
                    </View>
                  </View>
                </View>
                <View style={styles.additionalFeatures}>
                  <View style={styles.feature}>
                    <Image source={babyIcon} style={[styles.filterChipIcon, { tintColor: theme.colors.blue500 }]} />
                    <Text style={styles.featureText}>1</Text>
                  </View>
                  <View style={styles.feature}>
                    <Image source={petIcon} style={[styles.filterChipIcon, { tintColor: theme.colors.blue500 }]} />
                  </View>
                  <View style={styles.feature}>
                    <Image source={wheelchairIcon} style={[styles.filterChipIcon, { tintColor: theme.colors.blue500 }]} />
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.pricingContainer, isExtended && styles.pricingContainerExtended]}>
              {/* ETA Time Section */}
              <View style={styles.etatimeContainer}>
                <View style={styles.timeContainer}>
                  <Image source={clockIcon} style={[styles.estimateTimeIcon, { tintColor: theme.colors.blue500 }]} />
                  <Text style={styles.estimatedTime}>{calculatedDestinationETA}</Text>
                </View>
                <Text style={styles.companyName}>Company Name</Text>
              </View>

              {/* Pricing Section */}
              <View style={styles.pricingSection}>
                <View style={styles.priceContainer}>
                  {fare.discount && fare.discount.percentage > 0 && (
                    <View style={styles.discountContainer}>
                      <Text style={styles.originalPrice}>€{fare.basePrice.toFixed(2)}</Text>
                      <Text style={styles.discountText}>-{fare.discount.percentage}%</Text>
                    </View>
                  )}
                  <View style={styles.finalPriceContainer}>
                    <Text style={styles.finalPriceMain}>€{Math.floor(fare.finalPrice)}</Text>
                    <Text style={styles.finalPriceDecimal}>.{((fare.finalPrice % 1) * 100).toFixed(0).padStart(2, '0')}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Details Section - Only show when extended */}
          {isExtended && (
            <View style={styles.tripDetailsSection}>
              <View style={styles.tripDetailsHeader}>
                <Text style={styles.tripDetailsTitle}>Trip Details</Text>
                <TouchableOpacity style={styles.editDestinationsButton}>
                  <Image source={editIcon} style={styles.filterChipIcon} />
                  <Text style={styles.editDestinationsText}>Edit Destinations</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.locationPoints}>
                <View style={styles.locationPoint}>
                  <Image source={pickupIcon} style={styles.filterChipIcon} />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>Rio Jardim de Botanico, 18</Text>
                    {/* <TouchableOpacity style={styles.saveButton}>
                      <Ionicons name="location" size={14} color={theme.colors.primary} />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>

                <View style={styles.locationPoint}>
                  <Image source={destinationIcon} style={styles.filterChipIcon} />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>Loyal Heights</Text>
                    {/* <TouchableOpacity style={styles.saveButton}>
                      <Ionicons name="location" size={14} color={theme.colors.primary} />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Details Section - Only show when extended */}
          {isExtended && (
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Details</Text>
              {/* Trip Taker Section */}
              <View style={styles.section}>
                <View style={styles.selectContainer}>
                  <View style={styles.labelContainer}>
                    <View style={styles.labelBorderOverlay} />
                    <Text style={styles.label}>
                      Who Will Take the Trip?
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => {}}
                  >
                    <Text style={styles.selectText}>This trip is for myself</Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Section */}
              <View style={styles.section}>
                <View style={styles.selectContainer}>
                  <View style={styles.labelContainer}>
                    <View style={styles.labelBorderOverlay} />
                    <Text style={styles.label}>
                      Invoice|Payment
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => {}}
                  >
                    <View style={styles.paymentMethodContent}>
                      <Text style={styles.selectText}>Personal | </Text>
                      <Image
                        source={require('../../assets/images/mastercard.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.selectText}>**** 3956</Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Coupon Section */}
              <View style={styles.section}>
                <View style={styles.selectContainer}>
                  <View style={styles.labelContainer}>
                    <View style={styles.labelBorderOverlay} />
                    <Text style={styles.label}>
                      Coupon
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => {}}
                  >
                    <Text style={styles.selectText}>-20% Discount</Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.backActionButton} onPress={onClose}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          </View>
        </GestureDetector>
      )}

      {/* Connecting Driver Modal */}
        <ConnectingDriverModal
          visible={showConnecting}
          selectedOption={selectedOption}
          pickup={pickup}
          destination={destination}
          onCancel={handleCancelConnecting}
          onDriverAccepted={() => {}} // No longer needed - handled by Firebase
          onShowDriverArriving={handleDriverAcceptedContinue}
        />

      {/* Driver Accepted Modal */}
      <DriverAcceptedModal
        visible={showDriverAccepted}
        onContinue={handleDriverAcceptedContinue}
        onShowDriverArriving={handleDriverAcceptedContinue}
      />

      {/* Driver Arriving Modal */}
      <DriverArrivingModal
        visible={showDriverArriving}
        selectedOption={selectedOption}
        pickup={pickup}
        destination={destination}
        bookingId={bookingId || undefined}
        onClose={handleDriverArrivingClose}
        onCancelRide={handleCancelRide}
      />

      {/* Driver Declined Modal */}
      <DriverDeclinedModal
        visible={showDriverDeclined}
        onContinue={handleBookAgain}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.md, // Account for safe area
    maxHeight: screenHeight * 0.6,
    ...theme.shadows.lg,
  },
  extendedModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.md, // Account for safe area
    maxHeight: screenHeight,
    zIndex: 2,
    ...theme.shadows.lg,
  },
  mapContainer: {
    flex: 1,
  },
  pullUpHandle: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pullUpIndicator: {
    width: 100,
    height: 5,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
  },
  pullDownHandle: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pullDownIndicator: {
    width: 100,
    height: 5,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
  },
  popularityIndicator: {
    width: 150,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  popularityDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: '#B3261E',
  },
  popularityText: {
    fontSize: 12,
    color: '#B3261E',
  },
  content: {
    flex: 1,
  },
  mainSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 70,
    height: 70,
  },
  verificationBadge: {
    position: 'absolute',
    top: 0,
    left: -10,
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 1,
  },
  verificationText: {
    color: 'white',
    fontSize: 12,
  },
  driverName: {
    fontSize: 16,
    color: theme.colors.black,
  },
  ratingLanguagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: 14,
    color: theme.colors.black,
  },
  languageTags: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  languageText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  filterChipIcon: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
  },
  vehicleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  vehicleImageContainer: {
  },
  vehicleImage: {
    width: 133,
    height: 70,
  },
  vehicleModel: {
    fontSize: 14,
    marginBottom: theme.spacing.xs,
    color: theme.colors.black,
  },
  vehicleRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  vehicleRating: {
    fontSize: 14,
    color: theme.colors.black,
  },
  vehicleFeatures: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  additionalFeatures: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  pricingSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.sm,
  },
  pricingContainer: {
    borderTopWidth: 1,
    borderColor: theme.colors.gray200,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingContainerExtended: {
    borderBottomWidth: 1,
  },
  etatimeContainer: {

  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  companyName: {
    fontSize: 16,
    color: theme.colors.black,
  },
  estimateTimeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  estimatedTime: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.black,
    marginLeft: theme.spacing.xs,
  },
  priceContainer: {
    justifyContent: 'space-between',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: 12,
    color: '#B3261E',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 12,
    color: theme.colors.black,
    fontWeight: '700',
  },
  finalPriceContainer: {
    flexDirection: 'row',
  },
  finalPriceMain: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.black,
  },
  finalPriceDecimal: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.black,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  backActionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 45,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Trip Details Section
  tripDetailsSection: {
    paddingTop: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray200,
    paddingBottom: theme.spacing.md,
  },
  tripDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tripDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  editDestinationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  editDestinationsText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  locationPoints: {
    gap: theme.spacing.xs,
  },
  locationPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  pickupMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
    marginRight: theme.spacing.md,
  },
  destinationMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: theme.spacing.md,
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.black,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.sm,
  },
  saveButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  locationConnector: {
    width: 2,
    height: 10,
    backgroundColor: theme.colors.gray300,
    marginLeft: theme.spacing.xs + 1, // Align with marker center
  },
  // Details Section
  detailsSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  selectContainer: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 18,
    top: -8,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: theme.colors.gray500,
    paddingHorizontal: 2,
    fontWeight: '700',
  },
  labelBorderOverlay: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    top: 8,
  },
  selectButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: 1000,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    color: theme.colors.gray800,
    paddingVertical: theme.spacing.md,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 30,
    height: 20,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
});

const styles = createStyles(theme);
