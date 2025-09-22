import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InviteFriendsProps {
  visible: boolean;
  onClose?: () => void;
}

export default function InviteFriends({ visible, onClose }: InviteFriendsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>INVITE YOUR FRIENDS</Text>
          <Text style={styles.subtitle}>Because everyone has the right to Xoose</Text>
        </View>
        <View style={styles.iconContainer}>
          <Image source={require('../../assets/images/man-with-megaphone.png')} style={styles.icon} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '48%', // Increased from 44% to add spacing with WhereToGoModal
    left: '3%',
    right: '3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxWidth: '94%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.blue500,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '400',
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: theme.spacing.xl,
  },
  icon: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
});
