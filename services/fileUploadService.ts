// services/fileUploadService.ts
import { storage } from '@/config/firebase';
import { Platform } from 'react-native';

export interface UploadResult {
  url: string;
  path: string;
  metadata: {
    size: number;
    contentType: string;
    timeCreated: string;
  };
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

class FileUploadService {
  /**
   * Upload a file to Firebase Storage
   * @param file - File object with uri, type, and name
   * @param path - Storage path (e.g., 'profile-images/user123.jpg')
   * @param onProgress - Optional progress callback
   * @returns Promise with upload result
   */
  async uploadFile(
    file: { uri: string; type: string; name: string },
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Create a reference to the file location in Firebase Storage
      const storageRef = storage().ref(path);

      // Handle data URIs (base64) - this is what react-native-image-crop-picker returns
      if (file.uri.startsWith('data:')) {
        // Extract base64 data from data URI
        const base64Data = file.uri.split(',')[1];
        
        if (!base64Data) {
          throw new Error('Invalid data URI: no base64 data found');
        }
        
        console.log('Uploading base64 data:', {
          dataLength: base64Data.length,
          contentType: file.type,
          fileName: file.name,
          path: path
        });
        
        // Try different approaches for uploading base64 data
        let uploadTask;
        
        try {
          // Method 1: Direct base64 upload
          uploadTask = storageRef.putString(base64Data, 'base64', {
            contentType: file.type,
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              platform: Platform.OS,
            },
          });
        } catch (putStringError) {
          console.log('putString failed, trying alternative method:', putStringError);
          
          // Method 2: Convert base64 to blob and upload
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: file.type });
          
          uploadTask = storageRef.put(blob, {
            contentType: file.type,
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              platform: Platform.OS,
            },
          });
        }

        // Set up progress tracking (non-blocking)
        if (onProgress) {
          uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: progress,
            });
          });
        }

        // Use a simpler approach with proper async/await
        try {
          // Wait for upload to complete
          const snapshot = await uploadTask;
          
          console.log('Upload snapshot:', snapshot);
          
          if (!snapshot) {
            throw new Error('Upload completed but no snapshot returned');
          }
          
          // Create a new reference to the uploaded file using the fullPath
          const fileRef = storage().ref(snapshot.metadata.fullPath);
          const downloadURL = await fileRef.getDownloadURL();
          console.log('Download URL:', downloadURL);

          // Get metadata (already available in snapshot.metadata)
          const metadata = snapshot.metadata;
          console.log('Metadata:', metadata);

          return {
            url: downloadURL,
            path: metadata.fullPath,
            metadata: {
              size: metadata.size,
              contentType: metadata.contentType,
              timeCreated: metadata.timeCreated,
            },
          };
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } else {
        // For file URIs, try to fetch and convert to blob
        try {
          const response = await fetch(file.uri);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          if (!blob || blob.size === 0) {
            throw new Error('File is empty or could not be read');
          }

          const uploadTask = storageRef.put(blob, {
            contentType: file.type,
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              platform: Platform.OS,
            },
          });

          // Listen for upload progress
          if (onProgress) {
            uploadTask.on('state_changed', (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                percentage: progress,
              });
            });
          }

          // Wait for upload to complete
          const snapshot = await uploadTask;
          
          // Get download URL
          const downloadURL = await snapshot.ref.getDownloadURL();

          // Get metadata
          const metadata = await snapshot.ref.getMetadata();

          return {
            url: downloadURL,
            path: snapshot.ref.fullPath,
            metadata: {
              size: metadata.size,
              contentType: metadata.contentType,
              timeCreated: metadata.timeCreated,
            },
          };
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          throw new Error(`Failed to read file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload profile image with automatic path generation
   * @param file - File object
   * @param userId - User ID for path generation
   * @param onProgress - Optional progress callback
   * @returns Promise with upload result
   */
  async uploadProfileImage(
    file: { uri: string; type: string; name: string },
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `profile_${userId}_${timestamp}.${fileExtension}`;
    const path = `profile-images/${fileName}`;

    return this.uploadFile(file, path, onProgress);
  }

  /**
   * Delete a file from Firebase Storage
   * @param path - Storage path of the file to delete
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = storage().ref(path);
      await storageRef.delete();
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata from Firebase Storage
   * @param path - Storage path of the file
   * @returns Promise with file metadata
   */
  async getFileMetadata(path: string): Promise<any> {
    try {
      const storageRef = storage().ref(path);
      const metadata = await storageRef.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
export default fileUploadService;
