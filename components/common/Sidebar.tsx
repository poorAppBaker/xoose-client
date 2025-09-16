// components/common/Sidebar.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
  selectedCountry?: string;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  userName = "Simon",
  userImage,
  selectedCountry,
  onLogout
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  // Use static icon map to satisfy Metro bundler (no dynamic require)
  const iconSources: Record<string, any> = {
    'profiles.png': require('../../assets/images/icons/menu/profiles.png'),
    'rides.png': require('../../assets/images/icons/menu/rides.png'),
    'places.png': require('../../assets/images/icons/menu/places.png'),
    'trusted.png': require('../../assets/images/icons/menu/trusted.png'),
    'coupons.png': require('../../assets/images/icons/menu/coupons.png'),
    'support.png': require('../../assets/images/icons/menu/support.png'),
    'report.png': require('../../assets/images/icons/menu/report.png'),
    'settings.png': require('../../assets/images/icons/menu/settings.png'),
    'about.png': require('../../assets/images/icons/menu/about.png'),
  };

  if (!visible) return null;

  const menuItems: MenuItem[] = [
    {
      id: 'profiles',
      title: 'Profiles & Payment',
      icon: 'profiles.png',
      onPress: () => router.push('/(tabs)/profilepayment')
    },
    {
      id: 'rides',
      title: 'My Rides',
      icon: 'rides.png',
      onPress: () => console.log('My Rides')
    },
    {
      id: 'places',
      title: 'My Places',
      icon: 'places.png',
      onPress: () => console.log('My Places')
    },
    {
      id: 'drivers',
      title: 'My Trusted Drivers',
      icon: 'trusted.png',
      onPress: () => console.log('My Trusted Drivers')
    },
    {
      id: 'coupons',
      title: 'Coupons',
      icon: 'coupons.png',
      onPress: () => console.log('Coupons')
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'support.png',
      onPress: () => console.log('Support')
    },
    {
      id: 'bug',
      title: 'Report a Bug',
      icon: 'report.png',
      onPress: () => console.log('Report a Bug')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings.png',
      onPress: () => console.log('Settings')
    },
    {
      id: 'about',
      title: 'About',
      icon: 'about.png',
      onPress: () => console.log('About')
    }
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    item.onPress();
    onClose();
  };

  const handleLogout = () => {
    onLogout?.();
  };
  console.log('Selected country:', selectedCountry);

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sidebar */}
      <View style={styles.sidebar}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  {userImage ? (
                    <Image source={{ uri: userImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <TouchableOpacity style={styles.viewAccountButton}>
                    <Text style={styles.viewAccountText}>View Account</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Country Selector */}
              <TouchableOpacity style={styles.countrySelector}>
                <View style={styles.countryFlagSection}>
                  <CountryFlag
                    isoCode={selectedCountry || 'US'}
                    size={20}
                    style={styles.countryFlag}
                  />
                </View>
                <Text style={styles.countryText}>{selectedCountry}</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={theme.colors.gray500}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <Image source={iconSources[item.icon]} style={styles.menuIconImage} />
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer - Logout */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Image source={require('../../assets/images/icons/menu/logout.png')} style={styles.menuIcon} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: theme.colors.white,
    zIndex: 999,
    ...theme.shadows.lg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.gray800,
    marginBottom: theme.spacing.xs,
  },
  viewAccountButton: {
    alignSelf: 'flex-start',
  },
  viewAccountText: {
    fontSize: 14,
    color: theme.colors.blue500,
    fontWeight: '500',
  },
  countrySelector: {
    gap: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.white,
  },
  countryFlagSection: {
    width: 20,
    height: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  countryFlag: {
    borderRadius: 20,
    marginRight: theme.spacing.xs,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray500,
    marginRight: theme.spacing.xs,
  },
  menuContainer: {
    flex: 1,
    paddingTop: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  menuIcon: {
    marginRight: theme.spacing.md,
    width: 20,
  },
  menuIconImage: {
    marginRight: theme.spacing.md,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray500,
    fontWeight: '400',
  },
  footer: {
    borderTopColor: theme.colors.gray100,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray500,
    fontWeight: '400',
  },
});

export default Sidebar;