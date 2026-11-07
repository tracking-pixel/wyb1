import { UserProfile } from '@/src/types';

export interface AuthService {
  getCurrentUser(): UserProfile | null;
  signUp(email: string, password: string, name?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logIn(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logOut(): void;
  updateProfile(updates: Partial<UserProfile>): void;
  cancelSubscription(): void;
  pauseSubscription(days?: number): void;
  applyDiscount(percent?: number): void;
}

export { authService } from './mock/authMock';
