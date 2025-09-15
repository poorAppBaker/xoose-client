// services/recentLocationsService.ts
import firestore from '@react-native-firebase/firestore';

export interface RecentLocation {
  id: string;
  title: string;
  subtitle: string;
  coordinate: [number, number];
  address?: string;
  updatedAt: string;
}

class RecentLocationsService {
  private bookingsCollection = firestore().collection('bookings');

  /**
   * Get recent pickup locations for a passenger
   */
  async getRecentPickupLocations(passengerId: string, limit: number = 3): Promise<RecentLocation[]> {
    try {
      console.log(`Fetching recent pickup locations for passenger: ${passengerId}`);
      
      // Get all bookings for the passenger, then sort in memory to avoid index requirement
      const snapshot = await this.bookingsCollection
        .where('passenger.id', '==', passengerId)
        .get();

      const recentLocations: RecentLocation[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pickup) {
          recentLocations.push({
            id: doc.id,
            title: data.pickup.title || 'Unknown Location',
            subtitle: data.pickup.subtitle || data.pickup.address || 'Unknown Address',
            coordinate: data.pickup.coordinate,
            address: data.pickup.address,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
          });
        }
      });

      // Sort by updatedAt in memory and limit results
      const sortedLocations = recentLocations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);

      console.log(`Found ${sortedLocations.length} recent pickup locations`);
      return sortedLocations;
    } catch (error) {
      console.error('Error fetching recent pickup locations:', error);
      return [];
    }
  }

  /**
   * Get recent destination locations for a passenger
   */
  async getRecentDestinationLocations(passengerId: string, limit: number = 3): Promise<RecentLocation[]> {
    try {
      console.log(`Fetching recent destination locations for passenger: ${passengerId}`);
      
      // Get all bookings for the passenger, then sort in memory to avoid index requirement
      const snapshot = await this.bookingsCollection
        .where('passenger.id', '==', passengerId)
        .get();

      const recentLocations: RecentLocation[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.destination) {
          recentLocations.push({
            id: doc.id,
            title: data.destination.title || 'Unknown Location',
            subtitle: data.destination.subtitle || data.destination.address || 'Unknown Address',
            coordinate: data.destination.coordinate,
            address: data.destination.address,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
          });
        }
      });

      // Sort by updatedAt in memory and limit results
      const sortedLocations = recentLocations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);

      console.log(`Found ${sortedLocations.length} recent destination locations`);
      return sortedLocations;
    } catch (error) {
      console.error('Error fetching recent destination locations:', error);
      return [];
    }
  }

  /**
   * Get all recent locations (both pickup and destination) for a passenger
   */
  async getAllRecentLocations(passengerId: string, limit: number = 6): Promise<RecentLocation[]> {
    try {
      console.log(`Fetching all recent locations for passenger: ${passengerId}`);
      
      // Get all bookings for the passenger, then sort in memory to avoid index requirement
      const snapshot = await this.bookingsCollection
        .where('passenger.id', '==', passengerId)
        .get();

      const recentLocations: RecentLocation[] = [];
      const seenLocations = new Set<string>();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Add pickup location
        if (data.pickup && !seenLocations.has(data.pickup.title + data.pickup.subtitle)) {
          recentLocations.push({
            id: `${doc.id}_pickup`,
            title: data.pickup.title || 'Unknown Location',
            subtitle: data.pickup.subtitle || data.pickup.address || 'Unknown Address',
            coordinate: data.pickup.coordinate,
            address: data.pickup.address,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
          });
          seenLocations.add(data.pickup.title + data.pickup.subtitle);
        }
        
        // Add destination location
        if (data.destination && !seenLocations.has(data.destination.title + data.destination.subtitle)) {
          recentLocations.push({
            id: `${doc.id}_destination`,
            title: data.destination.title || 'Unknown Location',
            subtitle: data.destination.subtitle || data.destination.address || 'Unknown Address',
            coordinate: data.destination.coordinate,
            address: data.destination.address,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
          });
          seenLocations.add(data.destination.title + data.destination.subtitle);
        }
      });

      // Sort by updatedAt and limit results
      const sortedLocations = recentLocations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);

      console.log(`Found ${sortedLocations.length} unique recent locations`);
      return sortedLocations;
    } catch (error) {
      console.error('Error fetching all recent locations:', error);
      return [];
    }
  }
}

export default new RecentLocationsService();
