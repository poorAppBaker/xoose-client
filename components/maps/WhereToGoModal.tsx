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
// Using Mapbox Search Box API directly via fetch
import Input from '../common/Input';
import Modal from '../common/Modal';
import recentLocationsService, { RecentLocation } from '../../services/recentLocationsService';
import useAuthStore from '../../store/authStore';

const { width } = Dimensions.get('window');

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  latitude?: number;
  longitude?: number;
  mapboxId?: string;
}

interface WhereToGoModalProps {
  visible: boolean;
  onClose?: () => void;
  onLocationSelect?: (location: LocationItem) => void;
  isFullScreen?: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onMapMove?: (coordinate: [number, number]) => void;
}

export default function WhereToGoModal({
  visible,
  onClose,
  onLocationSelect,
  isFullScreen = false,
  onFullScreenChange,
  onMapMove
}: WhereToGoModalProps) {
  const { theme } = useTheme();
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState<'recents' | 'myPlaces' | 'search'>('recents');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentSessionToken, setCurrentSessionToken] = useState<string>('');
  const styles = createStyles(theme);

  // Using Mapbox Search Box API directly
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw';

  // Fetch recent destination locations from Firestore
  const fetchRecentLocations = async () => {
    if (!user?._id) return;
    
    setIsLoadingRecents(true);
    try {
      const recentData = await recentLocationsService.getRecentDestinationLocations(user._id, 3);
      const locationItems: LocationItem[] = recentData.map(location => ({
        id: location.id,
        title: location.title,
        subtitle: location.subtitle,
        latitude: location.coordinate[1],
        longitude: location.coordinate[0]
      }));
      setRecentLocations(locationItems);
    } catch (error) {
      console.error('Error fetching recent destination locations:', error);
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

  // Popular place suggestions for better UX
  const popularPlaces: LocationItem[] = [];


  // Search for locations using Mapbox Search Box API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Searching for:', query);

    try {
      // Generate a session token for Search Box API
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionToken(sessionToken); // Store for later use in retrieve
      
      // Use Search Box API suggest endpoint
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${sessionToken}&limit=10&types=country,region,district,postcode,locality,place,neighborhood,address,poi&language=en`
      );

      if (!response.ok) {
        throw new Error(`Search Box API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Search Box API Response:', data);

      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        console.warn('Search Box API returned no suggestions');
        setSearchResults([]);
        return;
      }

      const results: LocationItem[] = data.suggestions.map((suggestion: any, index: number) => {
        // Extract title and subtitle from Search Box API response
        let title = '';
        let subtitle = '';
        
        if (suggestion.name) {
          title = suggestion.name;
        } else if (suggestion.full_address) {
          title = suggestion.full_address.split(',')[0];
        } else {
          title = 'Location';
        }

        if (suggestion.full_address) {
          subtitle = suggestion.full_address;
        } else if (suggestion.address) {
          subtitle = suggestion.address;
        } else {
          subtitle = 'Unknown Address';
        }

        return {
          id: `search_${index}`,
          title: title.trim(),
          subtitle: subtitle.trim(),
          latitude: undefined, // Will be retrieved when selected
          longitude: undefined, // Will be retrieved when selected
          mapboxId: suggestion.mapbox_id, // Store mapbox_id for retrieval
        };
      });

      // Remove duplicates and sort by relevance
      let uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.title === result.title && r.subtitle === result.subtitle)
      );

      // Sort results by relevance
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

      console.log('✅ Final search results:', uniqueResults);
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('❌ Search Box API error:', error);
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
      // Show popular places when no search results and no query
      if (searchResults.length === 0 && !searchQuery.trim()) {
        return popularPlaces;
      }
      return searchResults;
    }
    return activeTab === 'recents' ? recentLocations : myPlaces;
  };

  const handleLocationSelect = async (item: LocationItem) => {
    // If it's a suggestion without coordinates, retrieve them from Search Box API
    if (!item.latitude || !item.longitude) {
      if (item.mapboxId) {
        console.log('📍 Retrieving coordinates for:', item.title);
        try {
          const response = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${item.mapboxId}?access_token=${MAPBOX_ACCESS_TOKEN}&session_token=${currentSessionToken}`
          );
          
          if (!response.ok) {
            throw new Error(`Retrieve API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('📍 Retrieved coordinates:', data);
          
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            
            // Try to use routable_points first (more accurate for routing)
            let latitude, longitude;
            if (feature.properties?.coordinates?.routable_points?.length > 0) {
              const routablePoint = feature.properties.coordinates.routable_points[0];
              latitude = routablePoint.latitude;
              longitude = routablePoint.longitude;
              console.log('📍 Using routable point coordinates:', { latitude, longitude });
            } else {
              // Fallback to geometry coordinates
              const coordinates = feature.geometry?.coordinates;
              if (coordinates && coordinates.length >= 2) {
                [longitude, latitude] = coordinates;
                console.log('📍 Using geometry coordinates:', { latitude, longitude });
              }
            }
            
            if (latitude && longitude) {
              // Update the item with coordinates
              const updatedItem = {
                ...item,
                latitude,
                longitude
              };
              
              // Move map to the selected location
              if (onMapMove) {
                onMapMove([longitude, latitude]);
              }
              
              if (onLocationSelect) {
                onLocationSelect(updatedItem);
              }
              if (onClose) {
                onClose();
              }
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error retrieving coordinates:', error);
        }
      }
      
      // Fallback: search for it
      console.log('🔍 Searching for suggestion:', item.title);
      setSearchQuery(item.title);
      return; // Don't close modal, let search happen
    }
    
    // Move map to the selected location if coordinates are available
    if (item.latitude && item.longitude && onMapMove) {
      onMapMove([item.longitude, item.latitude]);
    }
    
    if (onLocationSelect) {
      onLocationSelect(item);
    }
    if (onClose) {
      onClose();
    }
  };

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        {/* <Ionicons name="location" size={20} color={theme.colors.blue500} /> */}
        <Image source={require('../../assets/images/locationIcon.png')} />
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
      containerStyle={{ gap: theme.spacing.md }}
      backdropOpacity={0}
    >
       {/* Full Screen Header */}
       {isFullScreen && (
         <View style={styles.fullScreenHeader}>
           <TouchableOpacity
             style={styles.backButton}
             onPress={() => {
               if (onFullScreenChange) {
                 onFullScreenChange(false);
               }
               setSearchQuery('');
               setActiveTab('recents');
             }}
           >
             <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
           </TouchableOpacity>
           <Text style={styles.fullScreenTitle}>Where to Go?</Text>
           <View style={styles.placeholder} />
         </View>
       )}

       {/* Search Input Section */}
       <View style={styles.searchSection}>
         <View style={styles.searchContainer}>
           <View style={styles.searchInputWrapper}>
             <Input
               label={isFullScreen ? 'Destination' : undefined}
               height={48}
               placeholder="Where to Go?"
               placeholderFontSize={!isFullScreen ? 22 : 16}
               placeholderStyle={!isFullScreen ? { color: theme.colors.black, fontWeight: '700' } : { }}
               value={searchQuery}
               onChangeText={(text) => {
                 setSearchQuery(text);
                 setActiveTab('search')
               }}
               onFocus={() => {
                 setActiveTab('search');
                 if (onFullScreenChange) {
                   onFullScreenChange(true);
                 }
               }}
               autoFocus={isFullScreen}
               leftIcon={<Image source={require('@/assets/images/paperPlane.png')}  />}
               style={isFullScreen ? {...styles.searchInput, ...styles.searchInputFullScreen} : styles.searchInput}
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
                <Text style={styles.emptySubtext}>
                  {searchQuery.toLowerCase().includes('benfica') 
                    ? 'Try searching for "Estádio da Luz Lisboa" or "Benfica Lisbon Portugal"'
                    : 'Try searching for street addresses, landmarks, or city names'
                  }
                </Text>
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
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  fullScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    flex: 1,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
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
    color: theme.colors.gray800,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.white,
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
    ...theme.typography.body,
    color: theme.colors.gray800,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.gray500,
  },
  listContainer: {
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
