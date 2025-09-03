import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import PhoneNumberInput from '@/components/common/PhoneNumberInput';
import { Ionicons } from '@expo/vector-icons';
import Select from '@/components/common/Select';

const LANGUAGE_COUNTRIES = [
  { name: 'Portugal', code: 'PT' },
  { name: 'United States', code: 'US' },
  { name: 'Spain', code: 'ES' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
]

export default function PhoneNumberScreen() {
  const { theme } = useTheme();
  const [phone, setPhone] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState<string>('');
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState(new Date());
  const [password, setPassword] = React.useState('');

  const styles = createStyles(theme);

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.taglineText}>Welcome!</Text>
          <Text style={styles.chooseText}>Please select your language.</Text>
        </View>

        <View style={styles.logoContainer}>
          <Button title='Continue' fullWidth onPress={() => { }} />
          <Button variant='outline' title='test' onPress={() => { }} />

          <Select
            label="Country"
            options={[
              { label: "United States", value: "us" },
              { label: "Canada", value: "ca" },
              { label: "Mexico", value: "mx" }
            ]}
            value={selectedCountry}
            onSelectionChange={(value) => setSelectedCountry(value as string)}
            placeholder="Select a country"
          />

          <Input label='Name' value={name} onChangeText={setName} placeholder='Enter your name' />
          <Input type='date' label='Date of Birth' value={dob} onDateTimeChange={setDob} placeholder='Select date of birth' />
          <Input type='password' label='Password' placeholder='Please enter the password' />

          <PhoneNumberInput
            label="Phone Number"
            placeholder="Enter your phone"
            defaultCountry="US"
            onChangeText={(phone) => setPhone(phone)}
          // onCountryChange={(country) => setSelectedCountry(country)}
          />
        </View>

      </View>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors?.background || '#ffffff',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
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