/**
 * Configuración del embudo post-compra (upsells / downsells / cross-sells).
 * Las ofertas son one-click (con tarjeta ya guardada del checkout).
 */

export type OfferType = 'one_time' | 'recurring';

export type ProductId =
  | 'base'
  | 'meal_plan'
  | 'challenge_28'
  | 'challenge_28_lite'
  | 'face_yoga'
  | 'ai_coach';

export interface FunnelOffer {
  id: string;
  slug: string;
  type: OfferType;
  product: ProductId;
  price: number;
  anchor?: number;
  interval?: 'month' | 'year';
  showIf?: {
    declined?: string; // id de la oferta que debe haber sido rechazada para mostrar esta
    accepted?: string;
  };
  titleKey: string;
  subtitleKey: string;
  badgeKey?: string;
  descriptionKey: string;
  bulletsKeys: string[];
  mockupType: 'meal_plan' | 'challenge_28' | 'challenge_lite' | 'face_yoga' | 'ai_coach';
}

export const funnelConfig: {
  offers: FunnelOffer[];
  totalSteps: number;
} = {
  totalSteps: 5,
  offers: [
    {
      id: 'upsell1',
      slug: 'plan-comidas',
      type: 'one_time',
      product: 'meal_plan',
      price: 14.99,
      anchor: 29.99,
      badgeKey: 'offers.upsell1.badge',
      titleKey: 'offers.upsell1.title',
      subtitleKey: 'offers.upsell1.subtitle',
      descriptionKey: 'offers.upsell1.description',
      bulletsKeys: [
        'offers.upsell1.bullet1',
        'offers.upsell1.bullet2',
        'offers.upsell1.bullet3',
        'offers.upsell1.bullet4',
      ],
      mockupType: 'meal_plan',
    },
    {
      id: 'upsell2',
      slug: 'reto-28-dias',
      type: 'one_time',
      product: 'challenge_28',
      price: 19.99,
      anchor: 39.99,
      badgeKey: 'offers.upsell2.badge',
      titleKey: 'offers.upsell2.title',
      subtitleKey: 'offers.upsell2.subtitle',
      descriptionKey: 'offers.upsell2.description',
      bulletsKeys: [
        'offers.upsell2.bullet1',
        'offers.upsell2.bullet2',
        'offers.upsell2.bullet3',
        'offers.upsell2.bullet4',
      ],
      mockupType: 'challenge_28',
    },
    {
      id: 'downsell',
      slug: 'reto-28-esencial',
      type: 'one_time',
      product: 'challenge_28_lite',
      price: 9.99,
      anchor: 19.99,
      showIf: { declined: 'upsell2' },
      badgeKey: 'offers.downsell.badge',
      titleKey: 'offers.downsell.title',
      subtitleKey: 'offers.downsell.subtitle',
      descriptionKey: 'offers.downsell.description',
      bulletsKeys: [
        'offers.downsell.bullet1',
        'offers.downsell.bullet2',
        'offers.downsell.bullet3',
      ],
      mockupType: 'challenge_lite',
    },
    {
      id: 'crosssell',
      slug: 'yoga-facial',
      type: 'one_time',
      product: 'face_yoga',
      price: 12.99,
      anchor: 24.99,
      badgeKey: 'offers.crosssell.badge',
      titleKey: 'offers.crosssell.title',
      subtitleKey: 'offers.crosssell.subtitle',
      descriptionKey: 'offers.crosssell.description',
      bulletsKeys: [
        'offers.crosssell.bullet1',
        'offers.crosssell.bullet2',
        'offers.crosssell.bullet3',
        'offers.crosssell.bullet4',
      ],
      mockupType: 'face_yoga',
    },
    {
      id: 'upsell4',
      slug: 'coach-ia',
      type: 'recurring',
      product: 'ai_coach',
      price: 7.99,
      interval: 'month',
      badgeKey: 'offers.upsell4.badge',
      titleKey: 'offers.upsell4.title',
      subtitleKey: 'offers.upsell4.subtitle',
      descriptionKey: 'offers.upsell4.description',
      bulletsKeys: [
        'offers.upsell4.bullet1',
        'offers.upsell4.bullet2',
        'offers.upsell4.bullet3',
        'offers.upsell4.bullet4',
      ],
      mockupType: 'ai_coach',
    },
  ],
};
