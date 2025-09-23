import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import DriverAcceptedModal from './DriverAcceptedModal';
import DriverTimeoutModal from './DriverTimeoutModal';

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

interface ConnectingDriverModalProps {
  visible: boolean;
  selectedOption: DriverOption | null;
  pickup: any;
  destination: any;
  onCancel: () => void;
  onDriverAccepted: () => void;
  onShowDriverArriving?: () => void; // Callback when driver accepted and should show arriving modal
}

export default function ConnectingDriverModal({
  visible,
  selectedOption,
  pickup,
  destination,
  onCancel,
  onDriverAccepted,
  onShowDriverArriving,
}: ConnectingDriverModalProps) {
  const { theme } = useTheme();
  const [isExtended, setIsExtended] = useState(false);
  
  // Internal modal states
  const [showDriverAccepted, setShowDriverAccepted] = useState(false);
  const [showDriverTimeout, setShowDriverTimeout] = useState(false);
  
  // ETA calculation states
  const [calculatedPickupETA, setCalculatedPickupETA] = useState<string>('');
  const [calculatedDestinationETA, setCalculatedDestinationETA] = useState<string>('');

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

  const styles = createStyles(theme);

  // Simulate driver acceptance after 30 seconds - MUST be before early return
  // Note: Driver acceptance is now handled by Firebase real-time updates
  // No automatic timer needed - the parent component will call onDriverAccepted
  // when the driver actually accepts the booking in Firebase

  // Simulate driver timeout after 60 seconds if not accepted
  useEffect(() => {
    if (visible && !showDriverAccepted) {
      console.log('🔄 ConnectingDriverModal visible - starting 60-second timeout timer');
      const timer = setTimeout(() => {
        console.log('⏰ 60 seconds passed - showing DriverTimeoutModal');
        setShowDriverTimeout(true);
      }, 60000); // 60 seconds

      return () => clearTimeout(timer);
    }
  }, [visible, showDriverAccepted]);

  // Handle driver accepted
  const handleDriverAccepted = () => {
    setShowDriverAccepted(true);
  };

  // Handle driver accepted continue
  const handleDriverAcceptedContinue = () => {
    setShowDriverAccepted(false);
    if (onShowDriverArriving) {
      onShowDriverArriving();
    }
  };

  // Handle driver timeout continue
  const handleDriverTimeoutContinue = () => {
    setShowDriverTimeout(false);
    onCancel();
  };

  // Calculate ETAs when driver location or speed changes - MUST be before early return
  useEffect(() => {
    if (!visible || !selectedOption) {
      return;
    }

    const { driver } = selectedOption;
    if (!driver.currentLocation?.coordinate || !pickup || !destination) {
      return;
    }

    const driverLocation = driver.currentLocation.coordinate;
    const driverSpeed = 35; // Default city speed in km/h

    // Calculate distances
    const driverToPickupDist = calculateHaversineDistance(driverLocation, pickup.coordinate);
    const pickupToDestDist = calculateHaversineDistance(pickup.coordinate, destination.coordinate);

    // Calculate ETAs
    const pickupETA = calculateETA(driverToPickupDist, driverSpeed);
    const destinationETA = calculateETA(pickupToDestDist, driverSpeed);

    setCalculatedPickupETA(pickupETA);
    setCalculatedDestinationETA(`Arriving by ${calculateArrivalTime(Math.ceil((driverToPickupDist + pickupToDestDist) / driverSpeed * 60))}`);

    console.log('⏰ ConnectingDriverModal calculated ETAs:', {
      driverToPickupDist: `${driverToPickupDist.toFixed(2)} km`,
      pickupToDestDist: `${pickupToDestDist.toFixed(2)} km`,
      pickupETA,
      destinationETA
    });
  }, [visible, selectedOption, pickup, destination]);

  if (!visible || !selectedOption) {
    return null;
  }

  const { driver, fare } = selectedOption;

  const handlePullUp = () => {
    console.log('📱 ConnectingDriverModal pulled up - showing extended view');
    setIsExtended(true);
  };

  const handlePullDown = () => {
    console.log('📱 ConnectingDriverModal pulled down - showing unextended view');
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
            showLocationTitles={true}
            calculateETAs={true}
            showDriverCar={false}
            driverLocation={driver.currentLocation?.coordinate || [
              pickup.coordinate[0] - 0.01,
              pickup.coordinate[1] + 0.01
            ]}
            driverSpeed={35}
            // pickupETA and destinationETA will be calculated automatically by MapView
          />

          {/* From → To Section */}
          <WhereToWhereSection
            pickup={pickup}
            destination={destination}
            onPickupPress={() => { }}
            onDestinationPress={() => { }}
            onAddStop={() => { }}
          />
        </View>
      )}

      {/* Modal Content - Hide when internal modals are showing */}
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

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {!isExtended &&
                <TouchableOpacity style={styles.backButton} onPress={onCancel}>
                  <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              }
              <Text style={styles.title}>Connecting to your Driver</Text>
            </View>
          </View>

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
                <Text style={styles.estimatedTime}>{calculatedPickupETA || `${fare.estimatedTime} min`}</Text>
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
              <View style={styles.detailFieldContainer}>
                <Text style={styles.detailsTitle}>Who Will Take the Trip</Text>
                <View style={styles.detailField}>
                  <Text style={styles.fieldText}>Trip for myself</Text>
                </View>
              </View>

              <View style={styles.detailFieldContainer}>
                <Text style={styles.detailsTitle}>Profile & Payment</Text>
                <View style={styles.detailField}>
                  <Text style={styles.fieldText}>Personal |</Text>
                  <Image source={require('../../assets/images/mastercard.png')} style={styles.cardIcon} />
                  <Text style={styles.fieldText}>**** 3956</Text>
                </View>
              </View>

              <View style={styles.detailFieldContainer}>
                <Text style={styles.detailsTitle}>Coupon</Text>
                <View style={styles.detailField}>
                  <Text style={styles.fieldText}>-20% Discount</Text>
                </View>
              </View>
            </View>
          )}

          {/* Loading Section */}
          {!isExtended && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Please wait for the driver's acceptance.</Text>
            </View>
          )}

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        </View>
        </GestureDetector>
      )}

      {/* Driver Accepted Modal */}
      <DriverAcceptedModal
        visible={showDriverAccepted}
        onContinue={handleDriverAcceptedContinue}
        onShowDriverArriving={handleDriverAcceptedContinue}
      />

      {/* Driver Timeout Modal */}
      <DriverTimeoutModal
        visible={showDriverTimeout}
        onContinue={handleDriverTimeoutContinue}
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
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
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
    paddingTop: theme.spacing.lg,
    paddingBottom: 10, // Account for safe area
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
    marginBottom: theme.spacing.lg,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing.xs,
    backgroundColor: '#B3261E',
  },
  popularityText: {
    fontSize: 12,
    color: '#B3261E',
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
    width: 16,
    height: 16,
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
    marginTop: theme.spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.black,
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
  pricingSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing.sm,
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
  loadingSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  loadingSpinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ scale: 3 }], // Make spinner 2x bigger
  },
  loadingText: {
    width: 300,
    fontSize: 30,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Trip Details Section
  tripDetailsSection: {
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray200,
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
  },
  locationPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
    height: 20,
    backgroundColor: theme.colors.gray300,
    marginLeft: theme.spacing.md + 5, // Align with marker center
    marginBottom: theme.spacing.sm,
  },
  // Details Section
  detailsSection: {
    marginBottom: theme.spacing.lg,
  },
  detailFieldContainer: {
    borderBottomWidth: 1,
    borderColor: theme.colors.gray200,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  detailField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  fieldText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  cardIcon: {
    width: 24,
    height: 16,
    resizeMode: 'contain',
  },
});

