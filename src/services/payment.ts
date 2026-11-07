export interface SavedCard {
  last4: string;
  brand: string;
  expiry: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  requires3DS?: boolean;
}

export interface PaymentService {
  purchaseSubscription(planId: string, cardDetails?: { number: string; expiry: string; cvc: string; name: string }): Promise<PurchaseResult>;
  chargeOneClick(offerId: string): Promise<PurchaseResult>;
  getSavedCard(): SavedCard | null;
  setSimulateFailure(fail: boolean): void;
  setSimulate3DS(simulate: boolean): void;
  getSimulateFailure(): boolean;
  getSimulate3DS(): boolean;
}

export { paymentService } from './mock/paymentMock';
