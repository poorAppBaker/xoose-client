import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { DriverOption, DriverSelectionFilters, DriverSelectionSort } from '../../types/driver';
import { driverService } from '../../services/driverService';

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

  useEffect(() => {
    fetchDriverOptions();
  }, [fetchDriverOptions]);

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


  const handleOptionSelect = (option: DriverOption) => {
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      // Navigate back to dashboard with selected driver
      router.push({
        pathname: '/dashboard',
        params: {
          selectedDriver: JSON.stringify(selectedOption)
        }
      });
    }
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
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: item.driver.profileImage }}
              style={styles.profileImage}
            />
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationText}>10k+</Text>
            </View>
          </View>
          <Text style={styles.driverName}>{item.driver.name}</Text>
          <Text style={styles.rating}>★{item.driver.rating}</Text>
          <Text style={styles.languages}>{item.driver.languages.join(' ')}</Text>
        </View>

        {/* Vehicle Info */}
        <View style={styles.vehicleSection}>
          <Image
            source={{ uri: item.fare.vehicle.image }}
            style={styles.vehicleImage}
          />
          <Text style={styles.vehicleModel}>{item.fare.vehicle.model}</Text>
          <Text style={styles.vehicleRating}>★{item.fare.vehicle.rating}</Text>
          <View style={styles.vehicleDetails}>
            <Text style={styles.capacity}>👤{item.fare.vehicle.capacity}</Text>
            <Text style={styles.fuelType}>⛽</Text>
          </View>
        </View>

        {/* Fare Info */}
        <View style={styles.fareSection}>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={16} color={theme.colors.gray500} />
            <Text style={styles.estimatedTime}>{item.estimatedArrival} min</Text>
          </View>
          <Text style={styles.originalPrice}>{item.fare.currency}{item.fare.basePrice}</Text>
          <Text style={styles.discount}>-{item.fare.discount?.percentage}%</Text>
          <Text style={styles.finalPrice}>{item.fare.currency}{item.fare.finalPrice}</Text>
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
        <View style={styles.placeholder} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChips}>
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="person" size={16} color={theme.colors.gray600} />
          <Text style={styles.filterChipText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="language" size={16} color={theme.colors.gray600} />
          <Text style={styles.filterChipText}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="female" size={16} color={theme.colors.gray600} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="checkmark" size={16} color={theme.colors.gray600} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="time" size={16} color={theme.colors.gray600} />
          <Text style={styles.filterChipText}>20'</Text>
        </TouchableOpacity>
      </View>

      {/* Filter and Sort Options */}
      <View style={styles.filterSortRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={16} color={theme.colors.gray600} />
          <Text style={styles.filterButtonText}>More Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={16} color={theme.colors.gray600} />
          <Text style={styles.sortButtonText}>↑↓ Order</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    color: theme.colors.gray600,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  filterSortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sortButtonText: {
    fontSize: 14,
    color: theme.colors.gray600,
    fontWeight: '500',
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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    shadowColor: theme.colors.gray400,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.blue50,
  },
  driverSection: {
    flex: 1,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray300,
  },
  verificationText: {
    fontSize: 8,
    color: theme.colors.gray600,
    fontWeight: 'bold',
  },
  driverName: {
    fontSize: 14,
    color: theme.colors.gray600,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  rating: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  languages: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  vehicleSection: {
    flex: 1,
    alignItems: 'center',
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  vehicleModel: {
    fontSize: 12,
    color: theme.colors.gray600,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  vehicleRating: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  capacity: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  fuelType: {
    fontSize: 10,
  },
  fareSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  estimatedTime: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  originalPrice: {
    fontSize: 12,
    color: theme.colors.gray400,
    textDecorationLine: 'line-through',
    marginBottom: theme.spacing.xs,
  },
  discount: {
    fontSize: 10,
    color: theme.colors.green500,
    marginBottom: theme.spacing.xs,
  },
  finalPrice: {
    fontSize: 16,
    color: theme.colors.gray600,
    fontWeight: 'bold',
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
