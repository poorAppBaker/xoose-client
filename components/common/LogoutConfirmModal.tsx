// components/common/LogoutConfirmModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ visible, onCancel, onConfirm }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} onClose={onCancel} showTopBar maxHeight={'auto'}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Image
            source={require('../../assets/images/question.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Are you sure you want{"\n"}to Log Out?</Text>
        <Text style={styles.subtitle}>This action cannot be undone.</Text>

        <View style={styles.actionsRow}>
          <Button
            variant="outline"
            title="Cancel"
            onPress={onCancel}
          />
          <Button
            variant="primary"
            title="Confirm"
            onPress={onConfirm}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  iconWrap: { marginBottom: theme.spacing.md },
  icon: { width: 100, height: 100 },
  title: {
    textAlign: 'center',
    color: theme.colors.gray800,
    fontWeight: '800',
    fontSize: 22,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.gray600,
    fontSize: 16,
    marginBottom: theme.spacing.xl,
  },
  actionsRow: { flexDirection: 'row', width: '100%', gap: theme.spacing.md },

  confirmButton: {
    flex: 1,
  },
});

export default LogoutConfirmModal;


