import firestore from '@react-native-firebase/firestore';

export interface ReviewData {
  id?: string;
  driverId: string;
  clientId: string;
  bookingId: string | null;
  tip: number | null;
  driverRating: number;
  carRating: number;
  portuguese: {
    enabled: boolean;
    rating: number;
  };
  english: {
    enabled: boolean;
    rating: number;
  };
  comment: string;
  isTrustedDriver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ReviewService {
  private collection = firestore().collection('reviews');

  async createReview(reviewData: Omit<ReviewData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const review: Omit<ReviewData, 'id'> = {
        ...reviewData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(review);
      console.log('Review created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getReviewsByDriver(driverId: string): Promise<ReviewData[]> {
    try {
      const snapshot = await this.collection
        .where('driverId', '==', driverId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ReviewData[];
    } catch (error) {
      console.error('Error fetching reviews by driver:', error);
      throw error;
    }
  }

  async getReviewsByClient(clientId: string): Promise<ReviewData[]> {
    try {
      const snapshot = await this.collection
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ReviewData[];
    } catch (error) {
      console.error('Error fetching reviews by client:', error);
      throw error;
    }
  }

  async getReviewById(reviewId: string): Promise<ReviewData | null> {
    try {
      const doc = await this.collection.doc(reviewId).get();
      if (doc.exists()) {
        return {
          id: doc.id,
          ...doc.data(),
        } as ReviewData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      throw error;
    }
  }

  async updateReview(reviewId: string, updateData: Partial<ReviewData>): Promise<void> {
    try {
      await this.collection.doc(reviewId).update({
        ...updateData,
        updatedAt: new Date(),
      });
      console.log('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      await this.collection.doc(reviewId).delete();
      console.log('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
}

export default new ReviewService();
