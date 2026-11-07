import { AttributionParams, TrackingEventRecord, TrackingPayload } from '@/src/types';
import { TrackingService } from '../tracking';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

const STORAGE_KEY_ATTRIBUTION = 'ligera_attribution_v1';
const STORAGE_KEY_EVENTS = 'ligera_tracking_events_v1';

export async function hashSha256(value: string): Promise<string> {
  try {
    const clean = value.trim().toLowerCase();
    if (!clean) return '';
    const msgBuffer = new TextEncoder().encode(clean);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'sha256_mock_' + btoa(value).slice(0, 16);
  }
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class TrackingServiceImpl implements TrackingService {
  private attribution: AttributionParams | null = null;

  init(): void {
    if (typeof window === 'undefined') return;

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    this.getAttribution();
  }

  getAttribution(): AttributionParams {
    if (this.attribution) return this.attribution;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ATTRIBUTION);
      if (stored) {
        this.attribution = JSON.parse(stored);
        return this.attribution!;
      }
    } catch {
      // ignore
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid') || undefined;
    const gclid = urlParams.get('gclid') || undefined;
    const ttclid = urlParams.get('ttclid') || undefined;

    // Generate or retrieve _fbp
    let _fbp: string | undefined;
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === '_fbp') _fbp = v;
    }
    if (!_fbp) {
      _fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1000000000)}`;
    }

    // Generate _fbc if fbclid present
    let _fbc: string | undefined;
    if (fbclid) {
      _fbc = `fb.1.${Date.now()}.${fbclid}`;
    }

    const attribution: AttributionParams = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      fbclid,
      gclid,
      ttclid,
      _fbp,
      _fbc,
      landing_page: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      captured_at: new Date().toISOString(),
    };

    this.attribution = attribution;
    try {
      localStorage.setItem(STORAGE_KEY_ATTRIBUTION, JSON.stringify(attribution));
    } catch {
      // ignore
    }

    return attribution;
  }

  async track(eventName: string, payload: TrackingPayload = {}): Promise<string> {
    const event_id = generateUUID();
    const timestamp = new Date().toISOString();
    const attribution = this.getAttribution();

    let finalPayload: Record<string, any> = {
      ...payload,
      event_id,
      timestamp,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      attribution,
    };

    // Specific formatting for lead event
    if (eventName === 'lead' && payload.email) {
      const emailHash = await hashSha256(payload.email);
      finalPayload.email_hash = emailHash;
      // Do not log raw plaintext email in telemetry
      finalPayload.email_domain = payload.email.split('@')[1] || '';
    }

    // GA4 Ecommerce format for purchase and offer_accept
    if (eventName === 'purchase' || eventName === 'offer_accept') {
      const transactionId = payload.transaction_id || `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      finalPayload.transaction_id = transactionId;
      finalPayload.ecommerce = {
        transaction_id: transactionId,
        value: payload.value,
        currency: payload.currency || 'USD',
        items: payload.items || [
          {
            item_id: payload.plan_id || payload.offer_id,
            item_name: payload.plan_name || payload.offer_name || payload.product_id,
            price: payload.value,
            quantity: 1,
          },
        ],
      };
    }

    // Push to window.dataLayer
    if (typeof window !== 'undefined') {
      if (!window.dataLayer) window.dataLayer = [];
      window.dataLayer.push({
        event: eventName,
        ...finalPayload,
      });

      // Dispatch browser custom event for UI debug listener
      window.dispatchEvent(
        new CustomEvent('ligera_track_event', {
          detail: { event_id, event_name: eventName, timestamp, payload: finalPayload },
        })
      );
    }

    // Save to localStorage queue for future Meta CAPI / server-side sync
    this.enqueueEvent({
      event_id,
      event_name: eventName,
      timestamp,
      payload: finalPayload,
    });

    return event_id;
  }

  private enqueueEvent(record: TrackingEventRecord) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      const queue: TrackingEventRecord[] = stored ? JSON.parse(stored) : [];
      queue.unshift(record);
      // Keep last 100 events
      if (queue.length > 100) queue.length = 100;
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(queue));
    } catch {
      // ignore
    }
  }

  getEventsQueue(): TrackingEventRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearQueue(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_EVENTS);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ligera_track_event_cleared'));
      }
    } catch {
      // ignore
    }
  }
}

export const trackingService = new TrackingServiceImpl();
