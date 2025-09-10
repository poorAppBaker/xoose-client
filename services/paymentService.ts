// services/paymentService.ts
import firestore from '@react-native-firebase/firestore';

export interface InvoiceDetails {
  id?: string; // Document ID from Firestore
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  country: string;
  taxId?: string;
  email: string;
  confirmEmail: string;
  phone: string;
  tab: 'personal' | 'work' | 'other';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id?: string; // Document ID from Firestore
  stripePaymentMethodId: string; // Stripe payment method ID
  customerId: string; // Stripe customer ID
  cardholderName: string;
  cardBrand: string; // e.g., 'visa', 'mastercard'
  last4: string; // Last 4 digits
  expMonth: number;
  expYear: number;
  tab: 'personal' | 'work' | 'other';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

class PaymentService {
  private removeUndefined<T extends Record<string, any>>(obj: T): T {
    const cleaned: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const value = (obj as any)[key];
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned as T;
  }

  // Save invoice details for user
  async saveInvoiceDetails(userId: string, invoiceData: Omit<InvoiceDetails, 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const invoiceDataToSave = this.removeUndefined({
        ...invoiceData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Save to a separate collection
      await firestore().collection('invoices').add(invoiceDataToSave);
      
      console.log('Invoice details saved to collection:', invoiceDataToSave);
      return invoiceDataToSave;
    } catch (error) {
      console.error('Error saving invoice details:', error);
      throw error;
    }
  }

  // Get invoice details for user
  async getInvoiceDetails(userId: string, tab?: 'personal' | 'work' | 'other'): Promise<InvoiceDetails[]> {
    try {
      let query = firestore().collection('invoices').where('userId', '==', userId);
      
      if (tab) {
        query = query.where('tab', '==', tab);
      }
      
      const snapshot = await query.get();
      const invoiceDetails: InvoiceDetails[] = [];
      
      snapshot.forEach((doc) => {
        invoiceDetails.push({
          ...doc.data() as InvoiceDetails,
          id: doc.id,
        });
      });
      
      return invoiceDetails;
    } catch (error) {
      console.error('Error getting invoice details:', error);
      throw error;
    }
  }

  // Update invoice details for user
  async updateInvoiceDetails(docId: string, updates: Partial<InvoiceDetails>) {
    try {
      const updatesToSave = this.removeUndefined({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      await firestore().collection('invoices').doc(docId).update(updatesToSave);
      
      console.log('Invoice details updated:', updatesToSave);
      return updatesToSave;
    } catch (error) {
      console.error('Error updating invoice details:', error);
      throw error;
    }
  }

  // Save payment method for user
  async savePaymentMethod(userId: string, paymentMethodData: Omit<PaymentMethod, 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const paymentMethodToSave = this.removeUndefined({
        ...paymentMethodData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Save to payment methods collection
      await firestore().collection('paymentMethods').add(paymentMethodToSave);
      
      console.log('Payment method saved:', paymentMethodToSave);
      return paymentMethodToSave;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  }

  // Get payment methods for user
  async getPaymentMethods(userId: string, tab?: 'personal' | 'work' | 'other'): Promise<PaymentMethod[]> {
    try {
      let query = firestore().collection('paymentMethods').where('userId', '==', userId);
      
      if (tab) {
        query = query.where('tab', '==', tab);
      }
      
      const snapshot = await query.get();
      const paymentMethods: PaymentMethod[] = [];
      
      snapshot.forEach((doc) => {
        paymentMethods.push({
          ...doc.data() as PaymentMethod,
          id: doc.id,
        });
      });
      
      return paymentMethods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Update payment method for user
  async updatePaymentMethod(docId: string, updates: Partial<PaymentMethod>) {
    try {
      const updatesToSave = this.removeUndefined({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      await firestore().collection('paymentMethods').doc(docId).update(updatesToSave);
      
      console.log('Payment method updated:', updatesToSave);
      return updatesToSave;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Delete payment method
  async deletePaymentMethod(docId: string, userId: string) {
    try {
      // First, get the payment method to get the customerId
      const paymentMethodDoc = await firestore().collection('paymentMethods').doc(docId).get();
      const paymentMethodData = paymentMethodDoc.data() as PaymentMethod;
      
      if (!paymentMethodData) {
        throw new Error('Payment method not found');
      }

      // Delete the payment method
      await firestore().collection('paymentMethods').doc(docId).delete();
      console.log('Payment method deleted:', docId);

      // Check if user has any remaining payment methods
      const remainingMethods = await this.getPaymentMethods(userId);
      
      // If no payment methods remain, clear the stripeCustomerId from user document
      if (remainingMethods.length === 0) {
        await firestore().collection('users').doc(userId).update({
          stripeCustomerId: null,
          updatedAt: new Date().toISOString(),
        });
        console.log('User stripeCustomerId cleared - no payment methods remaining');
      } else {
        console.log('User still has payment methods, keeping stripeCustomerId');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Update user's Stripe customer ID
  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    try {
      await firestore().collection('users').doc(userId).update({
        stripeCustomerId,
        updatedAt: new Date().toISOString(),
      });
      console.log('User Stripe customer ID updated:', stripeCustomerId);
    } catch (error) {
      console.error('Error updating user Stripe customer ID:', error);
      throw error;
    }
  }
}

export default new PaymentService();
