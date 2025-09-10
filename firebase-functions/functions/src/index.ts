// firebase-functions/functions/src/index.ts
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

// Initialize Firebase Admin
initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

// Create a Stripe customer
exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { email, name } = data;
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        firebaseUID: context.auth.uid,
      },
    });

    // Save customer ID to user document
    await getFirestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({
        stripeCustomerId: customer.id,
        updatedAt: new Date().toISOString(),
      });

    return { customerId: customer.id };
  } catch (error) {
    logger.error('Error creating Stripe customer:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create customer');
  }
});

// Attach payment method to customer
exports.attachPaymentMethodToCustomer = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentMethodId, customerId } = data;
    
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    logger.info('Payment method attached to customer');
    return { success: true };
  } catch (error) {
    logger.error('Error attaching payment method:', error);
    throw new functions.https.HttpsError('internal', 'Unable to attach payment method');
  }
});

// Get payment methods for a customer
exports.getPaymentListByCustomer = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { customerId } = data;
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return { paymentMethods: paymentMethods.data };
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    throw new functions.https.HttpsError('internal', 'Unable to get payment methods');
  }
});

// Create payment intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { amount, customerId } = data;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create payment intent');
  }
});

// Get transaction history
exports.getTransactionHistory = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { customerId, limit = 10 } = data;
    
    const charges = await stripe.charges.list({
      customer: customerId,
      limit,
    });

    return { charges: charges.data };
  } catch (error) {
    logger.error('Error getting transaction history:', error);
    throw new functions.https.HttpsError('internal', 'Unable to get transaction history');
  }
});
