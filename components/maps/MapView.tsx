import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Alert, Image, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
// @ts-ignore
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { theme } from '@/constants/theme';

// Set your Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw');

const { width, height } = Dimensions.get('window');

// Use static imports to ensure Metro resolves assets reliably
const USER_POINTER_IMG = require('../../assets/images/icons/pointer.png');
const DESTINATION_POINTER_IMG = require('../../assets/images/icons/destination-pointer.png');
const PICKUP_POINTER_IMG = require('../../assets/images/icons/pickup-pointer.png');
const CAR_INJECT_POINTER_IMG = require('../../assets/images/icons/car-inject.png');

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
  showETALabels?: boolean;
  pickupETA?: string;
  destinationETA?: string;
  driverLocation?: [number, number];
  driverSpeed?: number; // km/h
  calculateETAs?: boolean;
  enableCarAnimation?: boolean; // Whether MapView should handle its own car animation
  showLocationTitles?: boolean; // Force show location titles instead of ETAs
  showDriverCar?: boolean; // Whether to show the driver car image on the map
  showDestinationMarker?: boolean; // Whether to show the destination marker
  showPickupMarker?: boolean; // Whether to show the pickup marker
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
  useDestinationPointer = false,
  showETALabels = false,
  pickupETA,
  destinationETA,
  driverLocation,
  driverSpeed,
  calculateETAs = false,
  enableCarAnimation = true,
  showLocationTitles = false,
  showDriverCar = true,
  showDestinationMarker = true,
  showPickupMarker = true
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [calculatedPickupETA, setCalculatedPickupETA] = useState<string>('');
  const [calculatedDestinationETA, setCalculatedDestinationETA] = useState<string>('');
  const [driverToPickupDistance, setDriverToPickupDistance] = useState<number>(0);
  const [pickupToDestinationDistance, setPickupToDestinationDistance] = useState<number>(0);
  
  // Car movement animation states
  const [animatedDriverLocation, setAnimatedDriverLocation] = useState<[number, number] | null>(null);
  const [isCarMoving, setIsCarMoving] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Debug logging
  console.log('MapView received props:', {
    destination: destination ? { coordinate: destination.coordinate, title: destination.title } : null,
    pickup: pickup ? { coordinate: pickup.coordinate, title: pickup.title } : null,
    selectedLocation,
    calculateETAs,
    driverLocation,
    driverSpeed,
    calculatedPickupETA,
    calculatedDestinationETA
  });

  // Initialize Mapbox Directions service
  const directionsClient = MapboxDirections({ accessToken: 'pk.eyJ1IjoiYWJ3ZWhyMTIyNSIsImEiOiJjbWZmYmNtNW0wNHc1MnFvdDkybmdzNWdlIn0.B0AntzGDfY-3brsMbfM4Sw' });

  useEffect(() => {
    console.log('MapView mounted, getting location...');
    getCurrentLocation();
  }, []);

  // Calculate route when pickup, destination, waypoints, or driver location change
  useEffect(() => {
    if (pickup) {
      // If destination marker is hidden and pickup marker is shown, only need pickup and driver location
      if (!showDestinationMarker && showPickupMarker && driverLocation) {
        calculateRoute();
      } else if (showDestinationMarker && !showPickupMarker && driverLocation && destination) {
        // If pickup marker is hidden and destination marker is shown, only need destination and driver location
        calculateRoute();
      } else if (destination) {
        // Normal case: need both pickup and destination
        calculateRoute();
      }
    }
  }, [destination, pickup, waypoints, showDestinationMarker, showPickupMarker, driverLocation]);

  // Calculate bounds for pickup and destination
  const calculateBounds = () => {
    if (!pickup || !destination) return undefined;

    const pickupCoord = pickup.coordinate;
    const destCoord = destination.coordinate;

    const minLng = Math.min(pickupCoord[0], destCoord[0]);
    const maxLng = Math.max(pickupCoord[0], destCoord[0]);
    const minLat = Math.min(pickupCoord[1], destCoord[1]);
    const maxLat = Math.max(pickupCoord[1], destCoord[1]);

    // Add padding to bounds
    const padding = 0.01; // Adjust this value for more/less padding

    return {
      ne: [maxLng + padding, maxLat + padding] as [number, number],
      sw: [minLng - padding, minLat - padding] as [number, number]
    };
  };

  // Haversine distance calculation (fallback)
  const calculateHaversineDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get driving distance using Mapbox Directions API
  const getDrivingDistance = async (from: [number, number], to: [number, number]): Promise<number> => {
    try {
      const response = await directionsClient
        .getDirections({
          profile: 'driving',
          waypoints: [
            { coordinates: from, approach: 'curb' },
            { coordinates: to, approach: 'curb' }
          ],
          geometries: 'geojson',
          overview: 'full',
          steps: false,
          alternatives: false
        })
        .send();

      if (response.body.routes && response.body.routes.length > 0) {
        const route = response.body.routes[0];
        return route.distance / 1000; // Convert meters to kilometers
      }
    } catch (error) {
      console.error('Error getting driving distance:', error);
    }

    // Fallback to Haversine distance
    return calculateHaversineDistance(from, to);
  };

  // Calculate ETA based on distance and speed
  const calculateETA = (distanceKm: number, speedKmH: number): string => {
    // Clamp speed to realistic values
    const minSpeed = 10; // km/h
    const maxSpeed = 110; // km/h
    const clampedSpeed = Math.max(minSpeed, Math.min(maxSpeed, speedKmH));

    // If distance is very small, show "Arriving"
    if (distanceKm < 0.05) { // 50 meters
      return "Arriving";
    }

    // Calculate time in hours
    const timeHours = distanceKm / clampedSpeed;
    const etaMinutes = Math.ceil(timeHours * 60);

    // Format ETA
    if (etaMinutes < 1) {
      return "<1 min";
    } else if (etaMinutes < 60) {
      return `${etaMinutes} min`;
    } else {
      const hours = Math.floor(etaMinutes / 60);
      const minutes = etaMinutes % 60;
      return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
    }
  };

  // Calculate arrival time
  const calculateArrivalTime = (etaMinutes: number): string => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + etaMinutes * 60000);
    return arrivalTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate ETAs when driver location or speed changes
  useEffect(() => {
    if (!calculateETAs || !driverLocation || !driverSpeed || !pickup || !destination) {
      return;
    }

    const performETACalculation = async () => {
      console.log('🚀 Starting ETA calculation...', {
        driverLocation,
        driverSpeed,
        pickup: pickup?.coordinate,
        destination: destination?.coordinate
      });

      try {
        // Get distances
        const driverToPickupDist = await getDrivingDistance(driverLocation, pickup.coordinate);
        const pickupToDestDist = await getDrivingDistance(pickup.coordinate, destination.coordinate);

        console.log('📏 Calculated distances:', {
          driverToPickupDist,
          pickupToDestDist
        });

        setDriverToPickupDistance(driverToPickupDist);
        setPickupToDestinationDistance(pickupToDestDist);

        // Calculate ETAs
        const pickupETA = calculateETA(driverToPickupDist, driverSpeed);
        const destinationETA = calculateETA(pickupToDestDist, driverSpeed);

        console.log('⏰ Calculated ETAs:', {
          pickupETA,
          destinationETA
        });

        setCalculatedPickupETA(pickupETA);
        setCalculatedDestinationETA(`Arriving by ${calculateArrivalTime(Math.ceil((driverToPickupDist + pickupToDestDist) / driverSpeed * 60))}`);

        console.log('✅ ETA calculation completed successfully');

      } catch (error) {
        console.error('❌ Error calculating ETAs:', error);
        // Fallback to default values
        setCalculatedPickupETA("~5 min");
        setCalculatedDestinationETA("~15 min");
      }
    };

    performETACalculation();
  }, [driverLocation, driverSpeed, pickup, destination, calculateETAs]);

  // Debug userLocation changes
  useEffect(() => {
    console.log('userLocation changed:', userLocation);
  }, [userLocation]);

  // Handle selectedLocation changes - animate to selected location
  useEffect(() => {
    if (selectedLocation) {
      console.log('📍 Selected location changed, animating to:', selectedLocation);
      // The camera will automatically animate due to the centerCoordinate prop change
    }
  }, [selectedLocation]);

  // Car movement animation - animate car from driver location to pickup location
  useEffect(() => {
    if (!enableCarAnimation || !driverLocation || !pickup || isCarMoving) {
      return;
    }

    console.log('🚗 Starting car movement animation from driver to pickup');
    setIsCarMoving(true);
    setAnimatedDriverLocation(driverLocation);

    const startTime = Date.now();
    const duration = 5000; // 5 seconds animation
    const startCoord = driverLocation;
    const endCoord = pickup.coordinate;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);

      // Interpolate coordinates
      const currentLng = startCoord[0] + (endCoord[0] - startCoord[0]) * easedProgress;
      const currentLat = startCoord[1] + (endCoord[1] - startCoord[1]) * easedProgress;

      setAnimatedDriverLocation([currentLng, currentLat]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        console.log('🚗 Car movement animation completed');
        setIsCarMoving(false);
        setAnimatedDriverLocation(endCoord);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableCarAnimation, driverLocation, pickup]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
    if (!pickup) return;

    setIsCalculatingRoute(true);

    try {
      let allWaypoints: [number, number][];
      
      // If destination marker is hidden and pickup marker is shown (e.g., DriverArrivingModal going to pickup), show route from car to pickup
      if (!showDestinationMarker && showPickupMarker && driverLocation) {
        allWaypoints = [driverLocation, pickup.coordinate];
      } else if (showDestinationMarker && !showPickupMarker && driverLocation && destination) {
        // If pickup marker is hidden and destination marker is shown (e.g., DriverArrivingModal going to destination), show route from car to destination
        allWaypoints = [driverLocation, destination.coordinate];
      } else {
        // Normal route from pickup to destination
        if (!destination) return;
        allWaypoints = [pickup.coordinate, ...waypoints, destination.coordinate];
      }

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
        const coordinates = (route.geometry.coordinates as number[][]).map(
          (coord) => [coord[0], coord[1]] as [number, number]
        );
        setRouteGeometry(coordinates);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback to straight line if API fails
      let coordinates: [number, number][];
      
      if (!showDestinationMarker && showPickupMarker && driverLocation) {
        coordinates = [driverLocation, pickup.coordinate];
      } else if (showDestinationMarker && !showPickupMarker && driverLocation && destination) {
        coordinates = [driverLocation, destination.coordinate];
      } else {
        coordinates = [pickup.coordinate];
        waypoints.forEach(waypoint => coordinates.push(waypoint));
        if (destination) {
          coordinates.push(destination.coordinate);
        }
      }
      setRouteGeometry(coordinates);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Generate route coordinates including waypoints (fallback)
  const getRouteCoordinates = () => {
    if (routeGeometry) return routeGeometry;

    if (!pickup) return [];

    // If destination marker is hidden and pickup marker is shown (e.g., DriverArrivingModal going to pickup), show route from car to pickup
    if (!showDestinationMarker && showPickupMarker && driverLocation) {
      return [driverLocation, pickup.coordinate];
    }

    // If pickup marker is hidden and destination marker is shown (e.g., DriverArrivingModal going to destination), show route from car to destination
    if (showDestinationMarker && !showPickupMarker && driverLocation && destination) {
      return [driverLocation, destination.coordinate];
    }

    // Normal route from pickup to destination
    if (!destination) return [];

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
        {/* Register marker images for SymbolLayers */}
        <Mapbox.Images
          images={{
            userLocationIcon: USER_POINTER_IMG,
            destinationIcon: DESTINATION_POINTER_IMG,
            pickupIcon: PICKUP_POINTER_IMG,
            carInjectIcon: CAR_INJECT_POINTER_IMG,
          }}
        />
        <Mapbox.UserLocation
          visible={false}
          showsUserHeadingIndicator={false}
        />
        <Mapbox.Camera
          {...(pickup && destination ? {
            bounds: calculateBounds(),
            animationMode: "flyTo",
            animationDuration: 1000
          } : {
            centerCoordinate: selectedLocation || userLocation || centerCoordinate || [0, 0],
            zoomLevel: (selectedLocation || userLocation) ? zoomLevel : 2,
            animationMode: (selectedLocation || userLocation) ? "flyTo" : "none",
            animationDuration: (selectedLocation || userLocation) ? 1000 : 0
          })}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Mapbox.ShapeSource
            id="userLocationSource"
            shape={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { 
                    icon: 'userLocationIcon',
                    heading: userHeading
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: userLocation,
                  },
                },
              ],
            }}
          >
            <Mapbox.SymbolLayer
              id="userLocationLayer"
              style={{
                iconImage: ['get', 'icon'],
                iconAnchor: 'bottom',
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconSize: 0.3,
                iconRotate: ['get', 'heading'],
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Driver Location Marker */}
        {showDriverCar && (animatedDriverLocation || driverLocation) && (
          <Mapbox.ShapeSource
            id="driverLocationSource"
            shape={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { icon: 'carInjectIcon' },
                  geometry: {
                    type: 'Point',
                    coordinates: animatedDriverLocation || driverLocation!,
                  },
                },
              ],
            }}
          >
            <Mapbox.SymbolLayer
              id="driverLocationLayer"
              style={{
                iconImage: ['get', 'icon'],
                iconSize: 0.3,
                iconOpacity: isCarMoving ? 0.8 : 1.0,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Selected Location Marker - Removed since we use custom destination/pickup PNGs */}

        {/* Destination Marker - ETA Label or Pin */}
        {showDestinationMarker && destination && (
          showETALabels ? (
            <Mapbox.PointAnnotation
              id="destinationETA"
              coordinate={destination.coordinate}
              anchor={{ x: 0.5, y: 0.9 }}
            >
              <View style={styles.etaLabelContainer}>
                {showLocationTitles ? (
                  <View style={styles.locationTitleContainer}>
                    <View style={styles.locationTitleTopSection}>
                      <Text style={styles.locationTitleTopText}>Destination</Text>
                    </View>
                    <View style={styles.locationDestinationTitleBottomSection}>
                      <Text style={styles.locationTitleBottomText}>{destination.title}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.etaLabel, styles.destinationETALabel]}>
                    <Text style={styles.etaLabelText}>
                      {calculatedDestinationETA || destinationETA || destination.title}
                    </Text>
                  </View>
                )}
                <View style={styles.destinationETaPointer}></View>
                <View style={styles.destinationETaCircle}></View>
              </View>
            </Mapbox.PointAnnotation>
          ) : (
            <Mapbox.ShapeSource
              id="destinationSource"
              shape={{
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: { icon: 'destinationIcon' },
                    geometry: {
                      type: 'Point',
                      coordinates: destination.coordinate,
                    },
                  },
                ],
              }}
            >
              <Mapbox.SymbolLayer
                id="destinationLayer"
                style={{
                  iconImage: ['get', 'icon'],
                  iconAnchor: 'bottom',
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true,
                  iconSize: 0.3,
                }}
              />
            </Mapbox.ShapeSource>
          )
        )}

        {/* Pickup Marker - ETA Label or Pin */}
        {showPickupMarker && pickup && (
          showETALabels ? (
            <Mapbox.PointAnnotation
              id="pickupETA"
              coordinate={pickup.coordinate}
              anchor={{ x: 0.5, y: 0.9 }}
            >
              <View style={styles.etaLabelContainer}>
                {showLocationTitles ? (
                  <View style={styles.locationTitleContainer}>
                    <View style={styles.locationTitleTopSection}>
                      <Text style={styles.locationTitleTopText}>Pickup</Text>
                    </View>
                    <View style={styles.locationPickupTitleBottomSection}>
                      <Text style={styles.locationTitleBottomText}>{pickup.title}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.etaLabel, styles.pickupETALabel]}>
                    <Text style={styles.etaLabelText}>
                      {calculatedPickupETA || pickupETA || pickup.title}
                    </Text>
                  </View>
                )}
                <View style={styles.pickupEtaPointer}></View>
                <View style={styles.pickupEtaCircle}></View>
              </View>
            </Mapbox.PointAnnotation>
          ) : (
            <Mapbox.ShapeSource
              id="pickupSource"
              shape={{
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: { icon: 'pickupIcon' },
                    geometry: {
                      type: 'Point',
                      coordinates: pickup.coordinate,
                    },
                  },
                ],
              }}
            >
              <Mapbox.SymbolLayer
                id="pickupLayer"
                style={{
                  iconImage: ['get', 'icon'],
                  iconAnchor: 'bottom',
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true,
                  iconSize: 0.3,
                }}
              />
            </Mapbox.ShapeSource>
          )
        )}

        {/* Route Line */}
        {pickup && getRouteCoordinates().length > 1 && (
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
            onDragEnd={(event: any) => {
              const coordinate = (event?.nativeEvent as any)?.coordinate ?? (event as any)?.geometry?.coordinates;
              if (!coordinate) {
                console.log('Waypoint drag event missing coordinate payload', event);
                return;
              }
              handleWaypointDrag(index, coordinate as [number, number]);
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
    width: 34,
    height: 34,
  },
  destinationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  // ETA Label Styles
  etaLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000000'
  },
  etaLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickupETALabel: {
    backgroundColor: theme.colors.orange600,
  },
  destinationETALabel: {
    backgroundColor: theme.colors.green500,
  },
  etaLabelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Location Title Styles (Two-section design)
  locationTitleContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationTitleTopSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: theme.spacing.xs,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  locationDestinationTitleBottomSection: {
    backgroundColor: theme.colors.green500, // Green background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  locationPickupTitleBottomSection: {
    backgroundColor: '#FF9800', // Orange background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  locationTitleTopText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  locationTitleBottomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
    lineHeight: 16,
  },
  etaPointer: {
    width: 3,
    height: 12,
    marginTop: 2,
  },
  pickupETAPointer: {
    backgroundColor: '#FF9800', // Orange for pickup
  },
  destinationETAPointer: {
    backgroundColor: '#4CAF50', // Green for destination
  },
  destinationETaPointer: {
    width: 3,
    height: 20,
    backgroundColor: theme.colors.green500,
  },
  destinationETaCircle: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    borderColor: theme.colors.green500,
    borderWidth: 3,
    borderRadius: 10,
  },
  pickupEtaPointer: {
    width: 3,
    height: 20,
    backgroundColor: theme.colors.orange600,
  },
  pickupEtaCircle: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    borderColor: theme.colors.orange600,
    borderWidth: 3,
    borderRadius: 10,
  }
});