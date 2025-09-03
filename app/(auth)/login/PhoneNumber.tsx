import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import PhoneNumberInput, { Country } from '@/components/common/PhoneNumberInput';
import ContentHeader from '@/components/common/ContentHeader';

export default function PhoneNumberScreen() {
  const { theme } = useTheme();
  const [phone, setPhone] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
  const router = useRouter();

  const styles = createStyles(theme);

  const handleBack = () => {
    router.back();
  }

  const handleContinue = () => {
    router.push('/(auth)/login/SMSCode');
  }

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <ContentHeader title='Enter Your Phone Number' />

        <PhoneNumberInput
          label="Phone"
          placeholder="Enter your phone"
          defaultCountry="US"
          onChangeText={(countryfullPhoneNumber: string, nationalNumber: string, country: Country) => {
            setPhone(countryfullPhoneNumber);
            setSelectedCountry(country);
          }}
          style={{ marginTop: theme.spacing.lg + theme.spacing.xs }}
        />

        <View style={styles.spacer} />

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <Button variant="outline" title="Cancel" onPress={handleBack} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title="Continue"
              onPress={handleContinue}
              disabled={phone.length === 0 || !selectedCountry}
            />
          </View>
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
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
  }
});