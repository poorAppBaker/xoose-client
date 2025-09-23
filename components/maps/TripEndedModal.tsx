import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rating } from 'react-native-elements';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Input from '@/components/common/Input';
import reviewService from '../../services/reviewService';
import auth from '@react-native-firebase/auth';

interface TripEndedScreenProps {
  tripFare?: number;
  driverId?: string;
  bookingId?: string;
}

export default function TripEndedScreen({
  tripFare = 6.70, // Default fare amount
  driverId,
  bookingId,
}: TripEndedScreenProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [driverRating, setDriverRating] = useState(0);
  const [carRating, setCarRating] = useState(0);
  const [portugueseEnabled, setPortugueseEnabled] = useState(false);
  const [portugueseRating, setPortugueseRating] = useState(0);
  const [englishEnabled, setEnglishEnabled] = useState(false);
  const [englishRating, setEnglishRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isTrustedDriver, setIsTrustedDriver] = useState(false);

  const tipOptions = [
    { amount: tripFare * 1.20, percentage: '20%' },
    { amount: tripFare * 1.15, percentage: '15%' },
    { amount: tripFare * 1.10, percentage: '10%' },
    { amount: tripFare * 1.05, percentage: '5%' },
    { amount: 0, percentage: 'No Tip' },
  ];

  const handleTipSelect = (amount: number) => {
    setSelectedTip(amount);
  };

  const handleRating = (type: 'driver' | 'car' | 'portuguese' | 'english', rating: number) => {
    switch (type) {
      case 'driver':
        setDriverRating(rating);
        break;
      case 'car':
        setCarRating(rating);
        break;
      case 'portuguese':
        setPortugueseRating(rating);
        break;
      case 'english':
        setEnglishRating(rating);
        break;
    }
  };

  const handleLanguageToggle = (language: 'portuguese' | 'english') => {
    if (language === 'portuguese') {
      setPortugueseEnabled(!portugueseEnabled);
      if (!portugueseEnabled) {
        setPortugueseRating(0);
      }
    } else {
      setEnglishEnabled(!englishEnabled);
      if (!englishEnabled) {
        setEnglishRating(0);
      }
    }
  };

  const handleContinue = async () => {
    try {
      // Get current user
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Get client ID from user
      const clientId = currentUser.uid;

      // Validate required data
      if (!driverId) {
        Alert.alert('Error', 'Driver ID is required');
        return;
      }

      const reviewData = {
        driverId,
        clientId,
        bookingId: bookingId || null,
        tip: selectedTip,
        driverRating,
        carRating,
        portuguese: { enabled: portugueseEnabled, rating: portugueseRating },
        english: { enabled: englishEnabled, rating: englishRating },
        comment,
        isTrustedDriver,
      };

      console.log('Saving review data:', reviewData);

      // Save review to Firebase
      await reviewService.createReview(reviewData);
      
      console.log('Review saved successfully');
      
      // Navigate to trip history screen
      router.push('/trip-history');
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert('Error', 'Failed to save review. Please try again.');
    }
  };

  const renderStars = (rating: number, onPress: (rating: number) => void, size: number = 24) => {
    return (
      <Rating
        type="star"
        ratingCount={5}
        imageSize={size}
        startingValue={rating}
        readonly={false}
        onFinishRating={onPress}
        ratingColor="#FFFF00"
        ratingBackgroundColor="#FFFF00"
        style={styles.ratingComponent}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your trip has ended</Text>
      </View>

      {/* Trip Completion Indicator */}
      <View style={styles.completionIndicator}>
        <View style={styles.routeLine}>
          <Image source={require('../../assets/images/icons/location-confirm.png')} style={styles.locationConfirmIcon} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tipping Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care to tip the driver?</Text>
          <Text style={styles.tipSubtitle}>The tip amount is 100% delivered to the driver</Text>

          <View style={styles.tipOptions}>
            {tipOptions.map((tip, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tipButton,
                  selectedTip === tip.amount && styles.tipButtonSelected
                ]}
                onPress={() => handleTipSelect(tip.amount)}
              >
                {tip.amount === 0 ? (
                  <View style={styles.tipAmountContainer}>
                    <Text style={[
                      styles.tipAmount,
                      selectedTip === tip.amount && styles.tipAmountSelected
                    ]}>
                      No Tip
                    </Text>
                  </View>
                ) : (
                  <View style={styles.tipAmountContainer}>
                    <Text style={[
                      styles.tipAmount,
                      selectedTip === tip.amount && styles.tipAmountSelected
                    ]}>
                      €{Math.floor(tip.amount)}
                    </Text>
                    <Text style={[
                      styles.tipAmountDecimal,
                      selectedTip === tip.amount && styles.tipAmountDecimalSelected
                    ]}>
                      .{tip.amount.toFixed(2).split('.')[1]}
                    </Text>
                  </View>
                )}
                {tip.percentage !== 'No Tip' && (
                  <Text style={[
                    styles.tipPercentage,
                    selectedTip === tip.amount && styles.tipPercentageSelected
                  ]}>
                    {tip.percentage}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trip Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Please rate your trip</Text>

          <View style={styles.ratingItem}>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingLabel}>Driver</Text>
              <Text style={styles.ratingSubtext}>Sympathy, professionalism</Text>
            </View>
            {renderStars(driverRating, (rating) => handleRating('driver', rating))}
          </View>

          <View style={styles.ratingItem}>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingLabel}>Car</Text>
              <Text style={styles.ratingSubtext}>Cleanliness, maintenance</Text>
            </View>
            {renderStars(carRating, (rating) => handleRating('car', rating))}
          </View>
        </View>

        {/* Driver's Languages Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Please rate the driver's languages:</Text>
          <View style={styles.languageSection}>
            <View style={styles.languageItem}>
              <Text style={styles.languageLabel}>Portuguese</Text>
              <View style={styles.languageControls}>
                <TouchableOpacity
                  style={[
                    styles.customSwitch,
                    portugueseEnabled && styles.customSwitchActive
                  ]}
                  onPress={() => handleLanguageToggle('portuguese')}
                >
                  <View style={[
                    styles.switchThumb,
                    portugueseEnabled && styles.switchThumbActive
                  ]} />
                  <Text style={[
                    styles.switchText,
                    portugueseEnabled && styles.switchTextActive
                  ]}>
                    {portugueseEnabled ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
              {renderStars(portugueseRating, (rating) => handleRating('portuguese', rating))}
            </View>

            <View style={styles.languageItem}>
              <Text style={styles.languageLabel}>English</Text>
              <View style={styles.languageControls}>
                <TouchableOpacity
                  style={[
                    styles.customSwitch,
                    englishEnabled && styles.customSwitchActive
                  ]}
                  onPress={() => handleLanguageToggle('english')}
                >
                  <View style={[
                    styles.switchThumb,
                    englishEnabled && styles.switchThumbActive
                  ]} />
                  <Text style={[
                    styles.switchText,
                    englishEnabled && styles.switchTextActive
                  ]}>
                    {englishEnabled ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
              {renderStars(englishRating, (rating) => handleRating('english', rating))}
            </View>
          </View>
        </View>

        {/* Add to Trusted Drivers Button */}
        <View style={styles.trustedDriverSection}>
          <TouchableOpacity
            style={[
              styles.trustedDriverButton,
              isTrustedDriver && styles.trustedDriverButtonSelected
            ]}
            onPress={() => setIsTrustedDriver(!isTrustedDriver)}
          >
            <Image source={require('../../assets/images/icons/subtrack-blue.png')} style={styles.checkmarkCircleIcon} />
            <Text style={styles.trustedDriverText}>Add to My Trusted Drivers</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.comentSection}>
          <Input 
            label='Comments'
            height={48}
            value={comment}
            onChangeText={setComment}
            placeholder='Enter the comment'
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!driverRating || !carRating) && styles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={!driverRating || !carRating}
      >
        <Text style={[
          styles.continueButtonText,
          (!driverRating || !carRating) && styles.continueButtonTextDisabled
        ]}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.spacing.xl,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray800,
  },
  completionIndicator: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationConfirmIcon: {
    width: 70,
    height: 70,
  },
  startPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.blue500,
    marginHorizontal: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.blue500,
  },
  endPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.sm + 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.blue500,
  },
  tipSubtitle: {
    fontSize: 12,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.sm + 2,
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tipButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tipButtonSelected: {
    backgroundColor: theme.colors.blue500,
    borderColor: theme.colors.blue500,
  },
  tipAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray800,
  },
  tipAmountSelected: {
    color: '#FFFFFF',
  },
  tipAmountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipAmountDecimal: {
    fontSize: 8,
    fontWeight: '600',
    color: theme.colors.gray800,
  },
  tipAmountDecimalSelected: {
    color: '#FFFFFF',
  },
  tipPercentage: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  tipPercentageSelected: {
    color: '#FFFFFF',
  },
  ratingSection: {
    marginBottom: theme.spacing.sm + 6,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm + 4,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.gray800,
  },
  ratingSubtext: {
    fontSize: 12,
    color: theme.colors.gray800,
  },
  ratingComponent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  languageSection: {
    marginTop: theme.spacing.sm - 2,
    paddingBottom: theme.spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.sm + 4,
  },
  languageLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.gray800,
  },
  languageControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customSwitch: {
    width: 45,
    height: 19,
    backgroundColor: '#D0D0D0',
    borderRadius: 15,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  customSwitchActive: {
    backgroundColor: theme.colors.blue500,
  },
  switchThumb: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 30 }],
  },
  switchText: {
    position: 'absolute',
    right: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  switchTextActive: {
    left: 8,
    right: 'auto',
    color: '#FFFFFF',
  },
  trustedDriverSection: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
    paddingBottom: theme.spacing.md,
  },
  trustedDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: 20,
    marginTop: 2,
    gap: 8,
  },
  trustedDriverButtonSelected: {
  },
  checkmarkCircleIcon: {
    width: 15,
    height: 18,
  },
  trustedDriverText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.blue500,
  },
  comentSection: {
    marginTop: theme.spacing.md + 6,
  },
  commentsLabel: {
    fontSize: 16,
    color: theme.colors.gray800,
    marginBottom: 8,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  continueButton: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.blue500,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#A0A0A0',
  },
});
