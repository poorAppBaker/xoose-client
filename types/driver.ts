// types/driver.ts
export interface Driver {
  id: string;
  name: string;
  profileImage?: string;
  rating: number;
  languages: string[];
  verificationStatus: 'verified' | 'pending' | 'unverified';
  tripsCompleted: number;
  isAvailable: boolean;
  currentLocation?: {
    coordinate: [number, number];
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Fare {
  id: string;
  driverId: string;
  vehicleId: string;
  vehicle: {
    id: string;
    model: string;
    brand: string;
    image?: string;
    capacity: number;
    fuelType: string;
    rating: number;
  };
  pickupAreaCoordinates: {
    center: [number, number];
    radius: number; // in meters
    bounds?: {
      northeast: [number, number];
      southwest: [number, number];
    };
  };
  destinationAreaCoordinates: {
    center: [number, number];
    radius: number; // in meters
    bounds?: {
      northeast: [number, number];
      southwest: [number, number];
    };
  };
  basePrice: number;
  estimatedTime: number; // in minutes
  discount?: {
    percentage: number;
    code?: string;
  };
  finalPrice: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DriverOption {
  driver: Driver;
  fare: Fare;
  estimatedArrival: number; // in minutes
}

export interface DriverSelectionFilters {
  passengerCount?: number;
  language?: string;
  gender?: 'male' | 'female' | 'any';
  verifiedOnly?: boolean;
  maxWaitTime?: number; // in minutes
}

export interface DriverSelectionSort {
  field: 'price' | 'rating' | 'arrivalTime';
  order: 'asc' | 'desc';
}
