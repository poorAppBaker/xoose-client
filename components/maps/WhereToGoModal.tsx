import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Mapbox from '@mapbox/mapbox-sdk';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import Input from '../common/Input';

const { width } = Dimensions.get('window');

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  latitude?: number;
  longitude?: number;
}

interface WhereToGoModalProps {
  visible: boolean;
  onClose?: () => void;
  onLocationSelect?: (location: LocationItem) => void;
  isFullScreen?: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

export default function WhereToGoModal({
  visible,
  onClose,
  onLocationSelect,
  isFullScreen = false,
  onFullScreenChange
}: WhereToGoModalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'recents' | 'myPlaces' | 'search'>('recents');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const styles = createStyles(theme);

  // Initialize Mapbox geocoding service
  const mapboxClient = Mapbox({ accessToken: 'pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw' });
  const geocodingClient = mbxGeocoding(mapboxClient);

  // Sample data for demonstration
  const recentLocations: LocationItem[] = [
    { id: '1', title: 'Loyal Heights', subtitle: 'Sunset Hill 400, San Francisco' },
    { id: '2', title: 'Downtown Plaza', subtitle: 'Main Street 123, San Francisco' },
    { id: '3', title: 'Golden Gate Park', subtitle: 'Park Avenue 456, San Francisco' },
  ];

  const myPlaces: LocationItem[] = [
    { id: '1', title: 'Home', subtitle: '123 Oak Street, San Francisco' },
    { id: '2', title: 'Work', subtitle: '456 Pine Avenue, San Francisco' },
    { id: '3', title: 'Gym', subtitle: '789 Fitness Center, San Francisco' },
  ];

  // Search for locations using Mapbox Geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await geocodingClient
        .forwardGeocode({
          query: query,
          limit: 10,
          countries: ['us'], // You can modify this based on your target region
          types: ['place', 'poi', 'address', 'neighborhood', 'locality', 'district', 'postcode', 'region', 'country']
        })
        .send();

      const results: LocationItem[] = response.body.features.map((feature, index) => ({
        id: `search_${index}`,
        title: feature.place_name?.split(',')[0] || feature.text || 'Unknown Location',
        subtitle: feature.place_name || 'Unknown Address',
        latitude: feature.center[1],
        longitude: feature.center[0],
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchLocations(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCurrentData = () => {
    if (activeTab === 'search') {
      return searchResults;
    }
    return activeTab === 'recents' ? recentLocations : myPlaces;
  };

  const handleLocationSelect = (item: LocationItem) => {
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
        <Ionicons name="location" size={20} color={theme.colors.blue500} />
      </View>
      <View style={styles.locationText}>
        <Text style={styles.locationTitle}>{item.title}</Text>
        <Text style={styles.locationSubtitle}>{item.subtitle}</Text>
      </View>
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => handleLocationSelect(item)}
      >
        <Ionicons name="arrow-forward" size={20} color={theme.colors.blue500} />
      </TouchableOpacity>
    </TouchableOpacity>
  );


  if (!visible) return null;

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
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
         {isFullScreen && (
           <Text style={styles.destinationLabel}>Destination</Text>
         )}
         <View style={styles.searchContainer}>
           <View style={styles.searchInputWrapper}>
             <Input
               placeholder="Where to Go?"
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
               leftIcon={<Ionicons name="paper-plane" size={20} color="#999999" />}
               rightIcon={searchQuery.length > 0 ? (
                 <TouchableOpacity onPress={() => setSearchQuery('')}>
                   <Ionicons name="close-circle" size={20} color="#999999" />
                 </TouchableOpacity>
               ) : undefined}
               style={[
                 styles.searchInput,
                 isFullScreen && styles.searchInputFullScreen
               ]}
             />
             <View style={styles.headerRight}>
               <Ionicons name="map" size={20} color={theme.colors.blue500} />
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
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.blue500} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}
        <FlatList
          data={getCurrentData()}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isSearching && searchQuery.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40, // Account for safe area
    maxHeight: '70%',
    zIndex: 1000,
    ...theme.shadows.lg,
  },
  fullScreenContainer: {
    top: 0,
    bottom: 0,
    maxHeight: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 50, // Account for status bar
  },
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
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
  },
  searchInput: {
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    flex: 1,
    height: 48,
  },
  searchInputFullScreen: {
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 30,
    top: 0,
    bottom: 0,
  },
  headerMapText: {
    ...theme.typography.body,
    color: theme.colors.blue500,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.blue100,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.blue500,
  },
  list: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
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
    backgroundColor: theme.colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    ...theme.typography.body,
    color: theme.colors.black,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    flex: 1,
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
