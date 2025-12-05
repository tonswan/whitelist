import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { PLANS, TRANSLATIONS } from '../constants';
import { PlanCard } from '../components/PlanCard';
import { processPurchase } from '../services/mockDb';
import { Plan } from '../types';
import { tg, triggerHaptic } from '../services/telegram';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const t = TRANSLATIONS[state.language];
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sort plans so trial is first
  const sortedPlans = [...PLANS].sort((a, b) => a.priceStars - b.priceStars);

  const handleBuy = async (plan: Plan) => {
    setIsLoading(true);

    // In a real app, we would:
    // 1. Call backend to create Invoice Link
    // 2. WebApp.openInvoice(link)
    // 3. Listen for transaction status
    
    // Simulating Telegram Stars Payment flow
    if (!plan.isTrial) {
      // Fake delay for "payment processing"
      triggerHaptic('heavy');
    }

    try {
      const result = await processPurchase(plan);
      if (result.success) {
        tg?.HapticFeedback.notificationOccurred('success');
        setState(prev => ({
          ...prev,
          subscription: result.subscription,
          user: prev.user ? { ...prev.user, hasUsedTrial: plan.isTrial ? true : prev.user.hasUsedTrial } : null
        }));
        
        // Navigate to success page/modal (here just passing state to a success view)
        navigate('/success');
      }
    } catch (e) {
      tg?.HapticFeedback.notificationOccurred('error');
      console.error("Payment failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-center shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">whitelist</h1>
            <p className="text-blue-100 text-sm mb-4">Fastest & Secure connection</p>
            <div className="bg-white/10 backdrop-blur-md rounded-lg py-2 px-4 inline-block">
            <p className="text-xs text-blue-200 uppercase tracking-wider">{t.totalUsers}</p>
            <p className="text-xl font-bold text-white">{state.totalUsers.toLocaleString()}</p>
            </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
      </div>

      {/* Plans Grid */}
      <div className="space-y-2">
        {sortedPlans.map(plan => (
          <PlanCard 
            key={plan.id}
            plan={plan}
            language={state.language}
            onBuy={handleBuy}
            isTrialUsed={state.user?.hasUsedTrial || false}
            currentPlanName={state.subscription.planName}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};
