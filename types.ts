export enum Language {
  RU = 'ru',
  EN = 'en',
  ZH = 'zh',
}

export interface Plan {
  id: string;
  durationMonths: number;
  priceStars: number;
  isTrial: boolean;
  name: string;
}

export interface UserProfile {
  id: number;
  username?: string;
  firstName: string;
  referralCode: string;
  referredCount: number;
  hasUsedTrial: boolean;
}

export interface Subscription {
  active: boolean;
  expiryDate: number | null; // Timestamp
  planName?: string;
}

export interface AppState {
  user: UserProfile | null;
  subscription: Subscription;
  language: Language;
  totalUsers: number;
}
