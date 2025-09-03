// services/auth.ts
import { User } from '../types/auth';
import { apiRequest } from './api';

// Authentication API service

export interface AuthResponse {
    token: string;
    userData: User;
}

interface PushTokenData {
    token: string;
    platform?: 'ios' | 'android' | 'web';
    deviceId?: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', 'POST', {
        email,
        password
    });
};

export const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'manager' | 'team_member',
    additionalInfo?: {
        companyName?: string;
        vatNumber?: string;
        address?: string;
        phoneNumber?: string;
    }
): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/signup', 'POST', {
        email,
        password,
        firstName,
        lastName,
        role,
        ...additionalInfo
    });
};

export const getUserData = async (locale: string): Promise<{ data: User }> => {
    return apiRequest<{ data: User }>(`/auth/me?locale=${locale}`, 'GET');
};

export const forgotPassword = async (email: string): Promise<any> => {
    return apiRequest<void>('/auth/forgot-password', 'POST', { email });
};

export const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
): Promise<any> => {
    return apiRequest<any>('/auth/reset-password', 'POST', {
        email,
        code,
        newPassword
    });
};

export const updateProfile = async (
    firstName: string,
    lastName: string,
    email: string,
): Promise<any> => {
    return apiRequest<any>('/auth/update-profile', 'PUT', {
        firstName,
        lastName,
        email
    });
};

export const updatePassword = async (
    currentPassword: string,
    newPassword: string,
): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/update-password', 'POST', {
        currentPassword,
        newPassword
    });
};

export const registerPushToken = async (
    tokenData: PushTokenData
): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/push-token', 'POST', tokenData);
};

export const removePushToken = async (
    token: string
): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/push-token', 'DELETE', { token });
};