import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';

export default function OnboardingScreen() {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/xoose-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.taglineText}>The price. The car. The Driver</Text>
          <Text style={styles.chooseText}>YOU CHOOSE</Text>
        </View>

      </View>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
  },
  spacer: {
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    height: 80,
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  taglineText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '400',
  },
  chooseText: {
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
});