export type UnitsSystem = 'metric' | 'imperial';

export interface QuizAnswers {
  primary_goal?: string;
  age_range?: string;
  current_body_type?: string;
  target_body_type?: string;
  target_zones?: string[];
  activity_level?: string;
  workout_preference?: string;
  daily_time?: string;
  limitations?: string[];
  last_ideal_weight?: string;
  sleep_hours?: string;
  water_intake?: string;
  energy_level?: string;
  habits?: string[];
  motivating_event?: string;
  motivating_event_date?: string;
  units: UnitsSystem;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  user_name: string;
  training_time_preference?: 'morning' | 'evening' | 'anytime';
  email?: string;
  marketing_opt_in?: boolean;
}

export interface UserSubscription {
  planId: string;
  status: 'active' | 'paused' | 'canceled';
  startedAt: string;
  renewAt: string;
  renewalPrice: number;
  interval: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  reminderTime: string;
  units: UnitsSystem;
  subscription?: UserSubscription;
  entitlements: string[];
}

export interface TrackingPayload {
  [key: string]: any;
}

export interface TrackingEventRecord {
  event_id: string;
  event_name: string;
  timestamp: string;
  payload: TrackingPayload;
}

export interface AttributionParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  _fbp?: string;
  _fbc?: string;
  landing_page: string;
  referrer: string;
  captured_at: string;
}
