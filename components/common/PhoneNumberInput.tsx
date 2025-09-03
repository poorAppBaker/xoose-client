import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';

// Get country data from react-native-country-flag package
// This would typically come from a country data package like 'world-countries' or similar
// For now, keeping a comprehensive list but this should be replaced with package data
const COUNTRIES = [
  // Shortlist countries
  { name: 'Portugal', code: 'PT', dialCode: '+351', format: '### ### ###' },
  { name: 'Spain', code: 'ES', dialCode: '+34', format: '### ### ###' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', format: '#### ### ####' },
  { name: 'United States', code: 'US', dialCode: '+1', format: '(###) ###-####' },
  { name: 'France', code: 'FR', dialCode: '+33', format: '## ## ## ## ##' },
  { name: 'Germany', code: 'DE', dialCode: '+49', format: '#### #######' },
  { name: 'Italy', code: 'IT', dialCode: '+39', format: '### ### ####' },

  // All countries (alphabetical)
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

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  format: string;
}

type BasePhoneInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;

interface PhoneNumberInputProps extends BasePhoneInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  onChangeText?: (fullPhoneNumber: string, nationalNumber: string, country: Country) => void;
  defaultCountry?: string;
  style?: ViewStyle;
  loading?: boolean;
}

interface FlagComponentProps {
  countryCode: string;
  size?: number;
}

interface CountryItemProps {
  item: Country;
  onPress: (country: Country) => void;
  isSelected: boolean;
}

const FlagComponent: React.FC<FlagComponentProps> = ({ countryCode, size = 32 }) => {
  return (
    <CountryFlag
      isoCode={countryCode.toLowerCase()}
      size={size}
      style={{
        borderRadius: 100,
        width: size,
      }}
    />
  );
};

// Parse full phone number to extract country and national number
const parsePhoneNumber = (fullNumber: string, countries: Country[]) => {
  if (!fullNumber.startsWith('+')) {
    return null;
  }

  // Sort countries by dial code length (longest first) for better matching
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const country of sortedCountries) {
    if (fullNumber.startsWith(country.dialCode)) {
      const nationalNumber = fullNumber.substring(country.dialCode.length);
      return { country, nationalNumber };
    }
  }

  return null;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  error,
  required = false,
  value = '',
  placeholder,
  onChangeText,
  defaultCountry = 'PT',
  style,
  loading = false,
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(country => country.code === defaultCountry) || COUNTRIES[0]
  );
  const [nationalNumber, setNationalNumber] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Add temporary selection state for the modal
  const [tempSelectedCountry, setTempSelectedCountry] = useState<Country | null>(null);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value, COUNTRIES);
      if (parsed) {
        setSelectedCountry(parsed.country);
        setNationalNumber(parsed.nationalNumber);
      } else if (!value.startsWith('+')) {
        // If value doesn't start with +, treat as national number
        setNationalNumber(value);
      }
    }
  }, [value]);

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

  // Get formatted national number for display
  const formattedNationalNumber = useMemo(() => {
    return formatPhoneNumber(nationalNumber, selectedCountry.format);
  }, [nationalNumber, selectedCountry.format]);

  // Get full phone number (dial code + national number)
  const fullPhoneNumber = useMemo(() => {
    const cleanNational = nationalNumber.replace(/\D/g, '');
    return cleanNational ? `${selectedCountry.dialCode}${cleanNational}` : '';
  }, [selectedCountry.dialCode, nationalNumber]);

  const handlePhoneNumberChange = (text: string): void => {
    // Remove all non-digits for storage, but allow formatting characters for display
    const digitsOnly = text.replace(/\D/g, '');
    setNationalNumber(digitsOnly);

    // Call callback with full phone number
    const fullNumber = digitsOnly ? `${selectedCountry.dialCode}${digitsOnly}` : '';
    onChangeText?.(fullNumber, digitsOnly, selectedCountry);
  };

  // Handle temporary country selection in modal
  const handleCountryItemPress = useCallback((country: Country) => {
    setTempSelectedCountry(country);
  }, []);

  // Apply the temporary selection when "Select" button is pressed
  const handleConfirmSelection = useCallback(() => {
    if (tempSelectedCountry) {
      setSelectedCountry(tempSelectedCountry);

      // Reformat existing number with new country format and update callback
      const fullNumber = nationalNumber ? `${tempSelectedCountry.dialCode}${nationalNumber}` : '';
      onChangeText?.(fullNumber, nationalNumber, tempSelectedCountry);
    }

    setModalVisible(false);
    setSearchText('');
    setTempSelectedCountry(null);
  }, [tempSelectedCountry, nationalNumber, onChangeText]);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setSearchText('');
    setTempSelectedCountry(null);
  }, []);

  const handleCountryPress = () => {
    if (!loading) {
      // Initialize temp selection with current country when opening modal
      setTempSelectedCountry(selectedCountry);
      setModalVisible(true);
    }
  };

  const getPlaceholderText = () => {
    if (placeholder) {
      return placeholder;
    }
    return t('components_common_phoneinput.placeholder') || 'Phone number';
  };

  const CountryItem: React.FC<CountryItemProps> = ({ item, onPress, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        isSelected && styles.countryItemSelected
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <FlagComponent countryCode={item.code} size={20} />
      <Text style={[
        styles.countryName,
        isSelected && styles.countryNameSelected
      ]}>
        {item.name}
      </Text>
      <Text style={[
        styles.dialCode,
        isSelected && styles.dialCodeSelected
      ]}>
        ({item.dialCode})
      </Text>
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

    const isSelected = tempSelectedCountry?.code === item.code;

    return (
      <CountryItem
        item={item}
        onPress={handleCountryItemPress}
        isSelected={isSelected}
      />
    );
  };

  const modalData = [
    ...(filteredShortlist.length > 0 ? [{ type: 'header', title: 'Shortlist' }] : []),
    ...filteredShortlist.map(item => ({ ...item, type: 'shortlist' })),
    ...(filteredAllCountries.length > 0 ? [{ type: 'header', title: 'All' }] : []),
    ...filteredAllCountries.map(item => ({ ...item, type: 'all' }))
  ];

  const CountryPickerModal = useMemo(() => {
    if (!modalVisible) return null;

    return (
      <Modal
        visible={modalVisible}
        onClose={handleModalClose}
        maxHeight={'90%'}
        containerStyle={{ gap: theme.spacing.md }}
      >
        {/* Header */}
        <ContentHeader title="Select Country" />

        {/* Search Input */}
        <Input
          leftIcon={<Ionicons name="search" size={24} color={theme.colors.gray500} />}
          placeholder='Search by title'
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Country List */}
        <View style={styles.listContainer}>
          <FlatList
            data={modalData}
            keyExtractor={(item, index) => (item as any).code || `header-${index}`}
            renderItem={renderCountryItem}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.modalBottom}>
          <Button variant="outline" title="Cancel" onPress={handleModalClose} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title="Select"
              onPress={handleConfirmSelection}
              disabled={!tempSelectedCountry}
            />
          </View>
        </View>
      </Modal>
    );
  }, [modalVisible, modalData, searchText, tempSelectedCountry, handleModalClose, handleConfirmSelection, theme]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelBorderOverlay} />
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        loading && styles.inputContainerDisabled,
      ]}>
        {/* Country Selector (Left Icon) */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={handleCountryPress}
          disabled={loading}
          activeOpacity={0.8}
        >
          <FlagComponent countryCode={selectedCountry.code} size={32} />
          <Ionicons
            name="chevron-down"
            size={20}
            color={loading ? theme.colors.gray300 : theme.colors.gray500}
          />
          <Text style={[styles.selectedDialCode, loading && styles.textDisabled]}>
            {selectedCountry.dialCode}
          </Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          style={[styles.phoneInput, loading && styles.textDisabled]}
          value={formattedNationalNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={getPlaceholderText()}
          placeholderTextColor={theme.colors.gray300}
          keyboardType="phone-pad"
          maxLength={20}
          editable={!loading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Country Selection Modal */}
      {CountryPickerModal}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 18,
    top: -8,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: theme.colors.gray500,
    paddingHorizontal: 2,
    fontWeight: '700',
  },
  labelBorderOverlay: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    top: 8,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: 1000,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: theme.colors.gray500,
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.gray50,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectedDialCode: {
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
  },
  phoneInput: {
    flex: 1,
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  textDisabled: {
    color: theme.colors.gray400,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // Modal styles
  searchContainer: {
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
    marginLeft: theme.spacing.sm,
  },
  listContainer: {
    maxHeight: 400, // Constrain height so it doesn't overflow
  },
  flatList: {
  },
  flatListContent: {
    paddingBottom: theme.spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  sectionHeaderText: {
    ...theme.typography.caption,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray800,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius?.md || 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countryItemSelected: {
    borderColor: theme.colors.blue500,
  },
  countryName: {
    fontSize: 16,
    color: theme.colors.gray800,
  },
  countryNameSelected: {
    color: theme.colors.blue500,
  },
  dialCode: {
    fontSize: 16,
    color: theme.colors.gray800,
  },
  dialCodeSelected: {
    color: theme.colors.blue500,
  },
  modalBottom: {
    flexDirection: 'row',
  },
});

export default PhoneNumberInput;