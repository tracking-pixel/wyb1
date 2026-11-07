/**
 * Configuración de planes y suscripciones para el Paywall.
 * Todos los precios y condiciones editables aquí.
 */

export interface Plan {
  id: string;
  nameKey: string;
  durationMonths: number;
  durationDays: number;
  introPrice: number;
  regularPrice: number;
  renewalPrice: number;
  renewalIntervalKey: string;
  badgeKey?: string;
  isPopular?: boolean;
  featuresKeys: string[];
}

export interface PlansConfig {
  discountDurationMinutes: number;
  guaranteeDays: number;
  plans: Plan[];
  defaultPlanId: string;
  faqKeys: { questionKey: string; answerKey: string }[];
  testimonialsPlaceholder: {
    name: string;
    age: number;
    location: string;
    quoteKey: string;
    weightLoss: string;
    duration: string;
    avatarUrl?: string;
  }[];
}

export const plansConfig: PlansConfig = {
  discountDurationMinutes: 10,
  guaranteeDays: 30,
  defaultPlanId: 'm3',
  plans: [
    {
      id: 'm1',
      nameKey: 'plans.m1.name',
      durationMonths: 1,
      durationDays: 30,
      introPrice: 9.99,
      regularPrice: 19.99,
      renewalPrice: 19.99,
      renewalIntervalKey: 'plans.intervals.month',
      featuresKeys: [
        'plans.features.daily_routine',
        'plans.features.joint_friendly',
        'plans.features.progress_tracking',
      ],
    },
    {
      id: 'm3',
      nameKey: 'plans.m3.name',
      durationMonths: 3,
      durationDays: 90,
      introPrice: 24.99,
      regularPrice: 39.99,
      renewalPrice: 39.99,
      renewalIntervalKey: 'plans.intervals.three_months',
      badgeKey: 'plans.badges.most_popular',
      isPopular: true,
      featuresKeys: [
        'plans.features.daily_routine',
        'plans.features.joint_friendly',
        'plans.features.progress_tracking',
        'plans.features.wall_pilates',
        'plans.features.priority_updates',
      ],
    },
    {
      id: 'm6',
      nameKey: 'plans.m6.name',
      durationMonths: 6,
      durationDays: 180,
      introPrice: 39.99,
      regularPrice: 59.99,
      renewalPrice: 59.99,
      renewalIntervalKey: 'plans.intervals.six_months',
      badgeKey: 'plans.badges.best_value',
      featuresKeys: [
        'plans.features.daily_routine',
        'plans.features.joint_friendly',
        'plans.features.progress_tracking',
        'plans.features.wall_pilates',
        'plans.features.priority_updates',
        'plans.features.vip_guide',
      ],
    },
  ],
  faqKeys: [
    {
      questionKey: 'plans.faq.q1',
      answerKey: 'plans.faq.a1',
    },
    {
      questionKey: 'plans.faq.q2',
      answerKey: 'plans.faq.a2',
    },
    {
      questionKey: 'plans.faq.q3',
      answerKey: 'plans.faq.a3',
    },
    {
      questionKey: 'plans.faq.q4',
      answerKey: 'plans.faq.a4',
    },
  ],
  testimonialsPlaceholder: [
    {
      name: 'Carmen R.',
      age: 48,
      location: 'Madrid, España',
      quoteKey: 'plans.testimonials.carmen',
      weightLoss: '-6.5 kg',
      duration: '8 semanas',
    },
    {
      name: 'Mariana G.',
      age: 42,
      location: 'Monterrey, México',
      quoteKey: 'plans.testimonials.mariana',
      weightLoss: '-8.2 kg',
      duration: '10 semanas',
    },
    {
      name: 'Patricia V.',
      age: 53,
      location: 'Miami, EE. UU.',
      quoteKey: 'plans.testimonials.patricia',
      weightLoss: '-5.1 kg',
      duration: '6 semanas',
    },
  ],
};
