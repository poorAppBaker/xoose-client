// components/common/LogoutModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from './Modal';
import Button from './Button';
import useAuthStore from '../../store/authStore';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose, onConfirm }) => {
  const { theme } = useTheme();
  const { signOut } = useAuthStore();
  const styles = createStyles(theme);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showTopBar={false}
      maxHeight="auto"
      containerStyle={styles.logoutModalContainer}
    >
      <View style={styles.logoutModalContent}>
        {/* Question Icon */}
        <View style={styles.questionIconContainer}>
          <Image
            source={require('../../assets/images/question.png')}
            style={styles.questionIcon}
            resizeMode="contain"
          />
        </View>

        {/* Question Text */}
        <Text style={styles.logoutQuestionText}>
          Are you sure you want to Log Out?
        </Text>

        {/* Warning Text */}
        <Text style={styles.logoutWarningText}>
          This action cannot be undone.
        </Text>

        {/* Action Buttons */}
       {/* Action Buttons */}
       <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  logoutModalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  logoutModalContent: {
    alignItems: 'center',
    width: '100%',
  },
  questionIconContainer: {
    marginBottom: theme.spacing.sm,
  },
  questionIcon: {
    width: 100,
    height: 100,
  },
  logoutQuestionText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray800,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  logoutWarningText: {
    fontSize: 16,
    color: theme.colors.gray600,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    borderRadius: 25, // Pill shape with highly rounded corners
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...theme.shadows.sm, // Add subtle shadow
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.blue500,
    borderRadius: 25, // Pill shape with highly rounded corners
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...theme.shadows.sm, // Add subtle shadow
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default LogoutModal;
