// utils/createTestData.ts
import { driverService } from '../services/driverService';

/**
 * Utility to create test data for driver service
 */
export const createTestData = {
  /**
   * Create test drivers and fares
   */
  async createAll(): Promise<void> {
    try {
      console.log('🚀 Creating test data...');
      await driverService.createTestDataPublic();
      console.log('✅ Test data created successfully!');
    } catch (error) {
      console.error('❌ Error creating test data:', error);
      throw error;
    }
  },

  /**
   * Create a single US-wide fare for testing
   */
  async createSingleFare(): Promise<{ driverId: string; fareId: string }> {
    try {
      console.log('🚀 Creating single test fare...');
      
      // Create a test driver
      const driverId = await driverService.createDriver({
        name: 'Test Driver',
        profileImage: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=T',
        rating: 4.5,
        languages: ['EN'],
        verificationStatus: 'verified',
        tripsCompleted: 1000,
        isAvailable: true
      });
      
      console.log(`✅ Created test driver: ${driverId}`);
      
      // Create US-wide fare
      const fareId = await driverService.createUSWideFare(driverId, 'test-vehicle-1');
      console.log(`✅ Created test fare: ${fareId}`);
      
      return { driverId, fareId };
    } catch (error) {
      console.error('❌ Error creating single fare:', error);
      throw error;
    }
  },

  /**
   * Test the driver service with Texas coordinates
   */
  async testTexasCoordinates(): Promise<void> {
    try {
      console.log('🚀 Testing with Texas coordinates...');
      
      const pickup: [number, number] = [-94.916206, 29.395031]; // Texas City
      const destination: [number, number] = [-96.343407, 30.610066]; // Texas A&M
      
      const options = await driverService.getAvailableDrivers(pickup, destination);
      
      console.log(`✅ Found ${options.length} driver options for Texas coordinates`);
      
      if (options.length > 0) {
        console.log('Sample option:', {
          driver: options[0].driver.name,
          vehicle: options[0].fare.vehicle.model,
          price: options[0].fare.finalPrice,
          currency: options[0].fare.currency
        });
      }
    } catch (error) {
      console.error('❌ Error testing Texas coordinates:', error);
      throw error;
    }
  },

  /**
   * Update existing fares to have isActive: true
   */
  async updateExistingFares(): Promise<void> {
    try {
      console.log('🚀 Updating existing fares to isActive: true...');
      await driverService.updateFaresToActive();
      console.log('✅ All fares updated successfully!');
    } catch (error) {
      console.error('❌ Error updating fares:', error);
      throw error;
    }
  },

  /**
   * Check and create drivers for existing fares
   */
  async checkAndCreateDrivers(): Promise<void> {
    try {
      console.log('🚀 Checking drivers for existing fares...');
      
      // Import firestore to check drivers
      const firestore = require('@react-native-firebase/firestore').default;
      const driversCollection = firestore().collection('drivers');
      const faresCollection = firestore().collection('fares');
      
      // Get all fares
      const faresSnapshot = await faresCollection.get();
      console.log(`Found ${faresSnapshot.size} fares`);
      
      // Get all drivers
      const driversSnapshot = await driversCollection.get();
      console.log(`Found ${driversSnapshot.size} drivers`);
      
      const existingDriverIds = new Set();
      driversSnapshot.forEach(doc => {
        existingDriverIds.add(doc.id);
      });
      
      // Check each fare for missing drivers
      const missingDrivers = new Set();
      faresSnapshot.forEach(doc => {
        const fareData = doc.data();
        if (fareData.driverId && !existingDriverIds.has(fareData.driverId)) {
          missingDrivers.add(fareData.driverId);
        }
      });
      
      console.log(`Found ${missingDrivers.size} missing drivers:`, Array.from(missingDrivers));
      
      // Create missing drivers
      for (const driverId of missingDrivers) {
        console.log(`Creating driver: ${driverId}`);
        await driverService.createDriver({
          name: `Driver ${driverId.slice(0, 8)}`,
          profileImage: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=D',
          rating: 4.5,
          languages: ['EN'],
          verificationStatus: 'verified',
          tripsCompleted: 1000,
          isAvailable: true
        });
      }
      
      console.log('✅ Driver check and creation completed!');
    } catch (error) {
      console.error('❌ Error checking/creating drivers:', error);
      throw error;
    }
  },

  /**
   * Debug driver data in database
   */
  async debugDriverData(): Promise<void> {
    try {
      console.log('🔍 Debugging driver data...');
      await driverService.debugDriverData();
      console.log('✅ Driver data debug completed!');
    } catch (error) {
      console.error('❌ Error debugging driver data:', error);
      throw error;
    }
  }
};

// Export for easy access in console
if (typeof window !== 'undefined') {
  (window as any).createTestData = createTestData;
}
