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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { DriverOption } from '../../types/driver';
import MapView from './MapView';
import WhereToWhereSection from './WhereToWhereSection';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConnectingDriverModalProps {
  visible: boolean;
  selectedOption: DriverOption | null;
  pickup: any;
  destination: any;
  onCancel: () => void;
  onDriverAccepted: () => void;
}

export default function ConnectingDriverModal({
  visible,
  selectedOption,
  pickup,
  destination,
  onCancel,
  onDriverAccepted,
}: ConnectingDriverModalProps) {
  const { theme } = useTheme();
  const [isExtended, setIsExtended] = useState(false);
  const styles = createStyles(theme);

  // Simulate driver acceptance after 3 seconds - MUST be before early return
  useEffect(() => {
    if (visible) {
      console.log('🔄 ConnectingDriverModal visible - starting 3-second timer');
      const timer = setTimeout(() => {
        console.log('⏰ 30 seconds passed - calling onDriverAccepted');
        onDriverAccepted();
      }, 30000); // 3 seconds for demo purposes

      return () => clearTimeout(timer);
    }
  }, [visible, onDriverAccepted]);

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
              pickup.coordinate[0] - 0.01,
              pickup.coordinate[1] + 0.01
            ]}
            driverSpeed={35}
            pickupETA="2 min"
            destinationETA="Arriving by 9:20 AM"
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

      {/* Modal Content */}
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Connecting to your Driver</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Driver and Vehicle Info */}
      <View style={styles.infoSection}>
        {/* Driver Section */}
        <View style={styles.driverSection}>
          <View style={styles.driverImageContainer}>
            <View style={styles.driverBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
              <Text style={styles.badgeText}>10k+</Text>
            </View>
            <Image
              source={require('../../assets/images/profile-avatar.png')}
              style={styles.driverImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.rating}>{driver.rating}</Text>
          </View>
          <View style={styles.languages}>
            {driver.languages?.map((lang, index) => (
              <View key={index} style={styles.languageTag}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            )) || (
              <>
                <View style={styles.languageTag}>
                  <Text style={styles.languageText}>PT</Text>
                </View>
                <View style={styles.languageTag}>
                  <Text style={styles.languageText}>EN</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.vehicleSection}>
          <View style={styles.vehicleImageContainer}>
            <Image
              source={require('../../assets/images/car.png')}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.vehicleModel}>{fare.vehicle.model}</Text>
          <View style={styles.vehicleRatingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.vehicleRating}>{fare.vehicle.rating}</Text>
          </View>
          <View style={styles.vehicleFeatures}>
            <View style={styles.feature}>
              <Ionicons name="person" size={14} color={theme.colors.primary} />
              <Text style={styles.featureText}>{fare.vehicle.capacity}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="car" size={14} color={theme.colors.primary} />
              <Text style={styles.featureText}>{fare.vehicle.fuelType}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="paw" size={14} color={theme.colors.primary} />
            </View>
            <View style={styles.feature}>
              <Ionicons name="accessibility" size={14} color={theme.colors.primary} />
            </View>
          </View>
        </View>
      </View>

      {/* Trip Summary */}
      <View style={styles.tripSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="time" size={16} color={theme.colors.gray600} />
          <Text style={styles.summaryText}>{fare.estimatedTime} Min</Text>
        </View>
        <Text style={styles.companyName}>Company Name</Text>
      </View>

      {/* Pricing */}
      <View style={styles.pricingSection}>
        {fare.discount && fare.discount.percentage > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.originalPrice}>€{fare.basePrice.toFixed(2)}</Text>
            <Text style={styles.discountText}>-{fare.discount.percentage}%</Text>
          </View>
        )}
        <Text style={styles.finalPrice}>€{fare.finalPrice.toFixed(2)}</Text>
      </View>

      {/* Trip Details Section - Only show when extended */}
      {isExtended && (
        <View style={styles.tripDetailsSection}>
          <View style={styles.tripDetailsHeader}>
            <Text style={styles.tripDetailsTitle}>Trip Details</Text>
            <TouchableOpacity style={styles.editDestinationsButton}>
              <Ionicons name="pencil" size={16} color={theme.colors.primary} />
              <Text style={styles.editDestinationsText}>Edit Destinations</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.locationPoints}>
            <View style={styles.locationPoint}>
              <View style={styles.pickupMarker} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>Rio Jardim de Botanico, 18</Text>
                <TouchableOpacity style={styles.saveButton}>
                  <Ionicons name="location" size={14} color={theme.colors.primary} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationPoint}>
              <View style={styles.destinationMarker} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>Loyal Heights</Text>
                <TouchableOpacity style={styles.saveButton}>
                  <Ionicons name="location" size={14} color={theme.colors.primary} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Details Section - Only show when extended */}
      {isExtended && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Who Will Take the Trip</Text>
          <View style={styles.detailField}>
            <Text style={styles.fieldText}>Trip for myself</Text>
          </View>
          
          <Text style={styles.detailsTitle}>Profile & Payment</Text>
          <View style={styles.detailField}>
            <Text style={styles.fieldText}>Personal |</Text>
            <Image source={require('../../assets/images/mastercard.png')} style={styles.cardIcon} />
            <Text style={styles.fieldText}>**** 3956</Text>
          </View>
          
          <Text style={styles.detailsTitle}>Coupon</Text>
          <View style={styles.detailField}>
            <Text style={styles.fieldText}>-20% Discount</Text>
          </View>
        </View>
      )}

      {/* Loading Section */}
      <View style={styles.loadingSection}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Please wait for the driver's acceptance.</Text>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel Ride</Text>
      </TouchableOpacity>
      </View>
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
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: theme.spacing.md,
  },
  driverImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
  },
  driverBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  driverImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rating: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginLeft: theme.spacing.xs,
  },
  languages: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  languageTag: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  languageText: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  vehicleSection: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: theme.spacing.md,
  },
  vehicleImageContainer: {
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  vehicleImage: {
    width: 90,
    height: 70,
    borderRadius: theme.borderRadius.sm,
  },
  vehicleModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  vehicleRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  vehicleRating: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginLeft: theme.spacing.xs,
  },
  vehicleFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.gray600,
  },
  tripSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray200,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summaryText: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
  },
  companyName: {
    fontSize: 12,
    color: theme.colors.gray500,
    textDecorationLine: 'underline',
  },
  pricingSection: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  originalPrice: {
    fontSize: 16,
    color: '#FF6B6B',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 14,
    color: theme.colors.green500,
    fontWeight: 'bold',
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Trip Details Section
  tripDetailsSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
    paddingLeft: theme.spacing.md,
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
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  detailField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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

