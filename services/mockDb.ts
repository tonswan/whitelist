// This service mocks the backend interactions requested in the prompt.
// In a real app, this would use fetch() to talk to the Node/Python backend.

import { Plan, Subscription } from '../types';

const STORAGE_KEY_SUB = 'vpn_app_subscription';
const STORAGE_KEY_TRIAL = 'vpn_app_trial_used';

export const getMockTotalUsers = async (): Promise<number> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return a realistic number from "DB"
  return 14502 + Math.floor(Math.random() * 50);
};

export const getStoredSubscription = (): Subscription => {
  const stored = localStorage.getItem(STORAGE_KEY_SUB);
  if (stored) {
    return JSON.parse(stored);
  }
  return { active: false, expiryDate: null };
};

export const getStoredTrialStatus = (): boolean => {
  return localStorage.getItem(STORAGE_KEY_TRIAL) === 'true';
};

export const processPurchase = async (plan: Plan): Promise<{ success: boolean; subscription: Subscription }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      // Calculate new expiry. If active, add to current expiry. If not, add to now.
      const currentSub = getStoredSubscription();
      const basisTime = (currentSub.active && currentSub.expiryDate && currentSub.expiryDate > now) 
        ? currentSub.expiryDate 
        : now;
      
      // Approximate month as 30 days
      const durationMs = plan.durationMonths * 30 * 24 * 60 * 60 * 1000;
      // For trial (0.25 months = 7.5 days approx), let's be precise: 7 days
      const finalDuration = plan.isTrial ? (7 * 24 * 60 * 60 * 1000) : durationMs;

      const newExpiry = basisTime + finalDuration;

      const newSub: Subscription = {
        active: true,
        expiryDate: newExpiry,
        planName: plan.name,
      };

      // Persist mock data
      localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(newSub));
      if (plan.isTrial) {
        localStorage.setItem(STORAGE_KEY_TRIAL, 'true');
      }

      resolve({ success: true, subscription: newSub });
    }, 1500);
  });
};
