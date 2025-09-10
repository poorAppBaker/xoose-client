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
      
      await firestore().collection('invoiceDetails').doc(docId).update(updatesToSave);
      
      console.log('Invoice details updated:', updatesToSave);
      return updatesToSave;
    } catch (error) {
      console.error('Error updating invoice details:', error);
      throw error;
    }
  }
}

export default new PaymentService();
