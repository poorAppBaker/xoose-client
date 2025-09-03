// services/file.ts
import { apiRequest } from './api';

// Interface for the file URL response
interface FileUrlResponse {
  status: string;
  data: {
    url: string;
  };
}

/**
 * Get a signed URL for accessing a file
 * @param fileUrl URL path from the API (e.g., /api/files/images/filename.jpg)
 */
export const getFileUrl = async (fileUrl: string): Promise<string> => {
  try {
    // If the URL is already a full URL (e.g., https://...), return it as is
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }

    // If the URL is a relative path to our API endpoint, fetch the signed URL
    if (fileUrl.startsWith('/files/')) {
      const response = await apiRequest<FileUrlResponse>(fileUrl, 'GET');
      return response.data.url;
    }

    // If it's something else, just return it
    return fileUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Get an image source object for React Native Image component
 * @param fileUrl URL path from the API
 */
export const getImageSource = async (fileUrl: string) => {
  try {
    const url = await getFileUrl(fileUrl);
    return {
      uri: url,
      headers: {
        'Accept': 'image/*',
      },
    };
  } catch (error) {
    console.error('Error getting image source:', error);
    return null;
  }
};