import React, { useState, useEffect, createContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Success } from './pages/Success';
import { AppState, Language, UserProfile, Subscription } from './types';
import { initTelegramApp, getUserFromTelegram, tg } from './services/telegram';
import { getMockTotalUsers, getStoredSubscription, getStoredTrialStatus } from './services/mockDb';
import { TRANSLATIONS } from './constants';

// Initial State
const initialState: AppState = {
  user: null,
  subscription: { active: false, expiryDate: null },
  language: Language.EN, // Default
  totalUsers: 0,
};

// Context Definition
interface AppContextProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const AppContext = createContext<AppContextProps>({
  state: initialState,
  setState: () => {},
});

// Bottom Navigation Component
const BottomNav = ({ lang }: { lang: Language }) => {
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const activeClass = "text-blue-400";
  const inactiveClass = "text-gray-500";

  // Hide nav on Success page
  if (location.pathname === '/success') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe pt-2 px-6 flex justify-around items-center h-[60px] z-40">
      <Link to="/" id="nav-home" className={`flex flex-col items-center ${location.pathname === '/' ? activeClass : inactiveClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1 font-medium">{t.home}</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? activeClass : inactiveClass}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs mt-1 font-medium">{t.profile}</span>
      </Link>
    </div>
  );
};

const AppContent: React.FC = () => {
    const { state } = React.useContext(AppContext);

    return (
        <div className="min-h-screen bg-[#17212b] text-white font-sans selection:bg-blue-500/30">
            <div className="relative z-0">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/success" element={<Success />} />
                </Routes>
            </div>
            <BottomNav lang={state.language} />
        </div>
    );
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramApp();

    const user = getUserFromTelegram();
    const storedSub = getStoredSubscription();
    const trialUsed = getStoredTrialStatus();

    // Check language from Telegram or default to EN
    let initLang = Language.EN;
    if (tg?.initDataUnsafe?.user?.language_code) {
      const code = tg.initDataUnsafe.user.language_code;
      if (code === 'ru') initLang = Language.RU;
      if (code === 'zh') initLang = Language.ZH;
    }

    // Load data
    const loadData = async () => {
      const totalUsers = await getMockTotalUsers();
      
      setState(prev => ({
        ...prev,
        user: { ...user, hasUsedTrial: trialUsed },
        subscription: storedSub,
        language: initLang,
        totalUsers,
      }));
    };

    loadData();

    // Listen to theme changes from Telegram
    if (tg) {
        tg.setHeaderColor?.(tg.themeParams.bg_color || '#17212b');
        tg.setBackgroundColor?.(tg.themeParams.bg_color || '#17212b');
    }

  }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      <HashRouter>
         <AppContent />
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
