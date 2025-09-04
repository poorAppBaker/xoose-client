// app/(auth)/signup/Language.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import CountryFlag from 'react-native-country-flag';

import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import { Country } from '@/components/common/PhoneNumberInput';
import { useSignupStore } from '@/store/signupStore';

const LANGUAGE_COUNTRIES = [
  { name: 'Portugal', code: 'PT', dialCode: '+351', format: '### ### ###' },
  { name: 'Spain', code: 'ES', dialCode: '+34', format: '### ### ###' },
  { name: 'United States', code: 'US', dialCode: '+1', format: '(###) ###-####' },
  { name: 'France', code: 'FR', dialCode: '+33', format: '## ## ## ## ##' },
  { name: 'Germany', code: 'DE', dialCode: '+49', format: '#### #######' },
];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const signupStore = useSignupStore();
  const [selectedLanguage, setSelectedLanguage] = useState<Country | null>(
    signupStore.selectedCountry
  );

  const styles = createStyles(theme);

  const handleSelectLanguage = (country: Country) => {
    setSelectedLanguage(selectedLanguage === country ? null : country);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      signupStore.setSelectedCountry(selectedLanguage);
      router.push('/(auth)/signup/PhoneNumber');
    }
  };

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.taglineText}>Welcome!</Text>
          <Text style={styles.chooseText}>Please select your language.</Text>
        </View>

        <View style={styles.languageImage}>
          <Svg width="61" height="60" viewBox="0 0 61 60" fill="none">
            <Path d="M30.5 55L28 47.5H10.5C9.125 47.5 7.94792 47.0104 6.96875 46.0312C5.98958 45.0521 5.5 43.875 5.5 42.5V10C5.5 8.625 5.98958 7.44792 6.96875 6.46875C7.94792 5.48958 9.125 5 10.5 5H25.5L27.6875 12.5H50.5C51.9583 12.5 53.1562 12.9687 54.0937 13.9062C55.0312 14.8437 55.5 16.0417 55.5 17.5V50C55.5 51.375 55.0312 52.5521 54.0937 53.5312C53.1562 54.5104 51.9583 55 50.5 55H30.5ZM35.125 37.75L36.5 36.4375C35.9167 35.7292 35.3854 35.0417 34.9062 34.375C34.4271 33.7083 33.9583 33 33.5 32.25L35.125 37.75ZM38.25 34.5625C39.4167 33.1875 40.3021 31.875 40.9062 30.625C41.5104 29.375 41.9167 28.3958 42.125 27.6875H32.1875L32.9375 30.3125H35.4375C35.7708 30.9375 36.1667 31.6146 36.625 32.3437C37.0833 33.0729 37.625 33.8125 38.25 34.5625ZM33 52.5H50.5C51.25 52.5 51.8542 52.2604 52.3125 51.7812C52.7708 51.3021 53 50.7083 53 50V17.5C53 16.75 52.7708 16.1458 52.3125 15.6875C51.8542 15.2292 51.25 15 50.5 15H28.4375L31.375 25.125H36.3125V22.5H38.875V25.125H48V27.6875H44.8125C44.3958 29.2708 43.7708 30.8125 42.9375 32.3125C42.1042 33.8125 41.125 35.2083 40 36.5L46.8125 43.1875L45 45L38.25 38.25L36 40.5625L38 47.5L33 52.5Z" fill="#75D2FC" />
            <Path d="M9.32373 37.9412L17.2098 18.5294H20.8495L28.7355 37.9412H25.0958L23.2326 33.0074H14.8266L12.9634 37.9412H9.32373ZM15.9099 30.1765H22.1494L19.0296 21.9265L15.9099 30.1765Z" fill="white" />
          </Svg>
        </View>

        <View style={styles.languageList}>
          {LANGUAGE_COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.languageItem,
                selectedLanguage?.code === country.code && styles.languageItemSelected
              ]}
              onPress={() => handleSelectLanguage(country)}
            >
              <CountryFlag
                isoCode={country.code}
                size={24}
                style={{
                  borderRadius: 100,
                  width: 24,
                }}
              />
              <Text style={[
                styles.languageItemText,
                selectedLanguage?.code === country.code && styles.languageItemTextSelected
              ]}>
                {country.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottomContainer}>
          <Button
            variant="primary"
            fullWidth
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedLanguage}
          />
        </View>
      </View>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
  },
  textContainer: {
    marginBottom: theme.spacing.md,
  },
  taglineText: {
    fontWeight: '800',
    fontSize: 20,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  chooseText: {
    ...theme.typography.body,
    marginBottom: theme.spacing.lg,
  },
  languageImage: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  languageList: {
    gap: theme.spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: theme.borderRadius.full,
  },
  languageItemSelected: {
    borderColor: theme.colors.blue500,
  },
  languageItemText: {
    ...theme.typography.body,
    color: theme.colors.gray800,
    flex: 1,
  },
  languageItemTextSelected: {
    color: theme.colors.blue500,
  },
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
  },
});