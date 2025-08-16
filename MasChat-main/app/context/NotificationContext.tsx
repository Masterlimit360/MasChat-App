import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  showBanner: (message: string) => void;
  hideBanner: () => void;
  bannerVisible: boolean;
  bannerMessage: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  const showBanner = (message: string) => {
    setBannerMessage(message);
    setBannerVisible(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setBannerVisible(false);
    }, 5000);
  };

  const hideBanner = () => {
    setBannerVisible(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        showBanner,
        hideBanner,
        bannerVisible,
        bannerMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Default export to fix warning
export default NotificationProvider; 