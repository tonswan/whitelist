import React from 'react';
import { Plan, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { triggerHaptic } from '../services/telegram';

interface PlanCardProps {
  plan: Plan;
  language: Language;
  onBuy: (plan: Plan) => void;
  isTrialUsed: boolean;
  currentPlanName?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  language, 
  onBuy, 
  isTrialUsed,
  currentPlanName 
}) => {
  const t = TRANSLATIONS[language];
  const isBestValue = plan.id === '12m'; // Highlight 1 year plan
  
  const disabled = plan.isTrial && isTrialUsed;

  const handleBuy = () => {
    if (!disabled) {
      triggerHaptic('medium');
      onBuy(plan);
    }
  };

  return (
    <div 
      onClick={handleBuy}
      className={`
        relative overflow-hidden rounded-xl p-4 mb-3 border transition-all duration-200
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed border-gray-700 bg-gray-800' : 'cursor-pointer active:scale-[0.98]'}
        ${isBestValue ? 'border-yellow-500 bg-gradient-to-br from-gray-800 to-gray-900 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-700 bg-gray-800'}
        ${currentPlanName === plan.name ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {isBestValue && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg">
          BEST VALUE
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-gray-400">
            {plan.isTrial ? '7 Days' : `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="text-right">
          {plan.isTrial ? (
            <span className="text-green-400 font-bold text-lg">
              {isTrialUsed ? t.trialUsed : t.free}
            </span>
          ) : (
            <div className="flex items-center gap-1 justify-end">
               <span className="text-yellow-400 font-bold text-xl">{plan.priceStars}</span>
               {/* Star Icon SVG */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
