// components/splash/CustomSplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import * as SplashScreenExpo from 'expo-splash-screen';

interface CustomSplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: CustomSplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const loadingAnim = new Animated.Value(0);

  useEffect(() => {
    // Hide default Expo splash immediately
    SplashScreenExpo.hideAsync().catch(() => {});

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Infinite loading animation with native driver
    const startLoadingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true, // Can use native driver with transform
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    // Start loading animation after fade in
    const animationTimer = setTimeout(() => {
      startLoadingAnimation();
    }, 500);

    // Auto finish after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.content, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        {/* Replace with your actual logo */}
        <Image 
          source={require('../../assets/images/adaptive-icon.png')} // Change to your logo path
          style={styles.logo} 
        />
        <Text style={styles.title}>XOOSE</Text>
        
        {/* Infinite loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress, 
                { 
                  opacity: fadeAnim,
                  transform: [
                    {
                      scaleX: loadingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }
                  ]
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#003075',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    borderRadius: 20, // Optional rounded corners
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    width: 200,
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%', // Full width, then scale from 0 to 1
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
    transformOrigin: 'left', // Scale from left side
  },
});