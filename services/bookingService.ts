// services/bookingService.ts
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

export interface BookingData {
  // Location data
  destination: {
    coordinate: [number, number];
    title: string;
    subtitle: string;
    address?: string;
  };
  pickup: {
    coordinate: [number, number];
    title: string;
    subtitle: string;
    address?: string;
  };
  currentLocation: {
    coordinate: [number, number];
    address?: string;
  };
  
  // Passenger data
  passenger: {
    id: string;
    name: string;
    phone?: string;
  };
  
  // Payment data
  payment: {
    methodId: string;
    type: string;
    last4: string;
    brand: string;
  };
  
  // Trip data
  tripTaker: {
    type: 'myself' | 'someone';
    name?: string;
    phone?: string;
  };
  
  // Additional data
  coupon?: {
    code: string;
    discount: number;
  };
  
  // Driver data
  driver?: {
    id: string;
    name: string;
    phone?: string;
    rating?: number;
    vehicle?: {
      model: string;
      plate: string;
      color: string;
    };
  };
  
  // Driver acceptance
  isAccepted?: boolean;
  acceptedAt?: Date;
  isDeclined?: boolean;
  
  // Booking metadata
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  
  // Optional waypoints
  waypoints?: Array<{
    coordinate: [number, number];
    title: string;
    subtitle: string;
  }>;
}

export interface CreateBookingParams {
  destination: BookingData['destination'];
  pickup: BookingData['pickup'];
  currentLocation: BookingData['currentLocation'];
  passenger: BookingData['passenger'];
  payment: BookingData['payment'];
  tripTaker: BookingData['tripTaker'];
  coupon?: BookingData['coupon'];
  waypoints?: BookingData['waypoints'];
}

class BookingService {
  private collection = firestore().collection('bookings');

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingParams): Promise<string> {
    try {
      const now = new Date();
      
      // Clean the data to remove undefined values
      const cleanData = this.cleanBookingData(data);
      
      const bookingData: BookingData = {
        ...cleanData,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(bookingData);
      console.log('Booking created with ID:', docRef.id);
      console.log('Booking data saved:', JSON.stringify(bookingData, null, 2));
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
      throw error;
    }
  }

  /**
   * Clean booking data by removing undefined values
   */
  private cleanBookingData(data: CreateBookingParams): CreateBookingParams {
    const cleanData: any = {};
    
    // Clean destination
    if (data.destination) {
      cleanData.destination = {
        coordinate: data.destination.coordinate,
        title: data.destination.title || 'Unknown Destination',
        subtitle: data.destination.subtitle || '',
        address: data.destination.address || data.destination.subtitle || '',
      };
    }
    
    // Clean pickup
    if (data.pickup) {
      cleanData.pickup = {
        coordinate: data.pickup.coordinate,
        title: data.pickup.title || 'Unknown Pickup',
        subtitle: data.pickup.subtitle || '',
        address: data.pickup.address || data.pickup.subtitle || '',
      };
    }
    
    // Clean current location
    if (data.currentLocation) {
      cleanData.currentLocation = {
        coordinate: data.currentLocation.coordinate,
        address: data.currentLocation.address || '',
      };
    }
    
    // Clean passenger
    if (data.passenger) {
      cleanData.passenger = {
        id: data.passenger.id || 'unknown',
        name: data.passenger.name || 'Unknown Passenger',
        phone: data.passenger.phone || '',
      };
    }
    
    // Clean payment
    if (data.payment) {
      cleanData.payment = {
        methodId: data.payment.methodId || 'unknown',
        type: data.payment.type || 'Unknown',
        last4: data.payment.last4 || '0000',
        brand: data.payment.brand || 'Unknown',
      };
    }
    
    // Clean trip taker
    if (data.tripTaker) {
      cleanData.tripTaker = {
        type: data.tripTaker.type || 'myself',
        name: data.tripTaker.name || '',
        phone: data.tripTaker.phone || '',
      };
    }
    
    // Clean coupon (only if it exists)
    if (data.coupon) {
      cleanData.coupon = {
        code: data.coupon.code || '',
        discount: data.coupon.discount || 0,
      };
    }
    
    // Clean waypoints (only if they exist)
    if (data.waypoints && data.waypoints.length > 0) {
      cleanData.waypoints = data.waypoints.map(waypoint => ({
        coordinate: waypoint.coordinate,
        title: waypoint.title || 'Waypoint',
        subtitle: waypoint.subtitle || '',
      }));
    }
    
    
    return cleanData;
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string): Promise<BookingData | null> {
    try {
      const doc = await this.collection.doc(bookingId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data() as any;
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific passenger
   */
  async getBookingsByPassenger(passengerId: string): Promise<BookingData[]> {
    try {
      const snapshot = await this.collection
        .where('passenger.id', '==', passengerId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => {
        const data = doc.data() as any;
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        };
      });
    } catch (error) {
      console.error('Error getting bookings by passenger:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: BookingData['status']): Promise<void> {
    try {
      await this.collection.doc(bookingId).update({
        status,
        updatedAt: new Date(),
      });
      console.log('Booking status updated to:', status);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Update driver acceptance
   */
  async updateDriverAcceptance(bookingId: string, isAccepted: boolean, driver?: BookingData['driver']): Promise<void> {
    try {
      const updateData: any = {
        isAccepted,
        isDeclined: false, // Always set isDeclined to false when updating acceptance
        updatedAt: new Date(),
      };
      
      // Always save driver data if provided, regardless of acceptance status
      if (driver) {
        updateData.driver = driver;
      }
      
      // Only set acceptedAt when driver actually accepts
      if (isAccepted) {
        updateData.acceptedAt = new Date();
      }
      
      await this.collection.doc(bookingId).update(updateData);
      console.log('Driver acceptance updated:', isAccepted);
      console.log('Driver data saved:', driver);
      console.log('isDeclined set to false');
    } catch (error) {
      console.error('Error updating driver acceptance:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await this.updateBookingStatus(bookingId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(passengerId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const snapshot = await this.collection
        .where('passenger.id', '==', passengerId)
        .get();

      const stats = {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      snapshot.docs.forEach((doc: any) => {
        const data = doc.data() as any;
        stats.total++;
        const status = data.status as keyof typeof stats;
        if (status in stats) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for a specific booking
   */
  subscribeToBooking(bookingId: string, callback: (booking: BookingData | null) => void): () => void {
    console.log('🔍 Setting up Firebase listener for booking:', bookingId);
    
    return this.collection.doc(bookingId).onSnapshot(
      (doc: any) => {
        console.log('🔥 Firebase snapshot received for booking:', bookingId);
        console.log('🔥 Document exists:', doc.exists);
        
        if (doc.exists) {
          const data = doc.data() as any;
          console.log('🔥 Raw Firebase data:', data);
          console.log('🔥 isAccepted value:', data.isAccepted);
          
          const processedBooking = {
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          };
          
          console.log('🔥 Processed booking data:', processedBooking);
          callback(processedBooking);
        } else {
          console.log('❌ Document does not exist');
          callback(null);
        }
      },
      (error: any) => {
        console.error('❌ Error listening to booking updates:', error);
        callback(null);
      }
    );
  }

  /**
   * Listen to real-time updates for passenger bookings
   */
  subscribeToPassengerBookings(passengerId: string, callback: (bookings: BookingData[]) => void): () => void {
    return this.collection
      .where('passenger.id', '==', passengerId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot: any) => {
          const bookings = snapshot.docs.map((doc: any) => {
            const data = doc.data() as any;
            return {
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            };
          });
          callback(bookings);
        },
        (error: any) => {
          console.error('Error listening to passenger bookings:', error);
          callback([]);
        }
      );
  }
}

export default new BookingService();
