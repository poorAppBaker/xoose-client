export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
  vicinity?: string;
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  price_level?: number;
  vicinity?: string;
  international_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    // You'll need to get a Google Places API key from Google Cloud Console
    // For now, using a placeholder - replace with your actual API key
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDrPx_7MEjuEs3xXR5QBnRpR3ORnIwG3GM';
  }

  /**
   * Search for places using Google Places API Text Search
   */
  async searchPlaces(query: string, location?: { lat: number; lng: number }, radius?: number): Promise<GooglePlaceResult[]> {
    try {
      console.log('🔍 Google Places search for:', query);

      // Build the URL for Places API Text Search
      const params = new URLSearchParams({
        query: query,
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,geometry,types,rating,price_level,vicinity',
        language: 'en', // Set language to English
      });

      // Don't restrict by location/radius for broader search results
      // if (location) {
      //   params.append('location', `${location.lat},${location.lng}`);
      // }
      // if (radius) {
      //   params.append('radius', radius.toString());
      // }

      const url = `${this.baseUrl}/place/textsearch/json?${params.toString()}`;
      console.log('🌐 Making request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Google Places API Response:', data);
      console.log('📊 Number of results received:', data.results?.length || 0);

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (data.results && Array.isArray(data.results)) {
        const processedResults = data.results.map((place: any, index: number) => {
          console.log(`📍 Result ${index + 1}:`, {
            name: place.name,
            address: place.formatted_address,
            types: place.types,
            rating: place.rating
          });
          
          return {
            place_id: place.place_id || '',
            name: place.name || 'Unknown Place',
            formatted_address: place.formatted_address || 'Unknown Address',
            geometry: {
              location: {
                lat: place.geometry?.location?.lat || 0,
                lng: place.geometry?.location?.lng || 0,
              },
            },
            types: place.types || [],
            rating: place.rating,
            price_level: place.price_level,
            vicinity: place.vicinity,
          };
        });

        console.log('✅ Processed results count:', processedResults.length);
        
        // If we have very few results, try autocomplete as a fallback
        if (processedResults.length < 3) {
          console.log('🔄 Few results from text search, trying autocomplete...');
          try {
            const autocompleteResults = await this.autocompletePlaces(query);
            console.log('📡 Autocomplete fallback results:', autocompleteResults.length);
            
            // Merge results, avoiding duplicates
            const combinedResults = [...processedResults];
            autocompleteResults.forEach(autocompleteResult => {
              if (!combinedResults.some(result => result.place_id === autocompleteResult.place_id)) {
                combinedResults.push(autocompleteResult);
              }
            });
            
            console.log('🔄 Combined results count:', combinedResults.length);
            return combinedResults.slice(0, 10); // Limit to 10 results
          } catch (autocompleteError) {
            console.error('❌ Autocomplete fallback failed:', autocompleteError);
          }
        }
        
        return processedResults.slice(0, 10); // Limit to 10 results
      }

      console.log('⚠️ No results found in API response');
      return [];
    } catch (error) {
      console.error('❌ Google Places API error:', error);
      throw error;
    }
  }

  /**
   * Search for places using Google Places API Autocomplete
   */
  async autocompletePlaces(input: string, location?: { lat: number; lng: number }, radius?: number): Promise<GooglePlaceResult[]> {
    try {
      console.log('🔍 Google Places autocomplete for:', input);

      // Build the URL for Places API Autocomplete
      const params = new URLSearchParams({
        input: input,
        key: this.apiKey,
        types: 'establishment',
      });

      if (location) {
        params.append('location', `${location.lat},${location.lng}`);
      }
      if (radius) {
        params.append('radius', radius.toString());
      }

      const url = `${this.baseUrl}/place/autocomplete/json?${params.toString()}`;
      console.log('🌐 Making autocomplete request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Google Places Autocomplete Response:', data);

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (data.predictions && Array.isArray(data.predictions)) {
        // Get place details for each prediction
        const placeDetailsPromises = data.predictions.slice(0, 10).map(async (prediction: any) => {
          try {
            const detailsResponse = await this.getPlaceDetails(prediction.place_id);
            
            if (detailsResponse) {
              return {
                place_id: detailsResponse.place_id,
                name: detailsResponse.name || prediction.structured_formatting?.main_text || 'Unknown Place',
                formatted_address: detailsResponse.formatted_address || prediction.description || 'Unknown Address',
                geometry: detailsResponse.geometry,
                types: detailsResponse.types,
                rating: detailsResponse.rating,
                price_level: detailsResponse.price_level,
                vicinity: detailsResponse.vicinity,
              };
            }
          } catch (error) {
            console.error('❌ Error getting place details:', error);
          }
          return null;
        });

        const results = await Promise.all(placeDetailsPromises);
        return results.filter(result => result !== null) as GooglePlaceResult[];
      }

      return [];
    } catch (error) {
      console.error('❌ Google Places Autocomplete API error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      console.log('📍 Getting place details for:', placeId);

      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,geometry,types,rating,price_level,vicinity,international_phone_number,website,opening_hours',
      });

      const url = `${this.baseUrl}/place/details/json?${params.toString()}`;
      console.log('🌐 Making place details request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Google Places Details Response:', data);

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (data.result) {
        const place = data.result;
        return {
          place_id: place.place_id || '',
          name: place.name || 'Unknown Place',
          formatted_address: place.formatted_address || 'Unknown Address',
          geometry: {
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0,
            },
          },
          types: place.types || [],
          rating: place.rating,
          price_level: place.price_level,
          vicinity: place.vicinity,
          international_phone_number: place.international_phone_number,
          website: place.website,
          opening_hours: place.opening_hours,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting place details:', error);
      throw error;
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    radius: number = 5000,
    type?: string
  ): Promise<GooglePlaceResult[]> {
    try {
      console.log('🔍 Google Places nearby search:', { location, radius, type });

      const params = new URLSearchParams({
        location: `${location.lat},${location.lng}`,
        radius: radius.toString(),
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,geometry,types,rating,price_level,vicinity',
      });

      if (type) {
        params.append('type', type);
      }

      const url = `${this.baseUrl}/place/nearbysearch/json?${params.toString()}`;
      console.log('🌐 Making nearby search request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Google Places Nearby Response:', data);

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      if (data.results && Array.isArray(data.results)) {
        return data.results.map((place: any) => ({
          place_id: place.place_id || '',
          name: place.name || 'Unknown Place',
          formatted_address: place.formatted_address || 'Unknown Address',
          geometry: {
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0,
            },
          },
          types: place.types || [],
          rating: place.rating,
          price_level: place.price_level,
          vicinity: place.vicinity,
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Google Places Nearby API error:', error);
      throw error;
    }
  }
}

export default new GooglePlacesService();
