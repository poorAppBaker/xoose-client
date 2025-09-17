import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { DriverOption, DriverSelectionFilters, DriverSelectionSort } from '../../types/driver';
import { driverService } from '../../services/driverService';
import BookTripModal from '../../components/maps/BookTripModal';

// Import icon images
const userIcon = require('../../assets/images/icons/user.png');
const languageIcon = require('../../assets/images/icons/language.png');
const positionIcon = require('../../assets/images/icons/position.png');
const subtractIcon = require('../../assets/images/icons/subtract.png');
const clockIcon = require('../../assets/images/icons/clock.png');
const filterIcon = require('../../assets/images/icons/filter.png');
const sortIcon = require('../../assets/images/icons/sort.png');

interface LocationItem {
  coordinate: [number, number];
  title: string;
  subtitle: string;
  id?: string;
}

export default function ChooseYourOptionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const styles = createStyles(theme);

  // Debug re-renders
  console.log('🔄 ChooseYourOptionScreen re-rendered');

  // Parse route parameters and memoize them
  const pickup: LocationItem = useMemo(() =>
    params.pickup ? JSON.parse(params.pickup as string) : null,
    [params.pickup]
  );
  const destination: LocationItem = useMemo(() =>
    params.destination ? JSON.parse(params.destination as string) : null,
    [params.destination]
  );

  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DriverOption | null>(null);
  const [showBookTripModal, setShowBookTripModal] = useState(false);
  const [filters, setFilters] = useState<DriverSelectionFilters>({
    passengerCount: 1,
    verifiedOnly: false,
    maxWaitTime: 20
  });
  const [sort, setSort] = useState<DriverSelectionSort>({
    field: 'arrivalTime',
    order: 'asc'
  });

  // Memoize filters and sort to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters.passengerCount, filters.verifiedOnly, filters.maxWaitTime]);
  const memoizedSort = useMemo(() => sort, [sort.field, sort.order]);

  const fetchDriverOptions = useCallback(async () => {
    if (!pickup || !destination) return;

    setLoading(true);
    try {
      console.log('Fetching driver options with coordinates:', {
        pickup: pickup.coordinate,
        destination: destination.coordinate
      });

      const options = await driverService.getAvailableDrivers(
        pickup.coordinate,
        destination.coordinate,
        memoizedFilters,
        memoizedSort
      );

      console.log(`Received ${options.length} driver options`);
      setDriverOptions(options);

      // If no options found, show empty array (no mock data)
      if (options.length === 0) {
        console.log('No driver options found');
      }
    } catch (error) {
      console.error('Error fetching driver options:', error);
      // Set empty array on error (no mock data)
      setDriverOptions([]);
    } finally {
      setLoading(false);
    }
  }, [pickup, destination, memoizedFilters, memoizedSort]);

  useEffect(() => {
    fetchDriverOptions();
  }, [fetchDriverOptions]);

  const handleOptionSelect = (option: DriverOption) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Show Book Trip modal instead of navigating
      setShowBookTripModal(true);
    }
  };

  const handleBookNow = () => {
    // Close modal and navigate back to dashboard
    setShowBookTripModal(false);
    router.push({
      pathname: '/dashboard',
      params: {
        selectedDriver: JSON.stringify(selectedOption)
      }
    });
  };

  const handleCloseBookTripModal = () => {
    setShowBookTripModal(false);
  };

  const handleBack = () => {
    router.back();
  };

  const renderDriverOption = ({ item }: { item: DriverOption }) => {
    const isSelected = selectedOption?.driver.id === item.driver.id;

    return (
      <TouchableOpacity
        style={[styles.optionCard, isSelected && styles.selectedCard]}
        onPress={() => handleOptionSelect(item)}
      >
        {/* Driver Info Section */}
        <View style={styles.driverSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark" size={8} color="white" />
              <Text style={styles.verificationText}>10k+</Text>
            </View>
            <Image
              source={require('../../assets/images/profile-avatar.png')}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.driverName}>{item.driver.name}</Text>
          <View style={styles.ratingLanguagesContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{item.driver.rating}</Text>
            </View>
            <View style={styles.languageTags}>
              <View style={styles.languageTag}>
                <Text style={styles.languageText}>PT</Text>
              </View>
              <View style={styles.languageTag}>
                <Text style={styles.languageText}>EN</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Info Section */}
        <View style={styles.vehicleSection}>
          <Image
            source={require('../../assets/images/car.png')}
            style={styles.vehicleImage}
          />
          <Text style={styles.vehicleModel}>{item.fare.vehicle.model}</Text>
          <View style={styles.vehicleRatingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.vehicleRating}>{item.fare.vehicle.rating}</Text>
          </View>
          <View style={styles.vehicleFeatures}>
            <View style={styles.feature}>
              <Ionicons name="person" size={12} color={theme.colors.primary} />
              <Text style={styles.featureText}>{item.fare.vehicle.capacity}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="car" size={12} color={theme.colors.primary} />
            </View>
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={16} color={theme.colors.primary} />
            <Text style={styles.estimatedTime}>{item.estimatedArrival} min</Text>
          </View>
          {item.fare.discount && item.fare.discount.percentage > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.originalPrice}>€{item.fare.basePrice.toFixed(2)}</Text>
              <Text style={styles.discountText}>-{item.fare.discount.percentage}%</Text>
            </View>
          )}
          <Text style={styles.finalPrice}>€{item.fare.finalPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading or error if no pickup/destination
  if (!pickup || !destination) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose your Option</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Missing pickup or destination information</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose your Option</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChips}>
        <TouchableOpacity style={styles.filterChip}>
          <Image source={userIcon} style={styles.filterChipIcon} />
          <Text style={styles.filterChipText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Image source={languageIcon} style={styles.filterChipIcon} />
          <Text style={styles.filterChipText}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Image source={positionIcon} style={styles.filterChipIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Image source={subtractIcon} style={styles.filterChipIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Image source={clockIcon} style={styles.filterChipIcon} />
          <Text style={styles.filterChipText}>20'</Text>
        </TouchableOpacity>
      </View>

      {/* Filter and Sort Options */}
      <View style={styles.filterSortRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Image source={filterIcon} style={styles.filterChipIcon} />
          <Text style={styles.filterButtonText}>More Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <Image source={sortIcon} style={styles.filterChipIcon} />
          <Text style={styles.sortButtonText}>Order</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Options List */}
      <FlatList
        data={driverOptions}
        renderItem={renderDriverOption}
        keyExtractor={(item) => item.driver.id}
        style={styles.optionsList}
        contentContainerStyle={styles.optionsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && driverOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={theme.colors.gray400} />
              <Text style={styles.emptyTitle}>No Drivers Available</Text>
              <Text style={styles.emptySubtitle}>
                No drivers are currently available for this route.{'\n'}
                Please try again later or contact support.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.backActionButton} onPress={handleBack}>
          <Text style={styles.backActionButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedOption}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Book Trip Modal */}
      <BookTripModal
        visible={showBookTripModal}
        selectedOption={selectedOption}
        pickup={pickup}
        destination={destination}
        onClose={handleCloseBookTripModal}
        onBookNow={handleBookNow}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    color: theme.colors.gray600,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  filterChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  filterChipIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.blue500,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sortButtonText: {
    fontSize: 14,
    color: theme.colors.blue500,
    fontWeight: '700',
  },
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.blue50,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: theme.spacing.sm,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verificationBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
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
    fontSize: 10,
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
  languageTags: {
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
    paddingHorizontal: theme.spacing.sm,
  },
  vehicleImage: {
    width: 130,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
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
    gap: theme.spacing.sm,
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
  pricingSection: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  estimatedTime: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  backActionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  backActionButtonText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.blue500,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '500',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.gray300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.gray600,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.blue500,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray600,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
