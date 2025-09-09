// store/authStore.ts
import { create } from 'zustand';
import authService, { UserData } from '../services/authService';

interface AuthState {
  user: UserData | null;
  firebaseUser: any | null; // Changed from User to any since we're using React Native Firebase
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserData>) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<string>; // Returns verification ID
  verifyPhoneCode: (verificationId: string, code: string, userData?: Partial<UserData>) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  cleanup: () => void;
}

const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeAuth: (() => void) | null = null;

  return {
    user: null,
    firebaseUser: null,
    isLoading: true,
    isInitialized: false,

    initialize: () => {
      if (unsubscribeAuth) {
        unsubscribeAuth(); // Clean up existing listener
      }

      set({ isLoading: true });

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

    // Optionally expose:
    cleanup: () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
        unsubscribeAuth = null;
      }
      authService.cleanup(); // clears pendingCredential just in case
    },
  };
});

export default useAuthStore;