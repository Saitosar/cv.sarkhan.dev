export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'free' | 'pro' | 'loading' | 'error';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number; // USD per month
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
