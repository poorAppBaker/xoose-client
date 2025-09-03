// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from 'expo-router';
import { FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import { useTranslation } from '@/hooks/useTranslation';

// Custom Tab Icon Component with support for multiple icon libraries
const TabIcon = ({
  name,
  color,
  focused,
  library = 'FontAwesome5'
}: {
  name: any,
  color: string,
  focused: boolean,
  library?: 'FontAwesome5' | 'Ionicons' | 'AntDesign'
}) => {
  const { theme } = useTheme();

  const renderIcon = () => {
    const iconColor = focused ? theme.colors.textWhite : theme.colors.textSecondary;
    const iconSize = 24;

    switch (library) {
      case 'Ionicons':
        return <Ionicons name={name} size={iconSize} color={iconColor} />;
      case 'AntDesign':
        return <AntDesign name={name} size={iconSize} color={iconColor} />;
      case 'FontAwesome5':
      default:
        return <FontAwesome5 name={name} size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={[
      styles.iconContainer,
      {
        backgroundColor: focused ? theme.colors.primary : 'transparent',
      }
    ]}>
      {renderIcon()}
    </View>
  );
};

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const isManager = user?.role === 'manager';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 20,
          height: Platform.OS === 'android' ? 80 : 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
          display: 'none',
        },
        headerStyle: {
          backgroundColor: theme.colors.backgroundCard,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          ...theme.shadows.sm,
        },
        headerTitleStyle: {
          ...theme.typography.h3,
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tab_layout.dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home"
              color={color}
              focused={focused}
              library="Ionicons"
            />
          ),
          // Hide tab completely for non-managers
          href: isManager ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab_layout.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person"
              color={color}
              focused={focused}
              library="Ionicons"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});