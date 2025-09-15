// utils/testRecentLocations.ts
import recentLocationsService from '../services/recentLocationsService';

export const testRecentLocations = async (userId: string) => {
  try {
    console.log('🧪 Testing Recent Locations Service...');
    
    // Test getting recent pickup locations
    console.log('📍 Testing recent pickup locations...');
    const recentPickups = await recentLocationsService.getRecentPickupLocations(userId, 3);
    console.log(`Found ${recentPickups.length} recent pickup locations:`, recentPickups);
    
    // Test getting recent destination locations
    console.log('🎯 Testing recent destination locations...');
    const recentDestinations = await recentLocationsService.getRecentDestinationLocations(userId, 3);
    console.log(`Found ${recentDestinations.length} recent destination locations:`, recentDestinations);
    
    // Test getting all recent locations
    console.log('📍🎯 Testing all recent locations...');
    const allRecent = await recentLocationsService.getAllRecentLocations(userId, 6);
    console.log(`Found ${allRecent.length} total recent locations:`, allRecent);
    
    console.log('✅ Recent Locations Service test completed!');
    return {
      recentPickups,
      recentDestinations,
      allRecent
    };
  } catch (error) {
    console.error('❌ Error testing recent locations service:', error);
    throw error;
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testRecentLocations = testRecentLocations;
}
