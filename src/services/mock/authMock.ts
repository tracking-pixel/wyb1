import { UserProfile } from '@/src/types';
import { entitlementService } from '../entitlements';
import { trackingService } from '../tracking';
import { AuthService } from '../auth';

const STORAGE_KEY_USER = 'ligera_user_session_v1';

class AuthServiceImpl implements AuthService {
  private user: UserProfile | null = null;

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        this.user = JSON.parse(raw);
      }
    } catch {
      // ignore
    }
  }

  getCurrentUser(): UserProfile | null {
    if (this.user) return this.user;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        this.user = JSON.parse(raw);
        return this.user;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private saveUser(user: UserProfile | null) {
    this.user = user;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {
      // ignore
    }
  }

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Correo electrónico inválido.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const entitlements = entitlementService.getAll();
    if (!entitlements.includes('base')) {
      entitlementService.grant('base');
    }

    const renewDate = new Date();
    renewDate.setDate(renewDate.getDate() + 90);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: name || 'Amiga',
      createdAt: new Date().toISOString(),
      reminderTime: '08:30',
      units: 'metric',
      entitlements: entitlementService.getAll(),
      subscription: {
        planId: 'm3',
        status: 'active',
        startedAt: new Date().toISOString(),
        renewAt: renewDate.toISOString(),
        renewalPrice: 39.99,
        interval: 'cada 3 meses',
        cardLast4: '4242',
        cardBrand: 'Visa',
      },
    };

    this.saveUser(newUser);

    // Track account_created
    await trackingService.track('account_created', {
      user_id: newUser.id,
      email_domain: email.split('@')[1] || '',
    });

    return { success: true, user: newUser };
  }

  async logIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email || !password) {
      return { success: false, error: 'Por favor completa todos los campos.' };
    }

    let existing = this.getCurrentUser();
    if (!existing || existing.email !== email) {
      // Create a seamless mock session for preview
      const renewDate = new Date();
      renewDate.setDate(renewDate.getDate() + 90);
      existing = {
        id: `usr_demo_${Date.now()}`,
        email,
        name: 'Amiga',
        createdAt: new Date().toISOString(),
        reminderTime: '08:30',
        units: 'metric',
        entitlements: ['base'],
        subscription: {
          planId: 'm3',
          status: 'active',
          startedAt: new Date().toISOString(),
          renewAt: renewDate.toISOString(),
          renewalPrice: 39.99,
          interval: 'cada 3 meses',
          cardLast4: '4242',
          cardBrand: 'Visa',
        },
      };
      entitlementService.grant('base');
    }

    this.saveUser(existing);
    return { success: true, user: existing };
  }

  logOut(): void {
    this.saveUser(null);
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    this.saveUser(updated);
  }

  cancelSubscription(): void {
    const current = this.getCurrentUser();
    if (!current || !current.subscription) return;
    current.subscription.status = 'canceled';
    this.saveUser(current);
  }

  pauseSubscription(days = 30): void {
    const current = this.getCurrentUser();
    if (!current || !current.subscription) return;
    current.subscription.status = 'paused';
    const renew = new Date(current.subscription.renewAt);
    renew.setDate(renew.getDate() + days);
    current.subscription.renewAt = renew.toISOString();
    this.saveUser(current);
  }

  applyDiscount(percent = 30): void {
    const current = this.getCurrentUser();
    if (!current || !current.subscription) return;
    current.subscription.renewalPrice = Number(
      (current.subscription.renewalPrice * (1 - percent / 100)).toFixed(2)
    );
    this.saveUser(current);
  }
}

export const authService = new AuthServiceImpl();
