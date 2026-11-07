import { ProductId } from '@/src/config/funnel.config';

export interface EntitlementService {
  has(product: ProductId): boolean;
  grant(product: ProductId): void;
  revoke(product: ProductId): void;
  getAll(): ProductId[];
  reset(): void;
}

export { entitlementService } from './mock/entitlementsMock';
