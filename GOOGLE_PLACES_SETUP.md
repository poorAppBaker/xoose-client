# Google Places API Configuration
# 
# To use Google Places API, you need to:
# 1. Go to Google Cloud Console (https://console.cloud.google.com/)
# 2. Create a new project or select an existing one
# 3. Enable the following APIs:
#    - Places API
#    - Places API (New)
#    - Geocoding API
# 4. Create credentials (API Key)
# 5. Restrict the API key to only the APIs you need
# 6. Add your API key to your environment variables

# Add this to your .env file or app.config.js:
# EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Example usage in app.config.js:
# export default {
#   expo: {
#     name: "your-app-name",
#     extra: {
#       googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
#     },
#   },
# };

# For testing purposes, you can temporarily use a placeholder key
# but make sure to replace it with your actual API key before production
