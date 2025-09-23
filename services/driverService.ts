// services/driverService.ts
import firestore from '@react-native-firebase/firestore';
import { Driver, Fare, DriverOption, DriverSelectionFilters, DriverSelectionSort } from '../types/driver';

class DriverService {
  private driversCollection = firestore().collection('drivers');
  private faresCollection = firestore().collection('fares');

  /**
   * Check if a coordinate is within a circular area
   */
  private isCoordinateInArea(
    coordinate: [number, number],
    areaCenter: [number, number],
    radius: number
  ): boolean {
    const [lat1, lon1] = coordinate;
    const [lat2, lon2] = areaCenter;
    
    // If radius is very large (like covering entire US), consider it as covering everything
    // US is roughly 4,500 km wide, so if radius is > 3,000,000 meters (3000km), consider it US-wide
    if (radius > 3000000) {
      console.log(`Large radius detected (${radius}m), treating as US-wide coverage`);
      return true;
    }
    
    // Haversine formula to calculate distance between two points
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    
    console.log(`Distance calculation: ${distance}m vs radius: ${radius}m`);
    return distance <= radius;
  }

  /**
   * Get available drivers and their fares based on pickup and destination coordinates
   */
  async getAvailableDrivers(
    pickupCoordinate: [number, number],
    destinationCoordinate: [number, number],
    filters?: DriverSelectionFilters,
    sort?: DriverSelectionSort
  ): Promise<DriverOption[]> {
    try {
      console.log('Fetching available drivers for:', {
        pickup: pickupCoordinate,
        destination: destinationCoordinate,
        filters,
        sort
      });

      // Get all fares (we'll filter by isActive in processing since some might have undefined isActive)
      const faresSnapshot = await this.faresCollection.get();
      console.log(`Found ${faresSnapshot.size} total fares in Firebase`);

      // Log the first few fares to see their structure
      faresSnapshot.forEach((doc, index) => {
        if (index < 3) { // Only log first 3 fares
          const fareData = doc.data();
          console.log(`Fare ${doc.id}:`, {
            title: fareData.title,
            driverId: fareData.driverId,
            pickupAreaEnabled: fareData.pickupAreaEnabled,
            destinationAreaEnabled: fareData.destinationAreaEnabled,
            pickupAreaCoordinates: fareData.pickupAreaCoordinates ? `${fareData.pickupAreaCoordinates.length} coordinates` : 'none',
            destinationAreaCoordinates: fareData.destinationAreaCoordinates ? `${fareData.destinationAreaCoordinates.length} coordinates` : 'none',
            minimumFare: fareData.minimumFare,
            passengerCount: fareData.passengerCount
          });
        }
      });

      // If no fares exist, return empty array (don't create test data automatically)
      if (faresSnapshot.size === 0) {
        console.log('No fares exist in Firebase, returning empty array');
        return [];
      }

      return this.processFares(faresSnapshot, pickupCoordinate, destinationCoordinate, filters, sort);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  }

  /**
   * Convert flat coordinate array [lat, lng, lat, lng, ...] to nested array [[lng, lat], [lng, lat], ...]
   * Note: We convert to [lng, lat] format to match the coordinate parameter format
   */
  private convertFlatToNestedCoordinates(flatArray: number[]): [number, number][] {
    if (!flatArray || flatArray.length === 0) return [];
    
    const result: [number, number][] = [];
    for (let i = 0; i < flatArray.length; i += 2) {
      if (i + 1 < flatArray.length) {
        const lat = flatArray[i];
        const lng = flatArray[i + 1];
        result.push([lng, lat]); // Convert to [lng, lat] format
      }
    }
    return result;
  }

  /**
   * Check if a coordinate is within a polygon area
   */
  private isCoordinateInPolygon(coordinate: [number, number], polygon: [number, number][]): boolean {
    const [lng, lat] = coordinate;
    let inside = false;
    
    // Ray casting algorithm - polygon is already in nested format [[lat, lng], [lat, lng], ...]
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i]; // xi = lat, yi = lng
      const [xj, yj] = polygon[j]; // xj = lat, yj = lng
      
      if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Process fares snapshot and return matching driver options
   */
  private async processFares(
    faresSnapshot: any,
    pickupCoordinate: [number, number],
    destinationCoordinate: [number, number],
    filters?: DriverSelectionFilters,
    sort?: DriverSelectionSort
  ): Promise<DriverOption[]> {
    const matchingFares: Fare[] = [];
      
    // Filter fares based on pickup and destination areas
    faresSnapshot.forEach((doc: any) => {
      const fareData = doc.data();
      
      console.log(`Checking fare ${doc.id}:`, {
        title: fareData.title,
        driverId: fareData.driverId,
        pickupAreaEnabled: fareData.pickupAreaEnabled,
        destinationAreaEnabled: fareData.destinationAreaEnabled,
        pickupAreaCoordinates: fareData.pickupAreaCoordinates ? `${fareData.pickupAreaCoordinates.length} coordinates` : 'none',
        destinationAreaCoordinates: fareData.destinationAreaCoordinates ? `${fareData.destinationAreaCoordinates.length} coordinates` : 'none'
      });
      
      let pickupInArea = false;
      let destinationInArea = false;
      
      // Check pickup area if enabled
      if (fareData.pickupAreaEnabled && fareData.pickupAreaCoordinates) {
        // Convert flat array to nested array format for polygon check
        const pickupCoords = this.convertFlatToNestedCoordinates(fareData.pickupAreaCoordinates);
        pickupInArea = this.isCoordinateInPolygon(pickupCoordinate, pickupCoords);
        console.log(`Fare ${doc.id} - Pickup polygon check: ${pickupInArea}`);
      } else if (!fareData.pickupAreaEnabled) {
        // If pickup area is disabled, consider it as covering all areas
        pickupInArea = true;
        console.log(`Fare ${doc.id} - Pickup area disabled, allowing all pickup locations`);
      }
      
      // Check destination area if enabled
      if (fareData.destinationAreaEnabled && fareData.destinationAreaCoordinates) {
        // Convert flat array to nested array format for polygon check
        const destinationCoords = this.convertFlatToNestedCoordinates(fareData.destinationAreaCoordinates);
        destinationInArea = this.isCoordinateInPolygon(destinationCoordinate, destinationCoords);
        console.log(`Fare ${doc.id} - Destination polygon check: ${destinationInArea}`);
      } else if (!fareData.destinationAreaEnabled) {
        // If destination area is disabled, consider it as covering all areas
        destinationInArea = true;
        console.log(`Fare ${doc.id} - Destination area disabled, allowing all destination locations`);
      }
      
      console.log(`Fare ${doc.id} - Pickup in area: ${pickupInArea}, Destination in area: ${destinationInArea}`);
      
      if (pickupInArea && destinationInArea) {
        // Convert the fare data to our expected format
        const fare: Fare = {
          id: doc.id,
          driverId: fareData.driverId,
          vehicleId: fareData.vehicleId || 'unknown',
          vehicle: {
            id: fareData.vehicleId || 'unknown',
            model: fareData.vehicleModel || 'Opel Astra',
            brand: fareData.vehicleBrand || 'Opel',
            image: fareData.vehicleImage || 'https://via.placeholder.com/80x60/4A90E2/FFFFFF?text=Car',
            capacity: fareData.passengerCount === 'All' ? 8 : parseInt(fareData.passengerCount) || 4,
            fuelType: fareData.vehicleFuelType || '',
            rating: fareData.vehicleRating || 4.5
          },
          pickupAreaCoordinates: fareData.pickupAreaCoordinates,
          destinationAreaCoordinates: fareData.destinationAreaCoordinates,
          basePrice: parseFloat(fareData.minimumFare) || 14.12,
          pricePerKm: 2.5, // Default price per kilometer
          estimatedTime: 4, // Default estimated time
          discount: fareData.percentageAdjustment ? { 
            percentage: parseInt(fareData.percentageValue) || 0 
          } : undefined,
          finalPrice: parseFloat(fareData.minimumFare) || 14.12,
          currency: '€', // Default currency
          isActive: true,
          createdAt: fareData.createdAt?.toDate ? fareData.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: fareData.updatedAt?.toDate ? fareData.updatedAt.toDate().toISOString() : new Date().toISOString()
        };
        
        matchingFares.push(fare);
        console.log(`Fare ${doc.id} added to matching fares`);
      }
    });

    console.log(`Found ${matchingFares.length} matching fares`);

    if (matchingFares.length === 0) {
      console.log('No matching fares found, returning empty array');
      return [];
    }

    // Get driver IDs from matching fares
    const driverIds = [...new Set(matchingFares.map(fare => fare.driverId))];
    console.log(`Looking for drivers with IDs: ${driverIds.join(', ')}`);
    
    // Get drivers data (no isAvailable filter since you don't need this condition)
    const driversSnapshot = await this.driversCollection.get();

    console.log(`Found ${driversSnapshot.size} total drivers`);

    // Log all available drivers to see what we have
    driversSnapshot.forEach((doc, index) => {
      if (index < 5) { // Only log first 5 drivers
        const driverData = doc.data();
        console.log(`Available driver ${doc.id}:`, {
          name: driverData.name,
          displayName: driverData.displayName,
          firstName: driverData.firstName,
          lastName: driverData.lastName,
          isAvailable: driverData.isAvailable,
          verificationStatus: driverData.verificationStatus,
          allFields: Object.keys(driverData)
        });
      }
    });

    const availableDrivers: Driver[] = [];
    driversSnapshot.forEach(doc => {
      const driverData = doc.data();
      
      // Extract name from various possible fields
      const driverName = driverData.name || 
                        driverData.displayName || 
                        driverData.firstName || 
                        `${driverData.firstName || ''} ${driverData.lastName || ''}`.trim() ||
                        'Driver';
      
      const driver: Driver = {
        id: doc.id,
        name: driverName,
        profileImage: driverData.profileImage || driverData.photoURL || 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=D',
        rating: driverData.rating || 4.0,
        languages: driverData.languages || ['EN'],
        verificationStatus: driverData.verificationStatus || 'verified',
        tripsCompleted: driverData.tripsCompleted || 100,
        isAvailable: driverData.isAvailable || true,
        createdAt: driverData.createdAt || new Date().toISOString(),
        updatedAt: driverData.updatedAt || new Date().toISOString()
      };
      
      if (driverIds.includes(driver.id)) {
        availableDrivers.push(driver);
        console.log(`Driver ${driver.id} (${driver.name}) matched and added`);
      } else {
        console.log(`Driver ${driver.id} (${driver.name}) not in required list: ${driverIds.join(', ')}`);
      }
    });

    console.log(`Found ${availableDrivers.length} available drivers that match fare requirements`);

    // Log if no drivers found for matching fares
    if (availableDrivers.length === 0 && matchingFares.length > 0) {
      console.log('No drivers found for matching fares');
    }

    // Combine drivers with their fares
    const driverOptions: DriverOption[] = [];
    
    for (const driver of availableDrivers) {
      const driverFares = matchingFares.filter(fare => fare.driverId === driver.id);
      
      for (const fare of driverFares) {
        // Apply filters
        if (filters) {
          // Passenger count filter
          if (filters.passengerCount && fare.vehicle.capacity < filters.passengerCount) {
            continue;
          }
          
          // Language filter
          if (filters.language && !driver.languages?.includes(filters.language)) {
            continue;
          }
          
          // Verification filter
          if (filters.verifiedOnly && driver.verificationStatus !== 'verified') {
            continue;
          }
          
          // Max wait time filter
          if (filters.maxWaitTime && (fare.estimatedTime || 0) > filters.maxWaitTime) {
            continue;
          }
        }

        // Calculate distance from pickup to destination using Haversine formula
        const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
          const R = 6371; // Earth's radius in kilometers
          const [lat1, lon1] = coord1;
          const [lat2, lon2] = coord2;
          
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        const pickupToDestinationDistance = calculateDistance(pickupCoordinate, destinationCoordinate);
        
        // Calculate estimated arrival time based on pickup to destination distance
        const speedKmh = 35; // Average city speed
        const estimatedArrival = Math.ceil((pickupToDestinationDistance / speedKmh) * 60); // Convert to minutes
        
        // Calculate final price based on pricePerKm * distance
        const calculatedPrice = fare.pricePerKm * pickupToDestinationDistance;
        const finalPrice = Math.max(calculatedPrice, fare.basePrice); // Use base price as minimum
        
        // Update fare with calculated values
        const updatedFare = {
          ...fare,
          finalPrice: finalPrice
        };

        driverOptions.push({
          driver,
          fare: updatedFare,
          estimatedArrival
        });
        
        console.log(`Created driver option: ${driver.name} with fare ${fare.id}`);
        console.log(`Distance: ${pickupToDestinationDistance.toFixed(2)}km, ETA: ${estimatedArrival}min, Price: €${finalPrice.toFixed(2)}`);
      }
    }

    console.log(`Created ${driverOptions.length} total driver options`);

    // Apply sorting
    if (sort) {
      driverOptions.sort((a, b) => {
        let comparison = 0;
        
        switch (sort.field) {
          case 'price':
            comparison = a.fare.finalPrice - b.fare.finalPrice;
            break;
          case 'rating':
            comparison = b.driver.rating - a.driver.rating; // Higher rating first
            break;
          case 'arrivalTime':
            comparison = a.estimatedArrival - b.estimatedArrival;
            break;
        }
        
        return sort.order === 'asc' ? comparison : -comparison;
      });
    }

    console.log(`Returning ${driverOptions.length} driver options`);
    return driverOptions;
  }

  /**
   * Get driver details by ID
   */
  async getDriverById(driverId: string): Promise<Driver | null> {
    try {
      const doc = await this.driversCollection.doc(driverId).get();
      return doc.exists() ? { id: doc.id, ...doc.data() } as Driver : null;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  }

  /**
   * Get fare details by ID
   */
  async getFareById(fareId: string): Promise<Fare | null> {
    try {
      const doc = await this.faresCollection.doc(fareId).get();
      return doc.exists() ? { id: doc.id, ...doc.data() } as Fare : null;
    } catch (error) {
      console.error('Error fetching fare:', error);
      throw error;
    }
  }
}

export const driverService = new DriverService();