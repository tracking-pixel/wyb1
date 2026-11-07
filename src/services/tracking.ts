import { AttributionParams, TrackingEventRecord, TrackingPayload } from '@/src/types';

export interface TrackingService {
  init(): void;
  getAttribution(): AttributionParams;
  track(eventName: string, payload?: TrackingPayload): Promise<string>;
  getEventsQueue(): TrackingEventRecord[];
  clearQueue(): void;
}

export { trackingService } from './mock/trackingMock';
