// types/auth.ts
export type UserRole = 'manager' | 'team_member';

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface PushTokenInfo {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
    deviceName?: string;
    deviceModel?: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    initialize: (locale: string) => Promise<void>;
    login: (email: string, password: string) => Promise<User>;
    signup: (email: string, password: string, firstName: string, lastName: string, role: 'manager' | 'team_member',
        additionalInfo?: {
            companyName?: string;
            vatNumber?: string;
            address?: string;
            phoneNumber?: string;
        }) => Promise<User>;
    logout: () => Promise<void>;
    resetPasswordRequest: (email: string) => Promise<any>;
    resetPassword: (code: string, email: string, password: string) => Promise<User>;
    updateProfile: (firstName: string, lastName: string, email: string) => (Promise<User>);
    updatePassword: (currentPassword: string, newPassword: string) => (Promise<User>);
    syncPushToken: (token: string, platform?: 'ios' | 'android' | 'web', deviceId?: string) => Promise<User>;
}