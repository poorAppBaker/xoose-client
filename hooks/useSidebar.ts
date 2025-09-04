// hooks/useSidebar.ts
import { useState, useCallback } from 'react';

export const useSidebar = () => {
  const [isVisible, setIsVisible] = useState(false);

  const openSidebar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
};