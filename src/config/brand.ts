/**
 * Configuración central de marca v2 para Ligera.
 * Paleta sofisticada: Vino #8B1E3F, Durazno #F4A582, Arena #F3E9DC, Crema #FFF9F3, Salvia #8FAF9A, Carbón #2A1E22
 */

export interface BrandConfig {
  name: string;
  tagline: string;
  subtitle: string;
  targetAudience: string;
  supportEmail: string;
  copyrightYear: number;
  currency: {
    symbol: string;
    code: string;
  };
  colors: {
    primary: string; // #8B1E3F (Vino)
    primaryHover: string;
    secondary: string; // #F4A582 (Durazno)
    secondaryLight: string;
    sand: string; // #F3E9DC (Arena)
    cream: string; // #FFF9F3 (Crema)
    sage: string; // #8FAF9A (Verde Salvia)
    charcoal: string; // #2A1E22 (Carbón)
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
  socialProof: {
    userCountPlaceholder: string;
    averageRating: string;
    reviewCountPlaceholder: string;
  };
}

export const brand: BrandConfig = {
  name: 'Ligera',
  tagline: 'Caminata y Pilates en Casa para Mujeres 35+',
  subtitle: 'Muévete a tu ritmo, cuida tus articulaciones y recupera tu ligereza.',
  targetAudience: 'Mujeres 35+ hispanohablantes',
  supportEmail: 'ayuda@ligera-app.com',
  copyrightYear: 2026,
  currency: {
    symbol: '$',
    code: 'USD',
  },
  colors: {
    primary: '#8B1E3F',
    primaryHover: '#6E142F',
    secondary: '#F4A582',
    secondaryLight: '#FFF2EB',
    sand: '#F3E9DC',
    cream: '#FFF9F3',
    sage: '#8FAF9A',
    charcoal: '#2A1E22',
    background: '#F7F2EC',
    surface: '#FFFFFF',
    textPrimary: '#2A1E22',
    textSecondary: '#6B585E',
  },
  socialProof: {
    userCountPlaceholder: '+120.000',
    averageRating: '4.9',
    reviewCountPlaceholder: '14.500+',
  },
};
