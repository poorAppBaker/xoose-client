import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import CountryFlag from 'react-native-country-flag';

// Country data with proper country codes for flags
const COUNTRIES = [
  // Shortlist countries
  { name: 'Portugal', code: 'PT', dialCode: '+351', format: '### ### ###' },
  { name: 'Spain', code: 'ES', dialCode: '+34', format: '### ### ###' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', format: '#### ### ####' },
  { name: 'United States', code: 'US', dialCode: '+1', format: '(###) ###-####' },
  { name: 'France', code: 'FR', dialCode: '+33', format: '## ## ## ## ##' },
  { name: 'Germany', code: 'DE', dialCode: '+49', format: '#### #######' },
  { name: 'Italy', code: 'IT', dialCode: '+39', format: '### ### ####' },
  
  // All countries
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', format: '## ### ####' },
  { name: 'Albania', code: 'AL', dialCode: '+355', format: '## ### ####' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', format: '## ## ## ## ##' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', format: '## #### ####' },
  { name: 'Australia', code: 'AU', dialCode: '+61', format: '#### ### ###' },
  { name: 'Austria', code: 'AT', dialCode: '+43', format: '### #### ###' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', format: '### ## ## ##' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', format: '## #####-####' },
  { name: 'Canada', code: 'CA', dialCode: '+1', format: '(###) ###-####' },
  { name: 'China', code: 'CN', dialCode: '+86', format: '### #### ####' },
  { name: 'India', code: 'IN', dialCode: '+91', format: '##### #####' },
  { name: 'Japan', code: 'JP', dialCode: '+81', format: '## #### ####' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', format: '## #### ####' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', format: '## ### ####' },
  { name: 'Russia', code: 'RU', dialCode: '+7', format: '### ### ## ##' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', format: '## #### ####' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', format: '### ### ## ##' },
];

const SHORTLIST_COUNTRIES = COUNTRIES.slice(0, 7);
const ALL_COUNTRIES = COUNTRIES.slice(7);

interface Country {
  name: string;
  code: string;
  dialCode: string;
  format: string;
}

interface PhoneNumberInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onCountryChange?: (country: Country) => void;
  defaultCountry?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

interface FlagComponentProps {
  countryCode: string;
  size?: number;
}

interface CountryItemProps {
  item: Country;
  onPress: (country: Country) => void;
}

const FlagComponent: React.FC<FlagComponentProps> = ({ countryCode, size = 24 }) => {
  return (
    <CountryFlag
      isoCode={countryCode.toLowerCase()}
      size={size}
      style={{ borderRadius: 2 }}
    />
  );
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChangeText,
  onCountryChange,
  defaultCountry = 'PT',
  placeholder = 'Phone number',
  label = 'Phone',
  disabled = false,
  style,
  inputStyle,
  labelStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(country => country.code === defaultCountry) || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(value);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Filter countries based on search
  const filteredShortlist = useMemo(() => {
    if (!searchText) return SHORTLIST_COUNTRIES;
    return SHORTLIST_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchText.toLowerCase()) ||
      country.dialCode.includes(searchText)
    );
  }, [searchText]);

  const filteredAllCountries = useMemo(() => {
    if (!searchText) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchText.toLowerCase()) ||
      country.dialCode.includes(searchText)
    );
  }, [searchText]);

  // Format phone number according to country format
  const formatPhoneNumber = (number: string, format: string): string => {
    const digits = number.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
      if (format[i] === '#') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }

    return formatted;
  };

  const handlePhoneNumberChange = (text: string): void => {
    const formatted = formatPhoneNumber(text, selectedCountry.format);
    setPhoneNumber(formatted);
    onChangeText?.(formatted);
  };

  const handleCountrySelect = (country: Country): void => {
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchText('');
    onCountryChange?.(country);
  };

  const handleModalClose = (): void => {
    setModalVisible(false);
    setSearchText('');
  };

  const CountryItem: React.FC<CountryItemProps> = ({ item, onPress }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <FlagComponent countryCode={item.code} size={28} />
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.dialCode}>({item.dialCode})</Text>
    </TouchableOpacity>
  );

  const renderCountryItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }
    return <CountryItem item={item} onPress={handleCountrySelect} />;
  };

  const modalData = [
    ...(filteredShortlist.length > 0 ? [{ type: 'header', title: 'Shortlist' }] : []),
    ...filteredShortlist.map(item => ({ ...item, type: 'shortlist' })),
    ...(filteredAllCountries.length > 0 ? [{ type: 'header', title: 'All' }] : []),
    ...filteredAllCountries.map(item => ({ ...item, type: 'all' }))
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      {/* Phone Input Field */}
      <View style={[styles.inputWrapper, disabled && styles.inputWrapperDisabled]}>
        {/* Country Selector */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <FlagComponent countryCode={selectedCountry.code} size={20} />
          <Text style={[styles.selectedDialCode, disabled && styles.textDisabled]}>
            {selectedCountry.dialCode}
          </Text>
          <Text style={[styles.dropdownArrow, disabled && styles.textDisabled]}>▼</Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={[styles.phoneInput, inputStyle, disabled && styles.textDisabled]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray400}
          keyboardType="phone-pad"
          maxLength={20}
          editable={!disabled}
        />
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleModalClose} activeOpacity={0.8}>
              <Text style={styles.backButton}>← Select Country</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title"
              placeholderTextColor={theme.colors.gray400}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Country List */}
          <FlatList
            data={modalData}
            keyExtractor={(item, index) => (item as any).code || `header-${index}`}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
          />

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleModalClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectButton}
              activeOpacity={0.8}
            >
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  inputWrapperDisabled: {
    backgroundColor: theme.colors.gray100,
    opacity: 0.6,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.gray200,
  },
  selectedDialCode: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.gray600,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  phoneInput: {
    flex: 1,
    ...theme.typography.body,
    fontSize: 16,
    paddingLeft: theme.spacing.md,
    color: theme.colors.gray600,
  },
  textDisabled: {
    color: theme.colors.gray400,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  backButton: {
    ...theme.typography.button,
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.gray600,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.gray25,
  },
  sectionHeaderText: {
    ...theme.typography.caption,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  countryName: {
    flex: 1,
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.gray600,
    marginLeft: theme.spacing.sm,
  },
  dialCode: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.gray400,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  cancelButtonText: {
    ...theme.typography.button,
    fontSize: 16,
    color: theme.colors.primary,
  },
  selectButton: {
    flex: 1,
    backgroundColor: theme.colors.gray200,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  selectButtonText: {
    ...theme.typography.button,
    fontSize: 16,
    color: theme.colors.gray400,
    fontWeight: '500',
  },
});

export default PhoneNumberInput;