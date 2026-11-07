import { plansConfig } from '@/src/config/plans.config';
import { funnelConfig } from '@/src/config/funnel.config';
import { entitlementService } from '../entitlements';
import { trackingService } from '../tracking';
import { PaymentService, PurchaseResult, SavedCard } from '../payment';

const STORAGE_KEY_SAVED_CARD = 'ligera_saved_card_v1';
const STORAGE_KEY_DEV_FAIL = 'ligera_dev_fail_v1';
const STORAGE_KEY_DEV_3DS = 'ligera_dev_3ds_v1';

class PaymentServiceImpl implements PaymentService {
  private simulateFailure = false;
  private simulate3DS = false;

  constructor() {
    try {
      this.simulateFailure = localStorage.getItem(STORAGE_KEY_DEV_FAIL) === 'true';
      this.simulate3DS = localStorage.getItem(STORAGE_KEY_DEV_3DS) === 'true';
    } catch {
      // ignore
    }
  }

  setSimulateFailure(fail: boolean): void {
    this.simulateFailure = fail;
    try {
      localStorage.setItem(STORAGE_KEY_DEV_FAIL, String(fail));
    } catch {
      // ignore
    }
  }

  setSimulate3DS(simulate: boolean): void {
    this.simulate3DS = simulate;
    try {
      localStorage.setItem(STORAGE_KEY_DEV_3DS, String(simulate));
    } catch {
      // ignore
    }
  }

  getSimulateFailure(): boolean {
    return this.simulateFailure;
  }

  getSimulate3DS(): boolean {
    return this.simulate3DS;
  }

  getSavedCard(): SavedCard | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_CARD);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  }

  private saveFakeCard(last4 = '4242', brand = 'Visa', expiry = '12/28') {
    const card: SavedCard = { last4, brand, expiry };
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_CARD, JSON.stringify(card));
    } catch {
      // ignore
    }
  }

  async purchaseSubscription(
    planId: string,
    cardDetails?: { number: string; expiry: string; cvc: string; name: string }
  ): Promise<PurchaseResult> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (this.simulateFailure) {
      return {
        success: false,
        error: 'Tu tarjeta fue declinada en el entorno de prueba. (Simulación activa)',
      };
    }

    if (this.simulate3DS) {
      return {
        success: true,
        requires3DS: true,
        transactionId: `3ds_${Date.now()}`,
      };
    }

    const plan = plansConfig.plans.find((p) => p.id === planId) || plansConfig.plans[1];
    const last4 = cardDetails?.number ? cardDetails.number.replace(/\s+/g, '').slice(-4) : '4242';
    this.saveFakeCard(last4 || '4242');

    // Grant base entitlement
    entitlementService.grant('base');

    const transactionId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Track purchase event in GA4 ecommerce format
    await trackingService.track('purchase', {
      transaction_id: transactionId,
      plan_id: plan.id,
      plan_name: plan.id,
      value: plan.introPrice,
      currency: 'USD',
      is_subscription: true,
      items: [
        {
          item_id: plan.id,
          item_name: `Plan ${plan.durationMonths} Meses`,
          price: plan.introPrice,
          quantity: 1,
        },
      ],
    });

    return {
      success: true,
      transactionId,
    };
  }

  async chargeOneClick(offerId: string): Promise<PurchaseResult> {
    // 1-click charge with existing card
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (this.simulateFailure) {
      return {
        success: false,
        error: 'No se pudo procesar el cobro en 1 clic. (Simulación activa)',
      };
    }

    const offer = funnelConfig.offers.find((o) => o.id === offerId);
    if (!offer) {
      return { success: false, error: 'Oferta no encontrada' };
    }

    // Grant entitlement
    entitlementService.grant(offer.product);

    const transactionId = `txn_oneclick_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Track offer_accept
    await trackingService.track('offer_accept', {
      transaction_id: transactionId,
      offer_id: offer.id,
      product_id: offer.product,
      value: offer.price,
      currency: 'USD',
      type: offer.type,
      items: [
        {
          item_id: offer.id,
          item_name: offer.product,
          price: offer.price,
          quantity: 1,
        },
      ],
    });

    return {
      success: true,
      transactionId,
    };
  }
}

export const paymentService = new PaymentServiceImpl();
