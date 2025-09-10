// config/stripe.ts
export const STRIPE_CONFIG = {
  // Test keys - replace with your actual keys
  publishableKey: 'pk_test_51S2gS3K7aLlRl0dRBvsc29pNkgJsvpbKdEsaR1cAlrkNk4adINorztESDZIG8o8eGb3RMm3l9lTqSTXzFexRpUDo00EUfSkKQo',
  // Live keys (uncomment when ready for production)
  // publishableKey: 'pk_live_your_live_publishable_key_here',
  
  // For Apple Pay (iOS)
  merchantId: 'merchant.com.xoose.client',
  
  // URL scheme for deep linking
  urlScheme: 'xoose-client',
};
