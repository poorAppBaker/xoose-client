// components/common/Modal.tsx
import React from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  ModalProps as RNModalProps,
  ViewStyle
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showTopBar?: boolean;
  maxHeight?: string | number;
  containerStyle?: ViewStyle;
  backdropOpacity?: number;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  showTopBar = true,
  maxHeight = '70%',
  containerStyle,
  backdropOpacity = 0.5,
  animationType = 'slide',
  transparent = true,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, maxHeight, backdropOpacity);

  return (
    <RNModal
      transparent={transparent}
      animationType={animationType}
      visible={visible}
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {showTopBar && (
            <View style={styles.modalTopBar}>
              <View style={styles.modalTopBarLine} />
            </View>
          )}
          <View style={[containerStyle]}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const createStyles = (theme: any, maxHeight: any, backdropOpacity: number) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    },
    modalContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingBottom: 34, // Safe area bottom padding
      maxHeight: maxHeight,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    modalTopBar: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTopBarLine: {
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.gray200,
      width: 100,
      height: 5,
    },
  });

export default Modal;