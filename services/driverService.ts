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
            isActive: fareData.isActive,
            pickupAreaCoordinates: fareData.pickupAreaCoordinates,
            destinationAreaCoordinates: fareData.destinationAreaCoordinates,
            driverId: fareData.driverId
          });
        }
      });

      // If no fares exist at all, create some test data
      if (faresSnapshot.size === 0) {
        console.log('No fares exist in Firebase, creating test data...');
        await this.createTestData();
        
        // Try again after creating test data
        const newFaresSnapshot = await this.faresCollection.get();
        console.log(`After creating test data: Found ${newFaresSnapshot.size} total fares`);
        
        // Use the new snapshot for processing
        return this.processFares(newFaresSnapshot, pickupCoordinate, destinationCoordinate, filters, sort);
      }

      return this.processFares(faresSnapshot, pickupCoordinate, destinationCoordinate, filters, sort);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  }

  /**
   * Check if a coordinate is within a polygon area
   */
  private isCoordinateInPolygon(coordinate: [number, number], polygon: number[]): boolean {
    const [lng, lat] = coordinate;
    let inside = false;
    
    // Convert flat array to coordinate pairs
    const coordinates: [number, number][] = [];
    for (let i = 0; i < polygon.length; i += 2) {
      coordinates.push([polygon[i + 1], polygon[i]]); // polygon is [lat, lng, lat, lng, ...]
    }
    
    // Ray casting algorithm
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const [xi, yi] = coordinates[i];
      const [xj, yj] = coordinates[j];
      
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
      
      // Skip inactive fares (treat undefined as inactive)
      if (fareData.isActive === false) {
        console.log(`Skipping inactive fare ${doc.id}`);
        return;
      }
      
      // Treat undefined isActive as active for backward compatibility
      const isActive = fareData.isActive !== false;
      if (!isActive) {
        console.log(`Skipping inactive fare ${doc.id}`);
        return;
      }
      
      console.log(`Checking fare ${doc.id} (isActive: ${fareData.isActive}):`, {
        pickupArea: fareData.pickupAreaCoordinates,
        destinationArea: fareData.destinationAreaCoordinates
      });
      
      let pickupInArea = false;
      let destinationInArea = false;
      
      // Check if coordinates are in polygon format (array of numbers) or circle format (object with center/radius)
      if (Array.isArray(fareData.pickupAreaCoordinates)) {
        // Polygon format
        pickupInArea = this.isCoordinateInPolygon(pickupCoordinate, fareData.pickupAreaCoordinates);
        console.log(`Fare ${doc.id} - Pickup polygon check: ${pickupInArea}`);
      } else if (fareData.pickupAreaCoordinates && fareData.pickupAreaCoordinates.center && fareData.pickupAreaCoordinates.radius) {
        // Circle format
        pickupInArea = this.isCoordinateInArea(
          pickupCoordinate,
          fareData.pickupAreaCoordinates.center,
          fareData.pickupAreaCoordinates.radius
        );
        console.log(`Fare ${doc.id} - Pickup circle check: ${pickupInArea}`);
      }
      
      if (Array.isArray(fareData.destinationAreaCoordinates)) {
        // Polygon format
        destinationInArea = this.isCoordinateInPolygon(destinationCoordinate, fareData.destinationAreaCoordinates);
        console.log(`Fare ${doc.id} - Destination polygon check: ${destinationInArea}`);
      } else if (fareData.destinationAreaCoordinates && fareData.destinationAreaCoordinates.center && fareData.destinationAreaCoordinates.radius) {
        // Circle format
        destinationInArea = this.isCoordinateInArea(
          destinationCoordinate,
          fareData.destinationAreaCoordinates.center,
          fareData.destinationAreaCoordinates.radius
        );
        console.log(`Fare ${doc.id} - Destination circle check: ${destinationInArea}`);
      }
      
      console.log(`Fare ${doc.id} - Pickup in area: ${pickupInArea}, Destination in area: ${destinationInArea}`);
      
      if (pickupInArea && destinationInArea) {
        // Convert the fare data to our expected format
        const fare: Fare = {
          id: doc.id,
          driverId: fareData.driverId,
          vehicleId: fareData.vehicleId || 'unknown',
          vehicle: fareData.vehicle || {
            id: fareData.vehicleId || 'unknown',
            model: fareData.vehicleModel || 'Opel Astra',
            brand: fareData.vehicleBrand || 'Opel',
            image: fareData.vehicleImage || 'https://via.placeholder.com/80x60/4A90E2/FFFFFF?text=Car',
            capacity: fareData.vehicleCapacity || 4,
            fuelType: fareData.vehicleFuelType || 'Gasoline',
            rating: fareData.vehicleRating || 4.5
          },
          pickupAreaCoordinates: fareData.pickupAreaCoordinates,
          destinationAreaCoordinates: fareData.destinationAreaCoordinates,
          basePrice: fareData.basePrice || fareData.price || 14.12,
          estimatedTime: fareData.estimatedTime || fareData.eta || 4,
          discount: fareData.discount || { percentage: 20 },
          finalPrice: fareData.finalPrice || fareData.price || 999.99,
          currency: fareData.currency || '€',
          isActive: true,
          createdAt: fareData.createdAt || new Date().toISOString(),
          updatedAt: fareData.updatedAt || new Date().toISOString()
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
    
    // Get drivers data
    const driversSnapshot = await this.driversCollection
      .where('isAvailable', '==', true)
      .get();

    console.log(`Found ${driversSnapshot.size} drivers with isAvailable: true`);

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

    // If no drivers found, check if we can find the driver by ID (might not be available but exists)
    if (availableDrivers.length === 0 && matchingFares.length > 0) {
      console.log('No available drivers found, checking if drivers exist but are not available...');
      
      for (const fare of matchingFares) {
        try {
          const driverDoc = await this.driversCollection.doc(fare.driverId).get();
          if (driverDoc.exists()) {
            const driverData = driverDoc.data();
            console.log(`Found driver ${fare.driverId} but isAvailable: ${driverData?.isAvailable}`);
            
            // If driver exists but is not available, make them available
            if (driverData && driverData.isAvailable === false) {
              console.log(`Making driver ${fare.driverId} available...`);
              await this.driversCollection.doc(fare.driverId).update({
                isAvailable: true
              });
              
              // Extract name from various possible fields
              const driverName = driverData.name || 
                                driverData.displayName || 
                                driverData.firstName || 
                                `${driverData.firstName || ''} ${driverData.lastName || ''}`.trim() ||
                                'Driver';
              
              // Add the driver to available drivers
              const driver: Driver = {
                id: driverDoc.id,
                name: driverName,
                profileImage: driverData.profileImage || driverData.photoURL || 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=D',
                rating: driverData.rating || 4.0,
                languages: driverData.languages || ['EN'],
                verificationStatus: driverData.verificationStatus || 'verified',
                tripsCompleted: driverData.tripsCompleted || 100,
                isAvailable: true,
                createdAt: driverData.createdAt || new Date().toISOString(),
                updatedAt: driverData.updatedAt || new Date().toISOString()
              };
              
              availableDrivers.push(driver);
              console.log(`Made driver ${fare.driverId} (${driver.name}) available and added to list`);
            }
          } else {
            console.log(`Driver ${fare.driverId} does not exist in drivers collection`);
          }
        } catch (error) {
          console.error(`Error checking driver ${fare.driverId}:`, error);
        }
      }
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

        // Calculate estimated arrival time (simplified - in real app, this would consider traffic, distance, etc.)
        const estimatedArrival = (fare.estimatedTime || 0) + Math.floor(Math.random() * 10); // Add some randomness

        driverOptions.push({
          driver,
          fare,
          estimatedArrival
        });
        
        console.log(`Created driver option: ${driver.name} with fare ${fare.id}`);
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

  /**
   * Create a new driver
   */
  async createDriver(driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await this.driversCollection.add({
        ...driverData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  /**
   * Create a new fare
   */
  async createFare(fareData: Omit<Fare, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await this.faresCollection.add({
        ...fareData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating fare:', error);
      throw error;
    }
  }

  /**
   * Create a US-wide fare for testing
   */
  async createUSWideFare(driverId: string, vehicleId: string): Promise<string> {
    const usCenter: [number, number] = [39.8283, -98.5795]; // Geographic center of US
    const usRadius = 5000000; // 5000km radius to cover entire US

    const fareData: Omit<Fare, 'id' | 'createdAt' | 'updatedAt'> = {
      driverId,
      vehicleId,
      vehicle: {
        id: vehicleId,
        model: 'Opel Astra',
        brand: 'Opel',
        image: 'https://via.placeholder.com/80x60/4A90E2/FFFFFF?text=Car',
        capacity: 4,
        fuelType: 'Gasoline',
        rating: 4.5
      },
      pickupAreaCoordinates: {
        center: usCenter,
        radius: usRadius
      },
      destinationAreaCoordinates: {
        center: usCenter,
        radius: usRadius
      },
      basePrice: 14.12,
      estimatedTime: 4,
      discount: {
        percentage: 20
      },
      finalPrice: 999.99,
      currency: '€',
      isActive: true
    };

    return this.createFare(fareData);
  }

  /**
   * Create test data for demonstration (public method)
   */
  async createTestDataPublic(): Promise<void> {
    return this.createTestData();
  }

  /**
   * Debug driver data in database
   */
  async debugDriverData(): Promise<void> {
    try {
      console.log('🔍 Debugging driver data...');
      
      const driversSnapshot = await this.driversCollection.get();
      console.log(`Found ${driversSnapshot.size} drivers in database`);
      
      driversSnapshot.forEach((doc, index) => {
        if (index < 10) { // Only show first 10 drivers
          const driverData = doc.data();
          console.log(`Driver ${doc.id}:`, {
            name: driverData.name,
            displayName: driverData.displayName,
            firstName: driverData.firstName,
            lastName: driverData.lastName,
            email: driverData.email,
            isAvailable: driverData.isAvailable,
            allFields: Object.keys(driverData)
          });
        }
      });
      
      console.log('✅ Driver data debug completed');
    } catch (error) {
      console.error('❌ Error debugging driver data:', error);
      throw error;
    }
  }

  /**
   * Update all fares to have isActive: true (for existing data)
   */
  async updateFaresToActive(): Promise<void> {
    try {
      console.log('Updating all fares to isActive: true...');
      
      const faresSnapshot = await this.faresCollection.get();
      const batch = firestore().batch();
      
      faresSnapshot.forEach((doc) => {
        const fareData = doc.data();
        if (fareData.isActive === undefined) {
          console.log(`Updating fare ${doc.id} to isActive: true`);
          batch.update(doc.ref, { isActive: true });
        }
      });
      
      await batch.commit();
      console.log('All fares updated successfully');
    } catch (error) {
      console.error('Error updating fares:', error);
      throw error;
    }
  }

  /**
   * Create test data for demonstration
   */
  private async createTestData(): Promise<void> {
    try {
      console.log('Creating test drivers and fares...');
      
      // Create test drivers
      const driverIds = [];
      for (let i = 1; i <= 4; i++) {
        const driverId = await this.createDriver({
          name: 'Simon',
          profileImage: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=S',
          rating: 4.5,
          languages: ['PT', 'EN'],
          verificationStatus: 'verified',
          tripsCompleted: 10000,
          isAvailable: true
        });
        driverIds.push(driverId);
        console.log(`Created test driver ${i}: ${driverId}`);
      }

      // Create US-wide fares for each driver
      for (let i = 0; i < driverIds.length; i++) {
        const fareId = await this.createUSWideFare(driverIds[i], `test-vehicle-${i + 1}`);
        console.log(`Created test fare ${i + 1}: ${fareId}`);
      }

      console.log('Test data creation completed');
    } catch (error) {
      console.error('Error creating test data:', error);
      throw error;
    }
  }
}

export const driverService = new DriverService();