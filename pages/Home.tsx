import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { PLANS, TRANSLATIONS } from '../constants';
import { PlanCard } from '../components/PlanCard';
import { processPurchase } from '../services/mockDb';
import { Plan } from '../types';
import { tg, triggerHaptic } from '../services/telegram';
import { useNavigate } from 'react-router-dom';

// Use relative path so it works both on localhost (via Vite proxy) and Vercel
const API_URL = "/api";

export const Home: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const t = TRANSLATIONS[state.language];
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sort plans so trial is first
  const sortedPlans = [...PLANS].sort((a, b) => a.priceStars - b.priceStars);

  const handleBuy = async (plan: Plan) => {
    setIsLoading(true);

    // CASE 1: Free Trial (Client side / Mock logic)
    if (plan.isTrial) {
      try {
        const result = await processPurchase(plan);
        if (result.success) {
          triggerHaptic('success');
          setState(prev => ({
            ...prev,
            subscription: result.subscription,
            user: prev.user ? { ...prev.user, hasUsedTrial: true } : null
          }));
          navigate('/success');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // CASE 2: Paid Subscription (Telegram Stars)
    triggerHaptic('medium');

    try {
      if (!state.user?.id) throw new Error("User ID not found");

      // 1. Request Invoice Link from Backend
      const response = await fetch(`${API_URL}/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: state.user.id,
          plan_id: plan.id,
          price_stars: plan.priceStars,
          plan_name: plan.name
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to create invoice");
      }
      
      const data = await response.json();
      const invoiceUrl = data.invoice_link;

      if (!invoiceUrl) throw new Error("No invoice link returned");

      // 2. Open Invoice in Telegram
      tg?.openInvoice(invoiceUrl, (status) => {
        setIsLoading(false); // Stop loading spinner when modal closes
        
        if (status === 'paid') {
          tg.HapticFeedback.notificationOccurred('success');
          
          // Optimistically update UI
          const now = Date.now();
          const durationMs = plan.durationMonths * 30 * 24 * 60 * 60 * 1000;
          
          setState(prev => ({
            ...prev,
            subscription: {
              active: true,
              planName: plan.name,
              expiryDate: now + durationMs
            }
          }));
          
          navigate('/success');
        } else if (status === 'cancelled' || status === 'failed') {
           tg.HapticFeedback.notificationOccurred('error');
        }
      });

    } catch (e) {
      console.error("Payment flow error", e);
      tg?.HapticFeedback.notificationOccurred('error');
      tg?.showPopup({
        title: 'Error',
        message: 'Could not initiate payment. Please try again.',
        buttons: [{ type: 'ok' }]
      });
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