import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface TripEndedScreenProps {
  tripFare?: number;
}

export default function TripEndedScreen({
  tripFare = 6.70, // Default fare amount
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

  const handleContinue = () => {
    const tripData = {
      tip: selectedTip,
      driverRating,
      carRating,
      portuguese: { enabled: portugueseEnabled, rating: portugueseRating },
      english: { enabled: englishEnabled, rating: englishRating },
      comment,
      isTrustedDriver,
    };
    
    console.log('Trip ended data:', tripData);
    // Navigate back to dashboard
    router.replace('/(tabs)/dashboard');
  };

  const renderStars = (rating: number, onPress: (rating: number) => void, size: number = 20) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#FFD700' : '#D0D0D0'}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.rateText}>Rate here</Text>
      </View>
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
            <View style={styles.startPin}>
              <Ionicons name="location" size={16} color={theme.colors.blue500} />
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.endPin}>
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            </View>
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
                  <Text style={[
                    styles.tipAmount,
                    selectedTip === tip.amount && styles.tipAmountSelected
                  ]}>
                    {tip.amount === 0 ? 'No Tip' : `€${tip.amount.toFixed(2)}`}
                  </Text>
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
          <View style={styles.section}>
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
            
            <View style={styles.languageItem}>
              <Text style={styles.languageLabel}>Portuguese</Text>
              <View style={styles.languageControls}>
                <Switch
                  value={portugueseEnabled}
                  onValueChange={() => handleLanguageToggle('portuguese')}
                  trackColor={{ false: '#D0D0D0', true: theme.colors.blue500 }}
                  thumbColor={portugueseEnabled ? theme.colors.white : '#F4F3F4'}
                />
                <Text style={styles.switchLabel}>{portugueseEnabled ? 'Yes' : 'No'}</Text>
                {portugueseEnabled && renderStars(portugueseRating, (rating) => handleRating('portuguese', rating))}
              </View>
            </View>

            <View style={styles.languageItem}>
              <Text style={styles.languageLabel}>English</Text>
              <View style={styles.languageControls}>
                <Switch
                  value={englishEnabled}
                  onValueChange={() => handleLanguageToggle('english')}
                  trackColor={{ false: '#D0D0D0', true: theme.colors.blue500 }}
                  thumbColor={englishEnabled ? theme.colors.white : '#F4F3F4'}
                />
                <Text style={styles.switchLabel}>{englishEnabled ? 'Yes' : 'No'}</Text>
                {englishEnabled && renderStars(englishRating, (rating) => handleRating('english', rating))}
              </View>
            </View>
          </View>

          {/* Add to Trusted Drivers Button */}
          <TouchableOpacity
            style={[
              styles.trustedDriverButton,
              isTrustedDriver && styles.trustedDriverButtonSelected
            ]}
            onPress={() => setIsTrustedDriver(!isTrustedDriver)}
          >
            <Ionicons
              name={isTrustedDriver ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.trustedDriverText}>Add to My Trusted Drivers</Text>
          </TouchableOpacity>

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.commentsLabel}>Comments</Text>
            <TextInput
              style={styles.commentsInput}
              placeholder="Enter the comment"
              placeholderTextColor={theme.colors.gray400}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
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
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  completionIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
    marginBottom: 8,
  },
  tipSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tipButtonSelected: {
    backgroundColor: theme.colors.blue500,
    borderColor: theme.colors.blue500,
  },
  tipAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  tipAmountSelected: {
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
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  ratingSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  rateText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  languageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666666',
    minWidth: 30,
  },
  trustedDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue500,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  trustedDriverButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  trustedDriverText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentsLabel: {
    fontSize: 14,
    color: '#666666',
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
    backgroundColor: theme.colors.blue500,
    borderRadius: 12,
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
