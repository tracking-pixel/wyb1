import { create } from 'zustand';
import { UserProfile } from '@/src/types';
import { authService } from '@/src/services/auth';
import { entitlementService } from '@/src/services/entitlements';
import { ProductId } from '@/src/config/funnel.config';

interface UserState {
  user: UserProfile | null;
  entitlements: ProductId[];
  isLoading: boolean;
  refreshUser: () => void;
  setUser: (user: UserProfile | null) => void;
  hasProduct: (product: ProductId) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: authService.getCurrentUser(),
  entitlements: entitlementService.getAll(),
  isLoading: false,

  refreshUser: () => {
    const user = authService.getCurrentUser();
    const entitlements = entitlementService.getAll();
    set({ user, entitlements });
  },

  setUser: (user) => {
    const entitlements = entitlementService.getAll();
    set({ user, entitlements });
  },

  hasProduct: (product) => {
    return entitlementService.has(product);
  },
}));
