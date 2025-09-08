// store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { UserData } from '../services/authService';

interface AuthState {
  user: UserData | null;
  firebaseUser: any | null; // Changed from User to any since we're using React Native Firebase
  isLoading: boolean;
  isInitialized: boolean;
  isFirstLaunch: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserData>) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<string>; // Returns verification ID
  verifyPhoneCode: (verificationId: string, code: string, userData?: Partial<UserData>) => Promise<void>;
  verifyPhoneCodeForLogin: (verificationId: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  checkFirstLaunch: () => Promise<boolean>;
  markFirstLaunchComplete: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeAuth: (() => void) | null = null;

  return {
    user: null,
    firebaseUser: null,
    isLoading: true,
    isInitialized: false,
    isFirstLaunch: true,

    initialize: async () => {
      if (unsubscribeAuth) {
        unsubscribeAuth(); // Clean up existing listener
      }

      set({ isLoading: true });

      // Check first launch status
      await get().checkFirstLaunch();

      // Set up auth state listener
      unsubscribeAuth = authService.onAuthStateChanged((firebaseUser, userData) => {
        set({ 
          firebaseUser, 
          user: userData,
          isLoading: false,
          isInitialized: true
        });
      });
    },

    signIn: async (email: string, password: string) => {
      try {
        set({ isLoading: true });
        const { user, userData } = await authService.signIn(email, password);
        set({ firebaseUser: user, user: userData, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    signUp: async (email: string, password: string, userData: Partial<UserData>) => {
      try {
        set({ isLoading: true });
        const { user, userData: newUserData } = await authService.signUp(email, password, userData);
        set({ firebaseUser: user, user: newUserData, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    signInWithPhone: async (phoneNumber: string) => {
      try {
        set({ isLoading: true });
        const verificationId = await authService.signInWithPhoneNumber(phoneNumber);
        set({ isLoading: false });
        return verificationId;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    verifyPhoneCode: async (verificationId: string, code: string, userData?: Partial<UserData>) => {
      try {
        set({ isLoading: true });
        const { user, userData: newUserData } = await authService.verifyPhoneCode(verificationId, code, userData);
        set({ firebaseUser: user, user: newUserData, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    verifyPhoneCodeForLogin: async (verificationId: string, code: string) => {
      try {
        console.log('Starting phone verification for login...');
        set({ isLoading: true });
        const { user, userData } = await authService.verifyPhoneCodeForLogin(verificationId, code);
        console.log('Phone verification successful:', { userId: user.uid, userDataExists: !!userData });
        set({ firebaseUser: user, user: userData, isLoading: false });
      } catch (error) {
        console.error('Phone verification failed:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    signOut: async () => {
      try {
        set({ isLoading: true });
        await authService.signOut();
        set({ user: null, firebaseUser: null, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    updateUserData: async (updates: Partial<UserData>) => {
      try {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        await authService.updateUserData(user._id, updates);
        set({ user: { ...user, ...updates } });
      } catch (error) {
        throw error;
      }
    },

    resetPassword: async (email: string) => {
      try {
        await authService.resetPassword(email);
      } catch (error) {
        throw error;
      }
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    checkFirstLaunch: async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const isFirstLaunch = hasLaunched === null;
        set({ isFirstLaunch });
        return isFirstLaunch;
      } catch (error) {
        console.error('Error checking first launch:', error);
        set({ isFirstLaunch: true });
        return true;
      }
    },

    markFirstLaunchComplete: async () => {
      try {
        await AsyncStorage.setItem('hasLaunched', 'true');
        set({ isFirstLaunch: false });
      } catch (error) {
        console.error('Error marking first launch complete:', error);
      }
    }
  };
});

export default useAuthStore;