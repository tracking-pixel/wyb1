import { ProductId } from '@/src/config/funnel.config';
import { EntitlementService } from '../entitlements';

const STORAGE_KEY_ENTITLEMENTS = 'ligera_entitlements_v1';

class EntitlementsServiceImpl implements EntitlementService {
  private getStored(): ProductId[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ENTITLEMENTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  private save(entitlements: ProductId[]) {
    try {
      localStorage.setItem(STORAGE_KEY_ENTITLEMENTS, JSON.stringify(entitlements));
    } catch {
      // ignore
    }
  }

  has(product: ProductId): boolean {
    const list = this.getStored();
    return list.includes(product);
  }

  grant(product: ProductId): void {
    const list = this.getStored();
    if (!list.includes(product)) {
      list.push(product);
      this.save(list);
    }
  }

  revoke(product: ProductId): void {
    const list = this.getStored().filter((p) => p !== product);
    this.save(list);
  }

  getAll(): ProductId[] {
    return this.getStored();
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_ENTITLEMENTS);
    } catch {
      // ignore
    }
  }
}

export const entitlementService = new EntitlementsServiceImpl();
