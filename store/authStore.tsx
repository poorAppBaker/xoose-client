// store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/auth';
import { AuthState, User } from '../types/auth';

const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isLoading: true,
	error: null,

	// Initialize the store by checking for existing auth
	initialize: async (locale: string) => {
		try {
			const token = await AsyncStorage.getItem('userToken');
			if (token) {
				const userData = await authService.getUserData(locale);
				set({ user: userData.data, isLoading: false });
			} else {
				set({ isLoading: false });
			}
		} catch (error) {
			console.error('Failed to load user:', error);
			await AsyncStorage.removeItem('userToken');
			set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to load user' });
		}
	},

	// Login method
	login: async (email: string, password: string) => {
		try {
			set({ isLoading: true, error: null });
			const { token, userData } = await authService.login(email, password);
			await AsyncStorage.setItem('userToken', token);
			set({ user: userData, isLoading: false });
			return userData;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Login failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Signup method
	signup: async (email: string, password: string, firstName: string, lastName: string, role: 'manager' | 'team_member', additionalInfo?: {
		companyName?: string;
		vatNumber?: string;
		address?: string;
		phoneNumber?: string;
	}
	) => {
		try {
			set({ isLoading: true, error: null });
			const { token, userData } = await authService.signup(email, password, firstName, lastName, role, additionalInfo);
			await AsyncStorage.setItem('userToken', token);
			set({ user: userData, isLoading: false });
			return userData;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Signup failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Logout method
	logout: async () => {
		try {
			await AsyncStorage.removeItem('userToken');
			set({ user: null });
			return Promise.resolve();
		} catch (error: any) {
			console.error('Failed to logout:', error);
			const errMsg = error?.response?.data?.message || 'Failed to logout';
			return Promise.reject(errMsg);
		}
	},

	// Reset password method
	resetPasswordRequest: async (email: string) => {
		try {
			set({ isLoading: true, error: null });
			const { status } = await authService.forgotPassword(email);
			set({ isLoading: false });
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Password reset request failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	// Reset password method
	resetPassword: async (code: string, email: string, password: string) => {
		try {
			set({ isLoading: true, error: null });
			const { token, userData } = await authService.resetPassword(email, code, password);
			await AsyncStorage.setItem('userToken', token);
			set({ user: userData, isLoading: false });
			return userData;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Password reset failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	updateProfile: async (firstName: string, lastName: string, email: string) => {
		try {
			set({ isLoading: true, error: null });
			const { data } = await authService.updateProfile(firstName, lastName, email);
			const { user } = data;
			set({ user: user, isLoading: false });
			return user;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Profile update failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	updatePassword: async (currentPassword: string, newPassword: string) => {
		try {
			set({ isLoading: true, error: null });
			const { token, userData } = await authService.updatePassword(currentPassword, newPassword);
			await AsyncStorage.setItem('userToken', token);
			set({ user: userData, isLoading: false });
			return userData;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Password update failed';
			set({ isLoading: false, error: errMsg });
			throw error;
		}
	},

	syncPushToken: async (token: string, platform?: 'ios' | 'android' | 'web', deviceId?: string) => {
		try {
			const { userData } = await authService.registerPushToken({
				token,
				platform,
				deviceId,
			});
			return userData;
		} catch (error: any) {
			const errMsg = error?.response?.data?.message || 'Failed to sync token';
			set({ error: errMsg });
			throw error;
		}
	},
}));

export default useAuthStore;