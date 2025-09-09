// contexts/SidebarContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSidebar } from '../hooks/useSidebar';
import Sidebar from '../components/common/Sidebar';
import LogoutConfirmModal from '../components/common/LogoutConfirmModal';
import useAuthStore from '../store/authStore';

interface SidebarContextType {
  isVisible: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  showLogoutModal: () => void;
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
    sidebarState.closeSidebar(); // Close sidebar when showing logout modal
  };

  const handleConfirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      await signOut();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const contextValue = {
    ...sidebarState,
    showLogoutModal: handleShowLogoutModal,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
      <Sidebar
        visible={sidebarState.isVisible}
        onClose={sidebarState.closeSidebar}
        userName={userName}
        userImage={userImage}
        selectedCountry={selectedCountry}
        onLogout={handleShowLogoutModal}
      />
      <LogoutConfirmModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
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