// components/common/Tab.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
}

interface TabProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && styles.activeTabButton
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.lg,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: 2,
    backgroundColor: theme.colors.backgroundSurface,
    ...theme.shadows.lg,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.button,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
});

export default Tab;