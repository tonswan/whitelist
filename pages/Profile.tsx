import React, { useContext } from 'react';
import { AppContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { tg, triggerHaptic } from '../services/telegram';

export const Profile: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const t = TRANSLATIONS[state.language];
  const { user, subscription } = state;

  if (!user) return <div className="p-4 text-center">Loading...</div>;

  const now = Date.now();
  const timeLeft = subscription.expiryDate ? subscription.expiryDate - now : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const isExpiringSoon = subscription.active && daysLeft < 7 && daysLeft > 0;
  const isExpired = subscription.expiryDate !== null && daysLeft <= 0;

  const handleCopyLink = () => {
    triggerHaptic('light');
    const link = `https://t.me/WhiteListVPN_bot?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    tg?.showPopup({
        title: t.copied,
        message: link,
        buttons: [{ type: 'ok' }]
    });
  };

  const handleLanguageChange = (lang: any) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6">
      
      {/* User Info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-2xl font-bold">
          {user.firstName.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.firstName} {user.username ? `(@${user.username})` : ''}</h2>
          <p className="text-sm text-gray-400">{t.yourId}: {user.id}</p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className={`p-5 rounded-xl border ${isExpiringSoon ? 'border-red-500 bg-red-900/10' : 'border-gray-700 bg-gray-800'}`}>
        <h3 className="text-lg font-medium mb-2">{t.activeUntil}</h3>
        {subscription.active && !isExpired ? (
            <div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{daysLeft}</span>
                    <span className="text-gray-400">days</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                    {new Date(subscription.expiryDate!).toLocaleDateString()}
                </p>
                {isExpiringSoon && (
                    <p className="text-red-400 text-sm mt-2 font-bold animate-pulse">
                        ⚠️ {t.warning}
                    </p>
                )}
            </div>
        ) : (
            <div>
                 <p className="text-gray-400">{t.expired}</p>
                 <button 
                    onClick={() => document.getElementById('nav-home')?.click()} 
                    className="mt-3 text-blue-400 text-sm hover:underline"
                 >
                    {t.renew}
                 </button>
            </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
        <span className="text-gray-300">{t.language}</span>
        <LanguageSwitcher current={state.language} onChange={handleLanguageChange} />
      </div>

      {/* Referral System */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h3 className="text-lg font-bold mb-2 text-white">{t.referralLink}</h3>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            {t.inviteText}
        </p>
        
        <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-gray-900 rounded-lg px-3 py-2 text-gray-400 text-sm truncate font-mono">
                https://t.me/WhiteListVPN_bot?start={user.referralCode}
            </div>
            <button 
                onClick={handleCopyLink}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
                {t.copy}
            </button>
        </div>

        <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
            <span className="text-gray-400 text-sm">{t.refCount}</span>
            <span className="text-white font-bold">{user.referredCount}</span>
        </div>
      </div>

    </div>
  );
};
