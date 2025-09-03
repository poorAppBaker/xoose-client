import React, { useState, createContext, useContext } from 'react';
import * as SplashScreenExpo from 'expo-splash-screen';
import CustomSplashScreen from '@/components/common/CustomSplashScreen';

// Prevent auto-hide of default splash
SplashScreenExpo.preventAutoHideAsync();

interface SplashContextType {
  showSplash: boolean;
  hideSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}

interface SplashProviderProps {
  children: React.ReactNode;
}

export default function SplashProvider({ children }: SplashProviderProps) {
  const [showSplash, setShowSplash] = useState(true);

  const hideSplash = () => {
    setShowSplash(false);
  };

  const contextValue: SplashContextType = {
    showSplash,
    hideSplash,
  };

  if (showSplash) {
    return <CustomSplashScreen onFinish={hideSplash} />;
  }

  return (
    <SplashContext.Provider value={contextValue}>
      {children}
    </SplashContext.Provider>
  );
}