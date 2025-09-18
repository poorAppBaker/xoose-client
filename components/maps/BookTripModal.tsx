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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { DriverOption } from '../../types/driver';
import MapView from './MapView';
import WhereToWhereSection from './WhereToWhereSection';
import ConnectingDriverModal from './ConnectingDriverModal';
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

interface BookTripModalProps {
  visible: boolean;
  selectedOption: DriverOption | null;
  pickup: any;
  destination: any;
  onClose: () => void;
  onBookNow: () => void;
}

export default function BookTripModal({
  visible,
  selectedOption,
  pickup,
  destination,
  onClose,
  onBookNow,
}: BookTripModalProps) {
  const { theme } = useTheme();
  const [showConnecting, setShowConnecting] = useState(false);
  const [showDriverAccepted, setShowDriverAccepted] = useState(false);
  const [showDriverTimeout, setShowDriverTimeout] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount - MUST be before early return
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!visible || !selectedOption) {
    return null;
  }

  const handleBookNow = () => {
    console.log('🚀 Book Now clicked - showing ConnectingDriverModal');
    setShowConnecting(true);
    // Call the original onBookNow callback
    // onBookNow();
  };

  const handlePullUp = () => {
    console.log('📱 Modal pulled up - showing extended view');
    setIsExtended(true);
  };

  const handlePullDown = () => {
    console.log('📱 Modal pulled down - showing unextended view');
    setIsExtended(false);
  };

  const handleCancelConnecting = () => {
    setShowConnecting(false);
  };

  const handleDriverAccepted = () => {
    console.log('✅ Driver accepted - showing DriverAcceptedModal');
    setShowConnecting(false);
    setShowDriverAccepted(true);

    // Set 30-second timeout to show timeout modal
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ 30 seconds passed - showing DriverTimeoutModal');
      setShowDriverAccepted(false);
      setShowDriverTimeout(true);
    }, 30000); // 30 seconds
  };

  const handleDriverAcceptedContinue = () => {
    setShowDriverAccepted(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Here you would typically navigate to the next screen or close the modal
    onClose();
  };

  const handleDriverTimeoutContinue = () => {
    setShowDriverTimeout(false);
    // Return to driver selection
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
      {/* Map Section - Only show when not extended */}
      {!isExtended && (
        <View style={styles.mapContainer}>
          <MapView
            pickup={pickup}
            destination={destination}
            selectedLocation={undefined}
            showETALabels={true}
            calculateETAs={true}
            driverLocation={driver.currentLocation?.coordinate || [
              pickup.coordinate[0] - 0.01, // Mock location slightly west of pickup
              pickup.coordinate[1] + 0.01  // Mock location slightly north of pickup
            ]}
            driverSpeed={35} // Default city speed in km/h - could be enhanced with real driver speed
            pickupETA="2 min" // Fallback values
            destinationETA="Arriving by 9:20 AM"
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
        <View style={isExtended ? styles.extendedModal : styles.modal}>

          {/* Pull-up Handle - Only show when not extended */}
          {!isExtended && (
            <TouchableOpacity style={styles.pullUpHandle} onPress={handlePullUp}>
              <View style={styles.pullUpIndicator} />
            </TouchableOpacity>
          )}

          {/* Pull-down Handle - Only show when extended */}
          {isExtended && (
            <TouchableOpacity style={styles.pullDownHandle} onPress={handlePullDown}>
              <View style={styles.pullDownIndicator} />
            </TouchableOpacity>
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
                  <Text style={styles.estimatedTime}>{fare.estimatedTime} min</Text>
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
      )}

      {/* Connecting Driver Modal */}
      <ConnectingDriverModal
        visible={showConnecting}
        selectedOption={selectedOption}
        pickup={pickup}
        destination={destination}
        onCancel={handleCancelConnecting}
        onDriverAccepted={handleDriverAccepted}
      />

      {/* Driver Accepted Modal */}
      <DriverAcceptedModal
        visible={showDriverAccepted}
        onContinue={handleDriverAcceptedContinue}
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
    backgroundColor: '#FFFFFF',
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
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40, // Account for safe area
  },
  mapContainer: {
    flex: 1,
  },
  pullUpHandle: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  pullUpIndicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
  },
  pullDownHandle: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  pullDownIndicator: {
    width: 40,
    height: 4,
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
  content: {
    flex: 1,
  },
  mainSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: theme.spacing.sm,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
    paddingLeft: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verificationBadge: {
    position: 'absolute',
    top: 0,
    left: -15,
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 1,
  },
  verificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  vehicleImage: {
    width: 100,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginTop: 4,
    marginBottom: 11,
  },
  vehicleRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  vehicleRating: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 14,
    color: theme.colors.black,
  },
  estimateTimeIcon: {
    width: 24,
    height: 24,
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
