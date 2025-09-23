import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
// Using Google Places API for better search results
import Input from '../common/Input';
import Modal from '../common/Modal';
import recentLocationsService, { RecentLocation } from '../../services/recentLocationsService';
import googlePlacesService, { GooglePlaceResult } from '../../services/googlePlacesService';
import useAuthStore from '../../store/authStore';

const { width } = Dimensions.get('window');

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  latitude?: number;
  longitude?: number;
  placeId?: string; // Google Places ID
}

interface PickupModalProps {
  visible: boolean;
  onClose?: () => void;
  onLocationSelect?: (location: LocationItem) => void;
  isFullScreen?: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onMapMove?: (coordinate: [number, number]) => void;
}

export default function PickupModal({
  visible,
  onClose,
  onLocationSelect,
  isFullScreen = false,
  onFullScreenChange,
  onMapMove
}: PickupModalProps) {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState<'recents' | 'myPlaces' | 'search'>('recents');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const styles = createStyles(theme);

  // Fetch recent pickup locations from Firestore
  const fetchRecentLocations = async () => {
    if (!user?._id) return;

    setIsLoadingRecents(true);
    try {
      const recentData = await recentLocationsService.getRecentPickupLocations(user._id, 3);
      const locationItems: LocationItem[] = recentData.map(location => ({
        id: location.id,
        title: location.title,
        subtitle: location.subtitle,
        latitude: location.coordinate[1],
        longitude: location.coordinate[0]
      }));
      setRecentLocations(locationItems);
    } catch (error) {
      console.error('Error fetching recent pickup locations:', error);
      setRecentLocations([]);
    } finally {
      setIsLoadingRecents(false);
    }
  };

  const myPlaces: LocationItem[] = [
    { id: '1', title: 'Home', subtitle: '123 Oak Street, San Francisco' },
    { id: '2', title: 'Work', subtitle: '456 Pine Avenue, San Francisco' },
    { id: '3', title: 'Gym', subtitle: '789 Fitness Center, San Francisco' },
  ];

  // Search for locations using Google Places API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Google Places search for pickup:', query);

    try {
      // Use Google Places API for better search results
      const googleResults = await googlePlacesService.searchPlaces(query);
      
      console.log('📡 Google Places API Response:', googleResults);
      console.log('📊 Raw results count:', googleResults.length);

      const results: LocationItem[] = googleResults.map((place: GooglePlaceResult, index: number) => {
        return {
          id: `search_${index}`,
          title: place.name.trim(),
          subtitle: place.formatted_address.trim(),
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          placeId: place.place_id, // Store Google Places ID
        };
      });

      console.log('🔄 Mapped results count:', results.length);

      // Remove duplicates but be less aggressive - only remove exact matches
      let uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.placeId === result.placeId)
      );

      console.log('🔍 After duplicate removal:', uniqueResults.length);

      // Sort results by relevance (rating and specificity)
      uniqueResults.sort((a, b) => {
        // Prioritize results with more specific location information
        const aSpecificity = a.subtitle.split(',').length;
        const bSpecificity = b.subtitle.split(',').length;
        
        if (aSpecificity !== bSpecificity) {
          return bSpecificity - aSpecificity; // More specific first
        }
        
        // If same specificity, prefer shorter titles (more likely to be exact matches)
        return a.title.length - b.title.length;
      });

      console.log('✅ Final Google Places search results:', uniqueResults);
      console.log('📊 Final results count:', uniqueResults.length);
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('❌ Google Places API error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.trim()) {
      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        searchLocations(searchQuery);
      }, 300); // 300ms debounce
      setSearchTimeout(timeout);
    } else {
      setSearchResults([]);
    }

    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]);

  // Fetch recent locations when modal becomes visible
  useEffect(() => {
    if (visible && activeTab === 'recents') {
      fetchRecentLocations();
    }
  }, [visible, activeTab, user?._id]);

  const getCurrentData = () => {
    if (activeTab === 'search') {
      return searchResults;
    }
    return activeTab === 'recents' ? recentLocations : myPlaces;
  };

  const handleLocationSelect = async (item: LocationItem) => {
    // Google Places API already provides coordinates, so we can use them directly
    if (item.latitude && item.longitude) {
      // Move map to the selected location
      if (onMapMove) {
        onMapMove([item.longitude, item.latitude]);
      }
      
      if (onLocationSelect) {
        onLocationSelect(item);
      }
      if (onClose) {
        onClose();
      }
      return;
    }

    // If coordinates are missing but we have a placeId, get details from Google Places
    if (item.placeId) {
      console.log('📍 Getting place details for pickup:', item.title);
      try {
        const placeDetails = await googlePlacesService.getPlaceDetails(item.placeId);
        
        if (placeDetails) {
          const updatedItem = {
            ...item,
            latitude: placeDetails.geometry.location.lat,
            longitude: placeDetails.geometry.location.lng,
            title: placeDetails.name,
            subtitle: placeDetails.formatted_address,
          };
          
          // Move map to the selected location
          if (onMapMove) {
            onMapMove([updatedItem.longitude, updatedItem.latitude]);
          }
          
          if (onLocationSelect) {
            onLocationSelect(updatedItem);
          }
          if (onClose) {
            onClose();
          }
          return;
        }
      } catch (error) {
        console.error('❌ Error getting place details:', error);
      }
    }
    
    // Fallback: search for it
    console.log('🔍 Searching for suggestion:', item.title);
    setSearchQuery(item.title);
    return; // Don't close modal, let search happen
  };

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        {<Image source={require('@/assets/images/locationIcon.png')} />}
      </View>
      <View style={styles.locationText}>
        <Text style={styles.locationTitle}>{item.title}</Text>
        <Text style={styles.locationSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose || (() => {})}
      maxHeight={isFullScreen ? '100%' : '70%'}
      showTopBar={true}
      backdropOpacity={0}
      containerStyle={{ gap: theme.spacing.xs }}
    >
      {/* Full Screen Header */}
      <View style={styles.fullScreenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isFullScreen) {
              // If in fullscreen mode, just exit fullscreen
              if (onFullScreenChange) {
                onFullScreenChange(false);
                setActiveTab('recents');
              }
              setSearchQuery('');
            } else {
              // If not in fullscreen mode, navigate back to ConfirmDestinationModal
              if (onClose) {
                onClose();
              }
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.fullScreenTitle}>Where is the Pickup?</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Input
              label='Pickup'
              height={48}
              placeholder="Enter your pickup point"
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setActiveTab('search');
              }}
              onFocus={() => {
                setActiveTab('search');
                if (onFullScreenChange) {
                  onFullScreenChange(true);
                }
              }}
              autoFocus={isFullScreen}
              leftIcon={<Image source={require('@/assets/images/locationIcon.png')} />}
              style={styles.searchInput}
            />
            <View style={styles.headerRight}>
              <Image source={require('@/assets/images/map.png')} />
              <Text style={styles.headerMapText}>Map</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      {!isFullScreen && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recents' && styles.activeTab]}
            onPress={() => setActiveTab('recents')}
          >
            <Text style={[styles.tabText, activeTab === 'recents' && styles.activeTabText]}>
              Recents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myPlaces' && styles.activeTab]}
            onPress={() => setActiveTab('myPlaces')}
          >
            <Text style={[styles.tabText, activeTab === 'myPlaces' && styles.activeTabText]}>
              My Places
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.listContainer}>
        {(isSearching || isLoadingRecents) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.blue500} />
            <Text style={styles.loadingText}>
              {isSearching ? 'Searching...' : 'Loading recent locations...'}
            </Text>
          </View>
        )}
        <FlatList
          data={getCurrentData()}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isSearching && !isLoadingRecents && searchQuery.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color={theme.colors.gray400} />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : !isSearching && !isLoadingRecents && activeTab === 'recents' && recentLocations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={theme.colors.gray400} />
                <Text style={styles.emptyText}>No recent locations</Text>
                <Text style={styles.emptySubtext}>Your recent trips will appear here</Text>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  fullScreenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.black,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  searchSection: {
  },
  destinationLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchInputFullScreen: {
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 30,
    top: 14,
  },
  headerMapText: {
    fontSize: 16,
    color: theme.colors.blue500,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    borderColor: theme.colors.gray200,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.blue300,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.black,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.white,
  },
  listContainer: {
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  list: {
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  continueButton: {
    padding: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.blue50,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.blue25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationText: {
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
