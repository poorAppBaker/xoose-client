import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImagePicker from 'react-native-image-crop-picker';
import { useTheme } from '../../contexts/ThemeContext';
import LazyImage from '@/components/common/LazyImage';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import Modal from '@/components/common/Modal';

interface UserProfileUploaderProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string | null; // Image URI
  onImageChange?: (imageUri: string | null, file?: any) => void;
  style?: ViewStyle;
  disabled?: boolean;
  size?: number;
  placeholder?: string;
  loading?: boolean;
}

const UserProfileUploader: React.FC<UserProfileUploaderProps> = ({
  label,
  error,
  required = false,
  value,
  onImageChange,
  style,
  disabled = false,
  size = 120,
  placeholder,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const styles = createStyles(theme, size);

  // Add cleanup function for react-native-image-crop-picker
  useEffect(() => {
    return () => {
      // Clean up any temporary files when component unmounts
      ImagePicker.clean().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, []);

  const handlePress = () => {
    if (disabled || loading || isUploading) return;

    if (Platform.OS === 'ios') {
      // Use ActionSheet for iOS - no modal hierarchy issues
      const options = [];
      let cancelButtonIndex = 0;

      if (value) {
        options.push('Take Photo');
        options.push('Choose from Gallery');
        options.push('Remove Photo');
        options.push('Cancel');
        cancelButtonIndex = 3;
      } else {
        options.push('Take Photo');
        options.push('Choose from Gallery');
        options.push('Cancel');
        cancelButtonIndex = 2;
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Select Photo',
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) return; // Cancel pressed

          if (value) {
            if (buttonIndex === 0) {
              handleTakePhoto();
            } else if (buttonIndex === 1) {
              handlePickImage();
            } else if (buttonIndex === 2) {
              handleRemovePhoto();
            }
          } else {
            if (buttonIndex === 0) {
              handleTakePhoto();
            } else if (buttonIndex === 1) {
              handlePickImage();
            }
          }
        }
      );
    } else {
      // Use reusable Modal component for Android (following Input component pattern)
      setIsModalVisible(true);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsUploading(true);

      const image = await ImagePicker.openCamera({
        cropping: true,
        cropperCircleOverlay: true,
        compressImageMaxWidth: 512,
        compressImageMaxHeight: 512,
        compressImageQuality: 0.8,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        includeBase64: true, // Get base64 data directly
        includeExif: false,
      });

      // Use data URI directly instead of saving to local file
      const imageUri = `data:${image.mime};base64,${image.data}`;

      // Create file object for FormData if needed (using original path for upload)
      const file = {
        uri: image.path, // Keep original path for actual upload
        type: image.mime,
        name: `profile_${new Date().getTime()}.jpg`,
      };

      if (onImageChange) {
        onImageChange(imageUri, file); // Pass data URI for preview, file object for upload
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Camera error:', error);
        Alert.alert(
          'Camera Error',
          'Unable to take photo. Please try again.'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setIsUploading(true);

      const image = await ImagePicker.openPicker({
        cropping: true,
        cropperCircleOverlay: true,
        compressImageMaxWidth: 512,
        compressImageMaxHeight: 512,
        compressImageQuality: 0.8,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        includeBase64: true, // Get base64 data directly
        includeExif: false,
        multiple: false,
      });

      // Use data URI directly instead of saving to local file
      const imageUri = `data:${image.mime};base64,${image.data}`;

      // Create file object for FormData if needed (using original path for upload)
      const file = {
        uri: image.path, // Keep original path for actual upload
        type: image.mime,
        name: image.filename || `profile_${new Date().getTime()}.jpg`,
      };

      if (onImageChange) {
        onImageChange(imageUri, file); // Pass data URI for preview, file object for upload
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Gallery error:', error);
        Alert.alert(
          'Gallery Error',
          'Unable to select photo. Please try again.'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (onImageChange) {
              onImageChange(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Modal handlers (following Input component pattern)
  const handleTakePhotoFromModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      handleTakePhoto();
    }, 300); // Small delay to ensure modal closes before opening camera
  };

  const handlePickImageFromModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      handlePickImage();
    }, 300); // Small delay to ensure modal closes before opening gallery
  };

  const handleRemovePhotoFromModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      handleRemovePhoto();
    }, 300);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    return 'Add Photo';
  };

  const renderUploadArea = () => {
    if (value) {
      return (
        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <LazyImage
              uri={value}
              style={styles.profileImage}
              resizeMode="cover"
            />
            {(isUploading || loading) && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </View>
          {/* EditBadge positioned outside the clipped area */}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </View>
      );
    }

    return (
      <View style={[
        styles.uploadPlaceholder,
        (isUploading || loading) && styles.uploadPlaceholderDisabled
      ]}>
        {(isUploading || loading) ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons
            name="camera"
            size={size * 0.25}
            color={theme.colors.gray400}
          />
        )}
        <Text style={styles.placeholderText}>
          {(isUploading || loading) ?
            'Uploading...' :
            getPlaceholderText()
          }
        </Text>
      </View>
    );
  };

  // Photo Selection Modal (following Input component pattern)
  const PhotoSelectionModal = () => {
    if (!isModalVisible) return null;

    return (
      <Modal
        visible={isModalVisible}
        onClose={handleCloseModal}
      >
        {/* Header */}
        <ContentHeader title="Select Photo" />

        {/* Options Container */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={handleTakePhotoFromModal}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="camera" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionText}>
              Take Photo
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={handlePickImageFromModal}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="image" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.optionText}>
              Choose from Gallery
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>

          {value && (
            <TouchableOpacity
              style={styles.option}
              onPress={handleRemovePhotoFromModal}
            >
              <View style={[styles.optionIconContainer, styles.removeIconContainer]}>
                <Ionicons name="trash" size={28} color={theme.colors.error} />
              </View>
              <Text style={[styles.optionText, styles.removeOptionText]}>
                Remove Photo
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Footer with Cancel Button */}
        <View style={styles.modalFooter}>
          <Button
            title="Cancel"
            onPress={handleCloseModal}
            variant='outline'
            fullWidth
          />
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelBorderOverlay} />
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.uploadContainer,
          error && styles.uploadContainerError,
          (disabled || loading) && styles.uploadContainerDisabled
        ]}
        onPress={handlePress}
        disabled={disabled || loading || isUploading}
        activeOpacity={0.7}
      >
        {renderUploadArea()}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Photo Selection Modal */}
      <PhotoSelectionModal />
    </View>
  );
};

const createStyles = (theme: any, size: number) => StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    left: 18,
    top: -8,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: theme.colors.gray500,
    paddingHorizontal: 2,
    fontWeight: '700',
  },
  labelBorderOverlay: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    top: 8,
  },
  required: {
    color: theme.colors.error,
  },
  uploadContainer: {
    width: size,
    height: size,
  },
  uploadContainerError: {
    borderColor: theme.colors.error,
    borderStyle: 'solid',
  },
  uploadContainerDisabled: {
    opacity: 0.6,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: size / 2,
    overflow: 'hidden',
  },
  uploadPlaceholderDisabled: {
    backgroundColor: theme.colors.gray100,
  },
  placeholderText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.gray400,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  // NEW: Wrapper to contain both image and badge without clipping
  imageWrapper: {
    position: 'relative',
    width: size,
    height: size,
  },
  imageContainer: {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden', // Only clip the image, not the badge
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0, // Adjusted positioning
    right: 0,  // Adjusted positioning
    width: size * 0.25,
    height: size * 0.25,
    borderRadius: (size * 0.25) / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...theme.shadows.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
    textAlign: 'center',
  },

  // Modal styles (following Input component pattern)
  optionsContainer: {
    paddingVertical: theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  removeIconContainer: {
    backgroundColor: theme.colors.error + '10',
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  removeOptionText: {
    color: theme.colors.error,
  },
  modalFooter: {
  },
});

export default UserProfileUploader;