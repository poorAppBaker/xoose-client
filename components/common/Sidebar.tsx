// components/common/Sidebar.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useTheme } from '../../contexts/ThemeContext';
import LogoutModal from './LogoutModal';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
  selectedCountry?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  userName = "Simon",
  userImage,
  selectedCountry = "PT"
}) => {
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const styles = createStyles(theme);

  const menuItems: MenuItem[] = [
    {
      id: 'profiles',
      title: 'Profiles & Payment',
      icon: 'card-outline',
      onPress: () => console.log('Profiles & Payment')
    },
    {
      id: 'rides',
      title: 'My Rides',
      icon: 'list-outline',
      onPress: () => console.log('My Rides')
    },
    {
      id: 'places',
      title: 'My Places',
      icon: 'location-outline',
      onPress: () => console.log('My Places')
    },
    {
      id: 'drivers',
      title: 'My Trusted Drivers',
      icon: 'shield-outline',
      onPress: () => console.log('My Trusted Drivers')
    },
    {
      id: 'coupons',
      title: 'Coupons',
      icon: 'pricetag-outline',
      onPress: () => console.log('Coupons')
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'chatbubble-outline',
      onPress: () => console.log('Support')
    },
    {
      id: 'bug',
      title: 'Report a Bug',
      icon: 'information-circle-outline',
      onPress: () => console.log('Report a Bug')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline',
      onPress: () => console.log('Settings')
    },
    {
      id: 'about',
      title: 'About',
      icon: 'document-text-outline',
      onPress: () => console.log('About')
    }
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    item.onPress();
    onClose();
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    onClose(); // Hide sidebar when showing logout modal
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Logout Confirmation Modal - Always rendered */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={handleCloseLogoutModal}
        onConfirm={handleLogout}
      />

      {/* Sidebar - Only render when visible */}
      {visible && (
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
            <View style={styles.headerRow}>
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
                <CountryFlag
                  isoCode={selectedCountry}
                  size={20}
                  style={styles.countryFlag}
                />
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
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={theme.colors.gray500}
                  style={styles.menuIcon}
                />
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
              <Ionicons
                name="log-out-outline"
                size={20}
                color={theme.colors.gray500}
                style={styles.menuIcon}
              />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
        </>
      )}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray50,
  },
  countryFlag: {
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
    width: 20,
    height: 20,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray800,
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
  menuText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.gray600,
    fontWeight: '400',
  },
  footer: {
    borderTopWidth: 1,
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
    color: theme.colors.gray600,
    fontWeight: '400',
  },
});

export default Sidebar;