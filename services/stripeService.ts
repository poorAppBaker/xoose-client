// services/stripeService.ts
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import Constants from 'expo-constants';

class StripeService {
  private functions = getFunctions();
  private isMockMode = false; // Set to false to use real Stripe API
  private stripeSecretKey: string | undefined;

  constructor() {
    // Try multiple ways to get the environment variable
    this.stripeSecretKey = this.getStripeSecretKey();
  }

  private getStripeSecretKey(): string | undefined {
    // Try different ways to get the environment variable
    const key = 
      Constants.expoConfig?.extra?.STRIPE_SECRET_KEY ||
      process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY;
    
    console.log('Environment variable lookup:', {
      'Constants.expoConfig?.extra?.STRIPE_SECRET_KEY': Constants.expoConfig?.extra?.STRIPE_SECRET_KEY,
      'process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY': process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY,
      'process.env.STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
      'Final key': key ? 'Found' : 'Not found'
    });
    
    // If no key is found, throw an error with helpful message
    if (!key) {
      throw new Error(`
        Stripe secret key not found! 
        
        Please ensure:
        1. You have a .env file in your project root
        2. The .env file contains: EXPO_PUBLIC_STRIPE_SECRET_KEY=your_stripe_secret_key
        3. You have restarted your development server after creating the .env file
        
        Current environment check:
        - Constants.expoConfig?.extra?.STRIPE_SECRET_KEY: ${Constants.expoConfig?.extra?.STRIPE_SECRET_KEY ? 'Found' : 'Not found'}
        - process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY: ${process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY ? 'Found' : 'Not found'}
        - process.env.STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'Found' : 'Not found'}
      `);
    }
    
    return key;
  }

  // Create a Stripe customer using direct API call
  async createCustomer(email: string, name: string) {
    console.log('=== STRIPE DEBUG INFO ===');
    console.log('Stripe Secret Key:', this.stripeSecretKey ? 'Found' : 'Not found');
    console.log('Full Constants.expoConfig:', Constants.expoConfig);
    console.log('Full Constants.expoConfig.extra:', Constants.expoConfig?.extra);
    console.log('STRIPE_SECRET_KEY from extra:', Constants.expoConfig?.extra?.STRIPE_SECRET_KEY);
    console.log('process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY:', process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY);
    console.log('process.env.STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
    console.log('========================');
    
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Creating Stripe customer for', email);
      return { customerId: `cus_mock_${Date.now()}` };
    }

    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key not found. Please check your environment configuration.');
    }

    try {
      console.log('Creating real Stripe customer for', email);
      
      // Direct Stripe API call
      const response = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          name: name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Stripe API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const customer = await response.json();
      console.log('Stripe customer created:', customer.id);
      console.log('Full customer response:', customer);
      return { customerId: customer.id };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    console.log('attachPaymentMethod called with:', { paymentMethodId, customerId, isMockMode: this.isMockMode });
    
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Attaching payment method', paymentMethodId, 'to customer', customerId);
      return { success: true };
    }

    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key not found. Please check your environment configuration.');
    }

    try {
      console.log('Attaching payment method to Stripe customer');
      console.log('Payment Method ID:', paymentMethodId);
      console.log('Customer ID:', customerId);
      
      if (!customerId) {
        throw new Error('Customer ID is required but was undefined');
      }
      
      // Use the correct Stripe API endpoint format
      const response = await fetch(`https://api.stripe.com/v1/payment_methods/${paymentMethodId}/attach`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          customer: customerId,
        }).toString(),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error response:', errorData);
        throw new Error(`Stripe API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const paymentMethod = await response.json();
      console.log('Payment method attached to customer:', paymentMethod.id);
      return { success: true };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  // Get payment methods for a customer
  async getPaymentMethods(customerId: string) {
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Getting payment methods for customer', customerId);
      return { paymentMethods: [] };
    }

    try {
      const getPaymentMethods = httpsCallable(this.functions, 'getPaymentListByCustomer');
      const result = await getPaymentMethods({ customerId });
      return result.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Create payment intent
  async createPaymentIntent(amount: number, customerId: string) {
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Creating payment intent for amount', amount, 'customer', customerId);
      return { clientSecret: `pi_mock_${Date.now()}` };
    }

    try {
      const createPaymentIntent = httpsCallable(this.functions, 'createPaymentIntent');
      const result = await createPaymentIntent({ amount, customerId });
      return result.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(customerId: string, limit: number = 10) {
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Getting transaction history for customer', customerId);
      return { charges: [] };
    }

    try {
      const getTransactionHistory = httpsCallable(this.functions, 'getTransactionHistory');
      const result = await getTransactionHistory({ customerId, limit });
      return result.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  // Verify customer exists in Stripe
  async verifyCustomerExists(customerId: string) {
    if (this.isMockMode) {
      // Mock response for testing
      console.log('Mock: Verifying customer exists', customerId);
      return { exists: true };
    }

    if (!this.stripeSecretKey) {
      throw new Error('Stripe secret key not found. Please check your environment configuration.');
    }

    try {
      console.log('Verifying customer exists in Stripe:', customerId);
      
      const response = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.stripeSecretKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Customer not found');
        }
        const errorData = await response.json();
        throw new Error(`Stripe API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const customer = await response.json();
      console.log('Customer verified:', customer.id);
      return { exists: true, customer };
    } catch (error) {
      console.error('Error verifying customer:', error);
      throw error;
    }
  }
}

export default new StripeService();
