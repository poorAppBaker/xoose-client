// components/common/Modal.tsx
import React from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  ModalProps as RNModalProps,
  ViewStyle,
  StatusBar
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
      statusBarTranslucent={true}
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
      justifyContent: maxHeight === '100%' ? 'flex-start' : 'flex-end',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    },
    modalContainer: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: maxHeight === '100%' ? 0 : theme.borderRadius.xl,
      borderTopRightRadius: maxHeight === '100%' ? 0 : theme.borderRadius.xl,
      paddingBottom: 34, // Safe area bottom padding
      maxHeight: maxHeight,
      height: maxHeight === '100%' ? '100%' : undefined,
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