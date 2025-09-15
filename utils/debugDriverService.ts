// utils/debugDriverService.ts
import { driverService } from '../services/driverService';

/**
 * Debug utility to test driver service coordinate matching
 */
export const debugDriverService = {
  /**
   * Test coordinate matching with sample US cities
   */
  async testUSCityMatching() {
    console.log('=== Testing US City Coordinate Matching ===');
    
    // Sample US city coordinates (longitude, latitude)
    const testCities = {
      'New York': [-74.006, 40.7128],
      'Los Angeles': [-118.2437, 34.0522],
      'Chicago': [-87.6298, 41.8781],
      'Houston': [-95.3698, 29.7604],
      'Phoenix': [-112.0740, 33.4484],
      'Philadelphia': [-75.1652, 39.9526],
      'San Antonio': [-98.4936, 29.4241],
      'San Diego': [-117.1611, 32.7157],
      'Dallas': [-96.7970, 32.7767],
      'San Jose': [-121.8863, 37.3382]
    };

    for (const [cityName, coordinates] of Object.entries(testCities)) {
      console.log(`\n--- Testing ${cityName} (${coordinates[1]}, ${coordinates[0]}) ---`);
      
      try {
        const options = await driverService.getAvailableDrivers(
          coordinates as [number, number],
          coordinates as [number, number] // Using same coordinates for pickup and destination
        );
        
        console.log(`Found ${options.length} driver options for ${cityName}`);
        
        if (options.length > 0) {
          console.log('Sample option:', {
            driver: options[0].driver.name,
            vehicle: options[0].fare.vehicle.model,
            price: options[0].fare.finalPrice
          });
        }
      } catch (error) {
        console.error(`Error testing ${cityName}:`, error);
      }
    }
  },

  /**
   * Test with specific coordinates
   */
  async testSpecificCoordinates(pickup: [number, number], destination: [number, number]) {
    console.log('=== Testing Specific Coordinates ===');
    console.log('Pickup:', pickup);
    console.log('Destination:', destination);
    
    try {
      const options = await driverService.getAvailableDrivers(pickup, destination);
      console.log(`Found ${options.length} driver options`);
      
      options.forEach((option, index) => {
        console.log(`Option ${index + 1}:`, {
          driver: option.driver.name,
          vehicle: option.fare.vehicle.model,
          price: option.fare.finalPrice,
          pickupArea: option.fare.pickupAreaCoordinates,
          destinationArea: option.fare.destinationAreaCoordinates
        });
      });
      
      return options;
    } catch (error) {
      console.error('Error testing coordinates:', error);
      return [];
    }
  },

  /**
   * Create test US-wide fare data
   */
  async createTestUSWideFare() {
    console.log('=== Creating Test US-Wide Fare ===');
    
    try {
      // First create a test driver
      const driverId = await driverService.createDriver({
        name: 'Test Driver',
        profileImage: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=T',
        rating: 4.5,
        languages: ['EN'],
        verificationStatus: 'verified',
        tripsCompleted: 1000,
        isAvailable: true
      });
      
      console.log('Created test driver:', driverId);
      
      // Create US-wide fare
      const fareId = await driverService.createUSWideFare(driverId, 'test-vehicle-1');
      console.log('Created US-wide fare:', fareId);
      
      return { driverId, fareId };
    } catch (error) {
      console.error('Error creating test fare:', error);
      throw error;
    }
  }
};

// Export for easy access in console
if (typeof window !== 'undefined') {
  (window as any).debugDriverService = debugDriverService;
}
