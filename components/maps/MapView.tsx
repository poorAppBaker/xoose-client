import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Alert, Image, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';

// Set your Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw');

const { width, height } = Dimensions.get('window');

interface MapViewProps {
  style?: any;
  onPress?: (event: any) => void;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  selectedLocation?: [number, number];
  destination?: {
    coordinate: [number, number];
    title: string;
  };
  pickup?: {
    coordinate: [number, number];
    title: string;
  };
  onWaypointChange?: (waypoints: [number, number][]) => void;
  onCurrentLocationChange?: (location: { coordinate: [number, number]; address?: string }) => void;
  mapHeight?: number;
  useDestinationPointer?: boolean;
}

export default function MapViewComponent({
  style,
  onPress,
  centerCoordinate,
  zoomLevel = 10,
  selectedLocation,
  destination,
  pickup,
  onWaypointChange,
  onCurrentLocationChange,
  mapHeight = height,
  useDestinationPointer = false
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Initialize Mapbox Directions service
  const directionsClient = MapboxDirections({ accessToken: 'pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw' });

  useEffect(() => {
    console.log('MapView mounted, getting location...');
    getCurrentLocation();
  }, []);

  // Calculate route when pickup, destination, or waypoints change
  useEffect(() => {
    if (destination && pickup) {
      calculateRoute();
    }
  }, [destination, pickup, waypoints]);

  // Debug userLocation changes
  useEffect(() => {
    console.log('userLocation changed:', userLocation);
  }, [userLocation]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location on the map.');
        setIsLoadingLocation(false);
        setHasLocationPermission(false);
        return;
      }
      setHasLocationPermission(true);

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      console.log('Location obtained:', { latitude, longitude });
      setUserLocation([longitude, latitude]);
      setIsLoadingLocation(false);
      console.log('User location set, pointer should be visible');

      // Force a re-render to ensure the pointer shows
      setTimeout(() => {
        console.log('Forcing re-render after location set');
      }, 100);

      // Call the current location callback
      if (onCurrentLocationChange) {
        onCurrentLocationChange({
          coordinate: [longitude, latitude],
          address: undefined // You can add reverse geocoding here if needed
        });
      }

      // Watch heading changes
      Location.watchHeadingAsync((heading) => {
        setUserHeading(heading.trueHeading || heading.magHeading || 0);
      });

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location.');
      setIsLoadingLocation(false);
    }
  };

  const handleWaypointDrag = (index: number, coordinate: [number, number]) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = coordinate;
    setWaypoints(newWaypoints);
    if (onWaypointChange) {
      onWaypointChange(newWaypoints);
    }
    // Route will be recalculated automatically via useEffect
  };

  const addWaypoint = (coordinate: [number, number]) => {
    const newWaypoints = [...waypoints, coordinate];
    setWaypoints(newWaypoints);
    if (onWaypointChange) {
      onWaypointChange(newWaypoints);
    }
  };

  // Calculate route using Mapbox Directions API
  const calculateRoute = async () => {
    if (!destination || !pickup) return;

    setIsCalculatingRoute(true);

    try {
      // Prepare waypoints for the route
      const allWaypoints = [pickup.coordinate, ...waypoints, destination.coordinate];

      const response = await directionsClient
        .getDirections({
          profile: 'driving',
          waypoints: allWaypoints.map(coord => ({
            coordinates: coord,
            approach: 'curb'
          })),
          geometries: 'geojson',
          overview: 'full',
          steps: false,
          alternatives: false
        })
        .send();

      if (response.body.routes && response.body.routes.length > 0) {
        const route = response.body.routes[0];
        const coordinates = route.geometry.coordinates;
        setRouteGeometry(coordinates);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback to straight line if API fails
      const coordinates = [pickup.coordinate];
      waypoints.forEach(waypoint => coordinates.push(waypoint));
      coordinates.push(destination.coordinate);
      setRouteGeometry(coordinates);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Generate route coordinates including waypoints (fallback)
  const getRouteCoordinates = () => {
    if (routeGeometry) return routeGeometry;

    if (!destination || !pickup) return [];

    const coordinates = [pickup.coordinate];
    waypoints.forEach(waypoint => coordinates.push(waypoint));
    coordinates.push(destination.coordinate);

    return coordinates;
  };

  const handleMapPress = (event: any) => {
    if (onPress) {
      onPress(event);
    }

    // Add waypoint if both pickup and destination are selected
    if (destination && pickup) {
      const { coordinate } = event.nativeEvent;
      addWaypoint(coordinate);
    }
  };

  return (
    <View style={[styles.container, { height: mapHeight }, style]}>
      <Mapbox.MapView
        style={styles.map}
        onPress={handleMapPress}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          centerCoordinate={selectedLocation || userLocation || centerCoordinate || [0, 0]}
          zoomLevel={userLocation ? zoomLevel : 2}
          animationMode={userLocation ? "flyTo" : "none"}
          animationDuration={userLocation ? 1000 : 0}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={userLocation}
          >
            <View style={styles.userLocationContainer}>
              <Image
                source={require('../../assets/images/pointer.png')}
                style={[
                  styles.locationPointer,
                  { transform: [{ rotate: `${userHeading}deg` }] }
                ]}
                resizeMode="contain"
              />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Mapbox.PointAnnotation
            id="selectedLocation"
            coordinate={selectedLocation}
          >
            <View style={styles.selectedLocationContainer}>
              <View style={styles.selectedLocationMarker}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Destination Marker with Label */}
        {destination && (
          <Mapbox.PointAnnotation
            id="destination"
            coordinate={destination.coordinate}
          >
            <View style={styles.destinationContainer}>
                <Image
                  source={require('../../assets/images/destination-pointer.png')}
                  style={[
                    styles.locationPointer,
                    { transform: [{ rotate: `${userHeading}deg` }] }
                  ]}
                  resizeMode="contain"
                />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Pickup Marker with Label */}
        {pickup && (
          <Mapbox.PointAnnotation
            id="pickup"
            coordinate={pickup.coordinate}
          >
            <View style={styles.pickupContainer}>
              <View style={styles.pickupLabel}>
                <Text style={styles.pickupLabelText}>Pickup</Text>
              </View>
              <View style={styles.pickupConnector} />
              <View style={styles.pickupMarker}>
                <Ionicons name="car" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Route Line */}
        {destination && pickup && getRouteCoordinates().length > 1 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: getRouteCoordinates()
              }
            }}
          >
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: isCalculatingRoute ? '#FFA500' : '#4A4A4A',
                lineWidth: 4,
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: isCalculatingRoute ? 0.7 : 1.0
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Route Calculation Loading Indicator */}
        {isCalculatingRoute && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Calculating route...</Text>
            </View>
          </View>
        )}

        {/* Waypoint Markers */}
        {waypoints.map((waypoint, index) => (
          <Mapbox.PointAnnotation
            key={`waypoint-${index}`}
            id={`waypoint-${index}`}
            coordinate={waypoint}
            draggable={true}
            onDragEnd={(event) => {
              const { coordinate } = event.nativeEvent;
              handleWaypointDrag(index, coordinate);
            }}
          >
            <View style={styles.waypointContainer}>
              <View style={styles.waypointMarker}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {/* Location Loading Indicator */}
        {isLoadingLocation && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          </View>
        )}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: width,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  userLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPointer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#007AFF',
  },
  selectedLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60, // Increased height to accommodate label and connector
  },
  destinationLabel: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  destinationConnector: {
    width: 3,
    height: 12,
    backgroundColor: '#4CAF50',
    marginBottom: 2,
  },
  destinationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pickupContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60, // Increased height to accommodate label and connector
  },
  pickupLabel: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pickupLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickupConnector: {
    width: 3,
    height: 12,
    backgroundColor: '#FF9800',
    marginBottom: 2,
  },
  pickupMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickupMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  waypointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});