import { UserProfile } from '../types';

// Mock type for the Telegram WebApp object
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
        };
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        openLink: (url: string) => void;
        showPopup: (params: { title?: string; message: string; buttons?: { id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }[] }, callback?: (buttonId: string) => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export const initTelegramApp = () => {
  if (tg) {
    tg.ready();
    tg.expand();
  }
};

export const getUserFromTelegram = (): UserProfile => {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const u = tg.initDataUnsafe.user;
    return {
      id: u.id,
      username: u.username,
      firstName: u.first_name,
      referralCode: `ref_${u.id}`,
      referredCount: 0, // In real app, fetch from DB
      hasUsedTrial: false, // In real app, fetch from DB
    };
  }
  // Fallback for development outside Telegram
  return {
    id: 123456789,
    username: 'dev_user',
    firstName: 'Developer',
    referralCode: 'ref_dev',
    referredCount: 2,
    hasUsedTrial: false,
  };
};

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
  if (tg && tg.HapticFeedback) {
    if (style === 'success' || style === 'error' || style === 'warning') {
        tg.HapticFeedback.notificationOccurred(style);
    } else {
        tg.HapticFeedback.impactOccurred(style);
    }
  }
};