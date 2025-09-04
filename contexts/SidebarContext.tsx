// contexts/SidebarContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useSidebar } from '../hooks/useSidebar';
import Sidebar from '../components/common/Sidebar';

interface SidebarContextType {
  isVisible: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  userName?: string;
  userImage?: string;
  selectedCountry?: string;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  userName,
  userImage,
  selectedCountry
}) => {
  const sidebarState = useSidebar();

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
      <Sidebar
        visible={sidebarState.isVisible}
        onClose={sidebarState.closeSidebar}
        userName={userName}
        userImage={userImage}
        selectedCountry={selectedCountry}
      />
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};