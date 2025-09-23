import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import MapView from './MapView';

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

export default function TripHistoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  // Mock trip data - in real app this would come from props or state
  const tripData = {
    id: '12345',
    date: '2024-08-15',
    startTime: '09:00',
    endTime: '09:20',
    status: 'Completed',
    pickup: {
      address: 'Rio Jardim de Botanico, 18',
      coordinate: [-9.1427, 38.7223] as [number, number],
    },
    destination: {
      address: 'Loyal Heights',
      coordinate: [-9.1527, 38.7323] as [number, number],
    },
    driver: {
      name: 'Simon',
      rating: 4.5,
      profileImage: require('../../assets/images/profile-avatar.png'),
    },
    vehicle: {
      model: 'Opel Astra',
      rating: 4.5,
      capacity: 4,
    },
    fare: {
      basePrice: 14.12,
      finalPrice: 11.30,
      discount: { percentage: 20 },
      estimatedTime: 20,
    },
    tripTaker: 'Trip for myself',
    paymentMethod: {
      type: 'Personal',
      cardBrand: 'Mastercard',
      last4: '3956',
    },
    coupon: '-20% Discount',
    licensePlate: 'AB-32-CD',
  };

  const handleBack = () => {
    router.back();
  };

  const handleDownloadInvoice = () => {
    console.log('Download invoice');
  };

  const handleSupport = () => {
    console.log('Contact support');
  };

  const handleContinue = () => {
    router.replace('/(tabs)/dashboard');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
        </TouchableOpacity>
        <Text style={styles.title}>Trip #{tripData.id}</Text>
        <View style={styles.statusContainer}>
          <Image source={require('../../assets/images/icons/location-confirm.png')} style={styles.statusIcon} />
          <Text style={styles.statusText}>{tripData.status}</Text>
        </View>
      </View>

      {/* Trip Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryText}>Date: {tripData.date}</Text>
        <Text style={styles.summaryText}>Start: {tripData.startTime}</Text>
        <Text style={styles.summaryText}>End: {tripData.endTime}</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <MapView
          pickup={tripData.pickup}
          destination={tripData.destination}
          selectedLocation={undefined}
          showETALabels={false}
          calculateETAs={false}
          driverLocation={undefined}
          driverSpeed={0}
          pickupETA=""
          destinationETA=""
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Details Section */}
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
                <Text style={styles.locationText}>{tripData.pickup.address}</Text>
              </View>
            </View>

            <View style={styles.locationPoint}>
              <Image source={destinationIcon} style={styles.filterChipIcon} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>{tripData.destination.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver and Vehicle Section */}
        <View style={styles.mainSection}>
          {/* Driver Section */}
          <View style={styles.driverSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.verificationBadge}>
                <Image source={subtractWhiteIcon} style={styles.filterChipIcon} />
                <Text style={styles.verificationText}>10k+</Text>
              </View>
              <Image
                source={tripData.driver.profileImage}
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.driverName}>{tripData.driver.name}</Text>
            <View style={styles.ratingLanguagesContainer}>
              <View style={styles.ratingContainer}>
                <Image source={starIcon} style={styles.filterChipIcon} />
                <Text style={styles.rating}>{tripData.driver.rating}</Text>
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
            <Text style={styles.vehicleModel}>{tripData.vehicle.model}</Text>
            <View style={styles.vehicleRatingContainer}>
              <View style={styles.vehicleRatingContainer}>
                <Image source={starIcon} style={styles.filterChipIcon} />
                <Text style={styles.vehicleRating}>{tripData.vehicle.rating}</Text>
              </View>
              <View style={styles.vehicleFeatures}>
                <View style={styles.feature}>
                  <Image source={userIcon} style={[styles.filterChipIcon, { tintColor: theme.colors.blue500 }]} />
                  <Text style={styles.featureText}>{tripData.vehicle.capacity}</Text>
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

        {/* Pricing Section */}
        <View style={styles.pricingContainer}>
          {/* License Plate and Company */}
          <View style={styles.licensePlateSection}>
            <View style={styles.licensePlateBadge}>
              <Text style={styles.licensePlateText}>{tripData.licensePlate}</Text>
            </View>
            <Text style={styles.companyName}>Company Name</Text>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <View style={styles.priceContainer}>
              {tripData.fare.discount && tripData.fare.discount.percentage > 0 && (
                <View style={styles.discountContainer}>
                  <Text style={styles.originalPrice}>€{tripData.fare.basePrice.toFixed(2)}</Text>
                  <Text style={styles.discountText}>-{tripData.fare.discount.percentage}%</Text>
                </View>
              )}
              <View style={styles.finalPriceContainer}>
                <Text style={styles.finalPriceMain}>€{Math.floor(tripData.fare.finalPrice)}</Text>
                <Text style={styles.finalPriceDecimal}>.{((tripData.fare.finalPrice % 1) * 100).toFixed(0).padStart(2, '0')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailFieldContainer}>
            <Text style={styles.detailsTitle}>Who Will Take the Trip</Text>
            <View style={styles.detailField}>
              <Text style={styles.fieldText}>{tripData.tripTaker}</Text>
            </View>
          </View>

          <View style={styles.detailFieldContainer}>
            <Text style={styles.detailsTitle}>Profile & Payment</Text>
            <View style={styles.detailField}>
              <Text style={styles.fieldText}>{tripData.paymentMethod.type} |</Text>
              <Image source={require('../../assets/images/mastercard.png')} style={styles.cardIcon} />
              <Text style={styles.fieldText}>**** {tripData.paymentMethod.last4}</Text>
            </View>
          </View>

          <View style={styles.detailFieldContainer}>
            <Text style={styles.detailsTitle}>Coupon</Text>
            <View style={styles.detailField}>
              <Text style={styles.fieldText}>{tripData.coupon}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Section */}
        <View style={styles.invoiceSection}>
          <Text style={styles.invoiceTitle}>Invoice</Text>
          <Text style={styles.invoiceSubtitle}>Sent to your email <Text style={styles.emailText}>john.snow@gmail.com</Text></Text>
          
          <TouchableOpacity style={styles.downloadInvoiceButton} onPress={handleDownloadInvoice}>
            <Ionicons name="download" size={20} color={theme.colors.blue500} />
            <Text style={styles.downloadInvoiceText}>Download Invoice</Text>
          </TouchableOpacity>

          <Text style={styles.supportTitle}>Any issues with the trip?</Text>
          <Text style={styles.supportSubtitle}>Contact support to get help</Text>
          
          <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
            <Text style={styles.supportButtonText}>Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.backButtonAction} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 20,
    height: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  mapSection: {
    height: 150,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveButtonText: {
    fontSize: 14,
    color: theme.colors.blue500,
    fontWeight: '500',
  },
  mainSection: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
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
  profileImage: {
    width: 70,
    height: 70,
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
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  additionalFeatures: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChipIcon: {
    width: 12,
    height: 14,
    resizeMode: 'contain',
  },
  pricingContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  licensePlateSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  licensePlateBadge: {
    backgroundColor: theme.colors.black,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  licensePlateText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  companyName: {
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
    marginTop: theme.spacing.xs,
  },
  pricingSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#000000',
    fontWeight: '700',
  },
  finalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  finalPriceMain: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  finalPriceDecimal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
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
  invoiceSection: {
    paddingBottom: theme.spacing.md,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: theme.spacing.xs,
  },
  invoiceSubtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: theme.spacing.lg,
  },
  emailText: {
    fontWeight: 'bold',
  },
  downloadInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  downloadInvoiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: theme.spacing.xs,
  },
  supportSubtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: theme.spacing.md,
  },
  supportButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.md,
    gap: 15,
  },
  backButtonAction: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: theme.colors.blue500,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
