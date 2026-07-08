export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'free' | 'pro' | 'loading' | 'error';

export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  priceMonthly: number; // USD per month
  priceYearly: number;  // USD per year
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  error: string | null;
  subscribe: (tier: SubscriptionTier) => void;
  setTier: (tier: SubscriptionTier) => void;
  clearError: () => void;
}
