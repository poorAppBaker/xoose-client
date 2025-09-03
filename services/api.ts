// services/api.ts
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configure the API URL for your environment
// In a real app, you might use environment variables or a config file
// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem('userToken');
};

// Helper for API requests
export const apiRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any
): Promise<T> => {
    const token = await getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.info(`API Request: ${method}`, `${API_URL}${endpoint}`);

    try {
        const response = await axios({
            url: `${API_URL}${endpoint}`,
            method,
            headers,
            data,
            // timeout: API_TIMEOUT as number,
        });

        return response.data;
    } catch (error) {
        // Enhanced error logging
        if (axios.isAxiosError(error)) {
            console.error(`API Error (${endpoint}):`, {
                message: error.message,
                response: error.response ? {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                } : null,
            });
        } else {
            console.error(`Unexpected Error (${endpoint}):`, error);
        }
        throw error;
    }
};

// Specialized API request method for form data uploads
export const formDataRequest = async <T>(
    endpoint: string,
    formData: FormData
): Promise<T> => {
    const token = await getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await axios.post(`${API_URL}${endpoint}`, formData, {
            headers,
            // timeout: API_TIMEOUT as number,
        });

        return response.data;
    } catch (error) {
        // Enhanced error logging
        console.log('error', error);
        if (axios.isAxiosError(error)) {
            console.error(`API Error (${endpoint}):`, {
                message: error.message,
                response: error.response ? {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                } : null,
            });
        } else {
            console.error(`Unexpected Error (${endpoint}):`, error);
        }
        throw error;
    }
};