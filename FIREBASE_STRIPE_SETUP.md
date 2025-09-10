# Firebase + Stripe Integration Setup Guide

Based on the iBorrow project implementation, here's how to set up Firebase + Stripe integration for your Xoose project.

## 🔧 **Setup Steps:**

### **1. Install Dependencies**

```bash
# Install Stripe React Native SDK
npm install @stripe/stripe-react-native

# Install Firebase Functions dependencies
cd firebase-functions/functions
npm install
```

### **2. Configure Stripe Keys**

Update `config/stripe.ts` with your actual Stripe keys:

```typescript
export const STRIPE_CONFIG = {
  // Replace with your actual publishable key
  publishableKey: 'pk_test_your_actual_publishable_key_here',
  merchantId: 'merchant.com.xoose.client',
  urlScheme: 'xoose-client',
};
```

### **3. Set Up Firebase Functions**

```bash
# Navigate to functions directory
cd firebase-functions/functions

# Set Stripe secret key as environment variable
firebase functions:config:set stripe.secret_key="sk_test_your_stripe_secret_key_here"

# Deploy functions
firebase deploy --only functions
```

### **4. Update User Data Model**

Add `stripeCustomerId` to your user data model in `types/auth.ts`:

```typescript
export interface UserData {
  // ... existing fields
  stripeCustomerId?: string;
}
```

### **5. Test the Integration**

1. **Add Payment Method**: Go to Profile & Payment → Payment Method → Add Payment Method
2. **Test Card**: Use `4242 4242 4242 4242` (any future expiry, any CVV)
3. **Verify**: Check that payment method appears in the list

## 🏗️ **Architecture Overview:**

### **Firebase Functions Created:**
- `createStripeCustomer` - Creates Stripe customers
- `attachPaymentMethodToCustomer` - Attaches payment methods
- `getPaymentListByCustomer` - Gets customer payment methods
- `createPaymentIntent` - Creates payment intents
- `getTransactionHistory` - Gets transaction history

### **Client-Side Flow:**
1. **User adds card** → `PaymentMethodModal` opens
2. **Stripe SDK** → Tokenizes card securely
3. **Firebase Function** → Creates/gets Stripe customer
4. **Firebase Function** → Attaches payment method
5. **Firestore** → Saves payment method metadata
6. **UI Updates** → Shows saved payment methods

## 🔒 **Security Features:**

✅ **Authentication Required** - All functions verify Firebase Auth
✅ **Secure Tokenization** - Stripe handles card data securely
✅ **No Raw Card Data** - Only Stripe IDs stored in Firebase
✅ **User Verification** - Functions check authenticated user
✅ **Metadata Tracking** - Stripe customers linked to Firebase UIDs

## 📱 **Components Created:**

- `PaymentMethodModal` - Add payment methods with Stripe CardField
- `PaymentSection` - Display payment methods and invoice details
- `stripeService` - Firebase Functions integration
- `paymentService` - Firestore CRUD operations

## 🧪 **Test Cards:**

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

Use any future expiry date (e.g., 12/25) and any 3-digit CVV.

## 🚀 **Deployment:**

```bash
# Deploy Firebase Functions
firebase deploy --only functions

# Check function logs
firebase functions:log

# Test locally
firebase emulators:start --only functions
```

## 📊 **Monitoring:**

- **Firebase Console** → Functions → View logs
- **Stripe Dashboard** → Customers → View customers
- **Firestore** → paymentMethods collection → View saved methods

This implementation follows the same pattern as the iBorrow project but is adapted for your Xoose app structure! 🎉
