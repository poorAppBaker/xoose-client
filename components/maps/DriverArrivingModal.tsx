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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';
import { DriverOption } from '../../types/driver';
import MapView from './MapView';
import InviteFriends from './InviteFriends';
import CancelRideModal from './CancelRideModal';
import { useRouter } from 'expo-router';

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

interface DriverArrivingModalProps {
  visible: boolean;
  selectedOption: DriverOption | null;
  pickup: any;
  destination: any;
  bookingId?: string;
  onClose: () => void;
  onCancelRide: () => void;
}

export default function DriverArrivingModal({
  visible,
  selectedOption,
  pickup,
  destination,
  bookingId,
  onClose,
  onCancelRide,
}: DriverArrivingModalProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [isExtended, setIsExtended] = useState(false);
  const [animatedDriverLocation, setAnimatedDriverLocation] = useState<[number, number] | null>(null);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [driverHasArrived, setDriverHasArrived] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0); // in seconds
  const [driverMovingToDestination, setDriverMovingToDestination] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Progress bar states
  const [pickupETAInSeconds, setPickupETAInSeconds] = useState(0); // pickupETA converted to seconds
  const [elapsedTime, setElapsedTime] = useState(0); // elapsed time since modal opened
  const [isDriverLate, setIsDriverLate] = useState(false);
  
  // ETA calculation states
  const [calculatedPickupETA, setCalculatedPickupETA] = useState<string>('');
  const [calculatedDestinationETA, setCalculatedDestinationETA] = useState<string>('');

  // Calculate distance between two coordinates using Haversine formula
  const calculateHaversineDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in kilometers
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Calculate ETA based on distance and speed
  const calculateETA = (distanceKm: number, speedKmH: number): string => {
    const minSpeed = 10; // km/h
    const maxSpeed = 110; // km/h
    const clampedSpeed = Math.max(minSpeed, Math.min(maxSpeed, speedKmH));
    
    const timeHours = distanceKm / clampedSpeed;
    const timeMinutes = Math.ceil(timeHours * 60);
    
    if (timeMinutes < 1) {
      return '< 1 min';
    } else if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Calculate arrival time
  const calculateArrivalTime = (minutesFromNow: number): string => {
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + minutesFromNow * 60000);
    return arrivalTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Convert ETA string to seconds
  const convertETAToSeconds = (etaString: string): number => {
    if (etaString.includes('< 1 min')) {
      return 30; // Less than 1 minute = 30 seconds
    } else if (etaString.includes('min')) {
      const minutes = parseInt(etaString.match(/(\d+)\s*min/)?.[1] || '0');
      return minutes * 60;
    } else if (etaString.includes('h')) {
      const hours = parseInt(etaString.match(/(\d+)h/)?.[1] || '0');
      const minutes = parseInt(etaString.match(/(\d+)m/)?.[1] || '0');
      return (hours * 60 + minutes) * 60;
    }
    return 300; // Default 5 minutes if parsing fails
  };

  // Helper function to calculate distance between two coordinates (in km)
  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Driver animation effect
  useEffect(() => {
    if (!visible || !selectedOption || !pickup) {
      return;
    }

    const { driver } = selectedOption;
    // Use driver's actual current location or fallback to a location near pickup
    const startLocation: [number, number] = driver.currentLocation?.coordinate || [
      pickup.coordinate[0] - 0.0025, // Mock location ~0.29km west of pickup (30 sec at 35km/h)
      pickup.coordinate[1] + 0.0025  // Mock location ~0.29km north of pickup (30 sec at 35km/h)
    ];

    // Set initial driver location
    setAnimatedDriverLocation(startLocation);

    // Calculate actual distance and animation duration
    const endLocation: [number, number] = pickup.coordinate;
    const distanceKm = calculateDistance(startLocation, endLocation);
    const speedKmh = 35; // Default city speed
    const timeHours = distanceKm / speedKmh;
    const animationDuration = timeHours * 60 * 60 * 1000; // Convert to milliseconds
    const updateInterval = 2000; // Update every 2 seconds
    const totalSteps = animationDuration / updateInterval;
    const stepDistance = distanceKm / totalSteps;

    let currentStep = 0;
    const startTime = Date.now();

    const animateDriver = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      if (progress >= 1) {
        // Animation complete - driver has arrived
        setAnimatedDriverLocation(endLocation);
        setDriverHasArrived(true);
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
        return;
      }

      // Calculate current position using linear interpolation
      const currentLng = startLocation[0] + (endLocation[0] - startLocation[0]) * progress;
      const currentLat = startLocation[1] + (endLocation[1] - startLocation[1]) * progress;

      setAnimatedDriverLocation([currentLng, currentLat]);
    };

    // Start animation
    animationIntervalRef.current = setInterval(animateDriver, updateInterval);

    // Cleanup on unmount or when modal closes
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
    };
  }, [visible, selectedOption, pickup]);

  // Elapsed time timer effect - tracks time since modal opened
  useEffect(() => {
    if (!visible) {
      setElapsedTime(0);
      setIsDriverLate(false);
      return;
    }

    const elapsedTimer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        
        // Check if driver is late (elapsed time > pickupETA)
        if (newTime > pickupETAInSeconds && !driverHasArrived) {
          setIsDriverLate(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(elapsedTimer);
  }, [visible, pickupETAInSeconds, driverHasArrived]);

  // Waiting time timer effect
  useEffect(() => {
    if (!driverHasArrived) {
      setWaitingTime(0);
      return;
    }

    const waitingTimer = setInterval(() => {
      setWaitingTime(prev => {
        const newTime = prev + 1;
        // If waiting time exceeds 15 seconds, start moving to destination
        if (newTime > 15 && !driverMovingToDestination) {
          setDriverMovingToDestination(true);
          startDestinationAnimation();
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(waitingTimer);
    };
  }, [driverHasArrived, driverMovingToDestination]);

  // Function to start destination animation
  const startDestinationAnimation = () => {
    if (!pickup || !destination) return;

    const startLocation: [number, number] = pickup.coordinate;
    const endLocation: [number, number] = destination.coordinate;

    // Calculate actual distance and animation duration
    const distanceKm = calculateDistance(startLocation, endLocation);
    const speedKmh = 35; // Default city speed
    const timeHours = distanceKm / speedKmh;
    const animationDuration = timeHours * 60 * 60 * 1000; // Convert to milliseconds
    const updateInterval = 2000; // Update every 2 seconds
    const startTime = Date.now();

    const animateToDestination = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

         if (progress >= 1) {
           // Animation complete - driver has reached destination
           setAnimatedDriverLocation(endLocation);
           if (animationIntervalRef.current) {
             clearInterval(animationIntervalRef.current);
             animationIntervalRef.current = null;
           }
           // Navigate to trip ended screen after a short delay
           setTimeout(() => {
             router.push({
               pathname: '/trip-ended',
               params: {
                 driverId: selectedOption?.driver.id,
                 tripFare: selectedOption?.fare.finalPrice,
                 bookingId: bookingId || null,
               }
             });
           }, 1000);
           return;
         }

      // Calculate current position using linear interpolation
      const currentLng = startLocation[0] + (endLocation[0] - startLocation[0]) * progress;
      const currentLat = startLocation[1] + (endLocation[1] - startLocation[1]) * progress;

      setAnimatedDriverLocation([currentLng, currentLat]);
    };

    // Start animation
    animationIntervalRef.current = setInterval(animateToDestination, updateInterval);
  };

  // Calculate ETAs when driver location or speed changes - MUST be before early return
  useEffect(() => {
    if (!visible || !selectedOption) {
      return;
    }

    const { driver } = selectedOption;
    if (!animatedDriverLocation || !pickup || !destination) {
      return;
    }

    const driverLocation = animatedDriverLocation; // Use animated location for real-time ETA
    const driverSpeed = 35; // Default city speed in km/h

    // Calculate distances
    const driverToPickupDist = calculateHaversineDistance(driverLocation, pickup.coordinate);
    const pickupToDestDist = calculateHaversineDistance(pickup.coordinate, destination.coordinate);

    // Calculate ETAs
    const pickupETA = calculateETA(driverToPickupDist, driverSpeed);
    const destinationETA = calculateETA(pickupToDestDist, driverSpeed);

    setCalculatedPickupETA(pickupETA);
    setCalculatedDestinationETA(`Arriving by ${calculateArrivalTime(Math.ceil((driverToPickupDist + pickupToDestDist) / driverSpeed * 60))}`);
    
    // Convert pickupETA to seconds for progress bar
    const etaInSeconds = convertETAToSeconds(pickupETA);
    setPickupETAInSeconds(etaInSeconds);

    console.log('⏰ DriverArrivingModal calculated ETAs:', {
      driverToPickupDist: `${driverToPickupDist.toFixed(2)} km`,
      pickupToDestDist: `${pickupToDestDist.toFixed(2)} km`,
      pickupETA,
      destinationETA,
      pickupETAInSeconds: etaInSeconds
    });
  }, [visible, selectedOption, animatedDriverLocation, pickup, destination]);

  if (!visible || !selectedOption) {
    return null;
  }

  const handlePullUp = () => {
    console.log('📱 DriverArrivingModal pulled up - showing extended view');
    setIsExtended(true);
  };

  const handlePullDown = () => {
    console.log('📱 DriverArrivingModal pulled down - showing unextended view');
    setIsExtended(false);
  };

  const handleCancelRide = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = (reason: string, customReason?: string) => {
    console.log('🚫 Ride cancelled:', { reason, customReason });
    setShowCancelModal(false);
    // Call the original onCancelRide callback
    onCancelRide();
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { translationY } = event;

      // If user pulled up (negative translationY) and moved more than 50px
      if (translationY < -50 && !isExtended) {
        runOnJS(handlePullUp)();
      }
      // If user pulled down (positive translationY) and moved more than 50px
      else if (translationY > 50 && isExtended) {
        runOnJS(handlePullDown)();
      }
    });

  const { driver, fare } = selectedOption;

  return (
    <View style={styles.container}>
      {/* Overlay - Only show when extended */}
      {isExtended && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handlePullDown}
        />
      )}

      {/* Map Section - Only show when not extended */}
      {!isExtended && (
        <View style={styles.mapContainer}>
          <MapView
            pickup={pickup}
            destination={destination}
            selectedLocation={undefined}
            showETALabels={true}
            showLocationTitles={true}
            calculateETAs={true}
            showDestinationMarker={driverMovingToDestination}
            showPickupMarker={!driverMovingToDestination}
            driverLocation={animatedDriverLocation || driver.currentLocation?.coordinate || [
              pickup.coordinate[0] - 0.0025, // Mock location ~0.29km west of pickup (30 sec at 35km/h)
              pickup.coordinate[1] + 0.0025  // Mock location ~0.29km north of pickup (30 sec at 35km/h)
            ]}
            driverSpeed={35} // Default city speed in km/h
            enableCarAnimation={false} // Disable MapView animation since DriverArrivingModal handles its own
            // pickupETA and destinationETA will be calculated automatically by MapView
          />
        </View>
      )}


      {/* Driver Arrival Progress Bar - Show progress from driver location to pickup and waiting time */}
      {!driverMovingToDestination && (
        <View style={styles.waitingTimeCard}>
          <Text style={styles.waitingTimeText}>
            {elapsedTime >= pickupETAInSeconds 
              ? "Extra-waiting fee: $5" 
              : `Expected arrival: ${calculatedPickupETA}`
            }
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min((elapsedTime / pickupETAInSeconds) * 100, 100)}%`,
                    backgroundColor: elapsedTime >= pickupETAInSeconds ? '#FF4444' : theme.colors.blue500
                  }
                ]}
              />
            </View>
            <Text style={styles.waitingTimer}>
              {`${Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:${(elapsedTime % 60).toString().padStart(2, '0')}`}
            </Text>
          </View>
        </View>
      )}


      {/* Modal Content */}
      <View style={isExtended ? styles.extendedModal : styles.modal}>

        {/* Pull-up Handle - Only show when not extended */}
        {!isExtended && (
          <GestureDetector gesture={panGesture}>
            <View style={styles.pullUpHandle}>
              <View style={styles.pullUpIndicator} />
            </View>
          </GestureDetector>
        )}

        {/* Pull-down Handle - Only show when extended */}
        {isExtended && (
          <GestureDetector gesture={panGesture}>
            <View style={styles.pullDownHandle}>
              <View style={styles.pullDownIndicator} />
            </View>
          </GestureDetector>
        )}

        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {driverMovingToDestination ? "Driving to Destination" :
                driverHasArrived ? "Driver has Arrived" : `Arriving in ${calculatedPickupETA}`}
            </Text>
          </View>
          <View style={styles.licensePlate}>
            <Text style={styles.licensePlateText}>AB-32-CD</Text>
          </View>
        </View>

        {isExtended ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Driver Arrival Progress Bar - Show progress from driver location to pickup and waiting time */}
            {!driverMovingToDestination && (
              <View>
                <Text style={styles.waitingTimeText}>
                  {elapsedTime >= pickupETAInSeconds 
                    ? "Extra-waiting fee: $5" 
                    : `Expected arrival: ${calculatedPickupETA}`
                  }
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min((elapsedTime / pickupETAInSeconds) * 100, 100)}%`,
                          backgroundColor: elapsedTime >= pickupETAInSeconds ? '#FF4444' : theme.colors.blue500
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.waitingTimer}>
                    {`${Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:${(elapsedTime % 60).toString().padStart(2, '0')}`}
                  </Text>
                </View>
              </View>
            )}

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
                  <Text style={styles.estimatedTime}>{calculatedDestinationETA}</Text>
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

            {/* Contact Section */}
            <View style={styles.contactSection}>
              {
                driverMovingToDestination ?
                  <View style={styles.contactButtons}>
                    <TouchableOpacity style={styles.contactButton}>
                      <Ionicons name="call" size={20} color={theme.colors.blue500} />
                      <Text style={styles.contactButtonText}>Add to My Trusted Drivers</Text>
                    </TouchableOpacity>
                  </View> :
                  <View>
                    <Text style={styles.contactTitle}>Contact</Text>
                    <View style={styles.contactButtons}>
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="call" size={20} color={theme.colors.blue500} />
                        <Text style={styles.contactButtonText}>Phone</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="mail" size={20} color={theme.colors.blue500} />
                        <Text style={styles.contactButtonText}>Message</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
              }
            </View>

            {/* Invite Friends Section - Show when waiting time exceeds 5 minutes */}
            {/* {waitingTime > 15 && (
              <InviteFriends visible={true} />
            )} */}

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

                <View style={styles.detailsSection}>
                  <View style={styles.detailFieldContainer}>
                    <Text style={styles.detailsTitle}>Who Will Take the Trip</Text>
                    <View style={styles.detailField}>
                      <Text style={styles.fieldText}>Trip for myself</Text>
                    </View>
                  </View>

                  <View style={styles.detailFieldContainer}>
                    <Text style={styles.detailsTitle}>Profile & Payment</Text>
                    <View style={styles.detailField}>
                      <Text style={styles.fieldText}>Personal |</Text>
                      <Image source={require('../../assets/images/mastercard.png')} style={styles.cardIcon} />
                      <Text style={styles.fieldText}>**** 3956</Text>
                    </View>
                  </View>

                  <View style={styles.detailFieldContainer}>
                    <Text style={styles.detailsTitle}>Coupon</Text>
                    <View style={styles.detailField}>
                      <Text style={styles.fieldText}>-20% Discount</Text>
                    </View>
                  </View>

                   {/* Action Buttons */}
                   <View style={styles.actionButtons}>
                     <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
                       <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                     </TouchableOpacity>
                     {
                       driverHasArrived && (
                         <TouchableOpacity style={styles.safetyToolsButton}>
                           <Text style={styles.safetyToolsButtonText}>Safety Tools</Text>
                         </TouchableOpacity>
                       )
                     }
                   </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
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
                  <Text style={styles.estimatedTime}>{calculatedPickupETA || `${fare.estimatedTime} min`}</Text>
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

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Contact</Text>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="call" size={20} color={theme.colors.blue500} />
                  <Text style={styles.contactButtonText}>Phone</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="mail" size={20} color={theme.colors.blue500} />
                  <Text style={styles.contactButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
         )}
       </View>

       {/* Cancel Ride Modal */}
       <CancelRideModal
         visible={showCancelModal}
         onClose={handleCancelModalClose}
         onConfirm={handleCancelConfirm}
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
    zIndex: 99999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  waitingTimeCard: {
    position: 'absolute',
    bottom: '56%',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    zIndex: 3,
    ...theme.shadows.md,
  },
  waitingTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.blue500,
    borderRadius: 4,
  },
  waitingTimer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    minWidth: 50,
    textAlign: 'right',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.md, // Account for safe area
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: screenHeight * 0.6,
    ...theme.shadows.lg,
  },
  extendedModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: theme.spacing.md, // Account for safe area
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: screenHeight * 0.9,
    ...theme.shadows.lg,
  },
  pullUpHandle: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pullUpIndicator: {
    width: 100,
    height: 5,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
  },
  pullDownHandle: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  pullDownIndicator: {
    width: 100,
    height: 5,
    backgroundColor: theme.colors.gray300,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  licensePlate: {
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  licensePlateText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  mainSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
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
    gap: 2,
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
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  vehicleRating: {
    fontSize: 14,
    color: theme.colors.black,
  },
  vehicleFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  pricingContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingVertical: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  pricingContainerExtended: {
  },
  etatimeContainer: {
    marginBottom: theme.spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  estimateTimeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  estimatedTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginLeft: theme.spacing.xs,
  },
  companyName: {
    fontSize: 16,
    color: theme.colors.black,
  },
  pricingSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
  contactSection: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  tripDetailsSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.gray200,
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
  editIcon: {
    width: 16,
    height: 16,
    tintColor: theme.colors.blue500,
  },
  editDestinationsText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '600',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  destinationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationIcon: {
    width: 12,
    height: 12,
    tintColor: theme.colors.white,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.black,
  },
  locationInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  saveButtonText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  detailFieldContainer: {
    borderBottomWidth: 1,
    borderColor: theme.colors.gray200,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  detailField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  fieldText: {
    fontSize: 14,
    color: theme.colors.black,
  },
  cardIcon: {
    width: 24,
    height: 16,
    marginHorizontal: theme.spacing.sm,
  },
  actionButtons: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#B3261E',
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B3261E',
  },
  safetyToolsButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  safetyToolsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  filterChipIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
});

const styles = createStyles(theme);
