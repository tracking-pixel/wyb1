import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { funnelConfig, FunnelOffer } from '@/src/config/funnel.config';
import { paymentService } from '@/src/services/payment';
import { trackingService } from '@/src/services/tracking';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { brand } from '@/src/config/brand';

const STORAGE_KEY_OFFERS_HISTORY = 'ligera_offers_history_v1';

interface OffersHistory {
  accepted: string[];
  declined: string[];
}

function getOffersHistory(): OffersHistory {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_OFFERS_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { accepted: [], declined: [] };
}

function saveOffersHistory(history: OffersHistory) {
  try {
    sessionStorage.setItem(STORAGE_KEY_OFFERS_HISTORY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export const OfferPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers } = useQuizStore();

  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<OffersHistory>(getOffersHistory());

  const currentOffer: FunnelOffer | undefined = funnelConfig.offers.find(
    (o) => o.slug === slug
  );

  useEffect(() => {
    if (!currentOffer) {
      navigate('/crear-cuenta', { replace: true });
      return;
    }

    // Check if downsell should be shown
    if (currentOffer.showIf?.declined) {
      const requiredDeclined = currentOffer.showIf.declined;
      if (!history.declined.includes(requiredDeclined)) {
        // Skip downsell since upsell2 wasn't declined
        const nextOffer = getNextOffer(currentOffer.id, history);
        if (nextOffer) {
          navigate(`/oferta/${nextOffer.slug}`, { replace: true });
        } else {
          navigate('/crear-cuenta', { replace: true });
        }
        return;
      }
    }

    // Check if already answered this offer
    if (
      history.accepted.includes(currentOffer.id) ||
      history.declined.includes(currentOffer.id)
    ) {
      const nextOffer = getNextOffer(currentOffer.id, history);
      if (nextOffer) {
        navigate(`/oferta/${nextOffer.slug}`, { replace: true });
      } else {
        navigate('/crear-cuenta', { replace: true });
      }
      return;
    }

    // Track offer_view
    trackingService.track('offer_view', {
      offer_id: currentOffer.id,
      product_id: currentOffer.product,
      value: currentOffer.price,
      currency: 'USD',
    });
  }, [slug, currentOffer, history, navigate]);

  if (!currentOffer) return null;

  // Determine current step index out of total (e.g. 1 to 5)
  const answeredCount = history.accepted.length + history.declined.length;
  const currentStepNum = Math.min(funnelConfig.totalSteps, answeredCount + 1);

  // Helper to find next offer
  function getNextOffer(currentId: string, currentHist: OffersHistory): FunnelOffer | null {
    const currentIndex = funnelConfig.offers.findIndex((o) => o.id === currentId);
    for (let i = currentIndex + 1; i < funnelConfig.offers.length; i++) {
      const candidate = funnelConfig.offers[i];
      if (candidate.showIf?.declined) {
        if (!currentHist.declined.includes(candidate.showIf.declined)) {
          continue; // skip
        }
      }
      return candidate;
    }
    return null;
  }

  const advanceToNext = (updatedHist: OffersHistory) => {
    const nextOffer = getNextOffer(currentOffer.id, updatedHist);
    if (nextOffer) {
      navigate(`/oferta/${nextOffer.slug}`);
    } else {
      navigate('/crear-cuenta');
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    const result = await paymentService.chargeOneClick(currentOffer.id);
    setIsLoading(false);

    const updated: OffersHistory = {
      ...history,
      accepted: [...history.accepted, currentOffer.id],
    };
    setHistory(updated);
    saveOffersHistory(updated);

    advanceToNext(updated);
  };

  const handleDecline = async () => {
    await trackingService.track('offer_decline', {
      offer_id: currentOffer.id,
      product_id: currentOffer.product,
      value: currentOffer.price,
    });

    const updated: OffersHistory = {
      ...history,
      declined: [...history.declined, currentOffer.id],
    };
    setHistory(updated);
    saveOffersHistory(updated);

    advanceToNext(updated);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-5 py-5">
      {/* Top Progress Banner */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <span className="font-bold text-sm text-rose-950">
            {brand.name}
          </span>
          <span className="text-xs font-semibold text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-full">
            {t('offers.header_step', {
              current: currentStepNum,
              total: funnelConfig.totalSteps,
            })}
          </span>
        </div>
      </div>

      {/* Main Offer Card */}
      <div className="space-y-5 py-4">
        {/* Badge */}
        {currentOffer.badgeKey && (
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/80 px-3 py-1 rounded-full">
              {t(currentOffer.badgeKey)}
            </span>
          </div>
        )}

        {/* Headlines */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900 leading-snug">
            {t(currentOffer.titleKey)}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t(currentOffer.subtitleKey)}
          </p>
        </div>

        {/* Visual Mockup Container */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="h-40 rounded-2xl bg-gradient-to-br from-rose-50 via-rose-100/40 to-orange-50/50 flex flex-col items-center justify-center p-4 text-center border border-rose-200/50">
            {currentOffer.mockupType === 'meal_plan' && (
              <>
                <span className="text-3xl mb-2">🥗</span>
                <p className="text-xs font-bold text-rose-950">Menús Semanales Latinos</p>
                <p className="text-[11px] text-slate-500 mt-1">Recetas sencillas, antiinflamatorias y lista de compras lista</p>
              </>
            )}
            {currentOffer.mockupType === 'challenge_28' && (
              <>
                <span className="text-3xl mb-2">🏆</span>
                <p className="text-xs font-bold text-rose-950">Reto 28 Días: Abdomen y Postura</p>
                <p className="text-[11px] text-slate-500 mt-1">28 entrenamientos progresivos con medallas y check-in diario</p>
              </>
            )}
            {currentOffer.mockupType === 'challenge_lite' && (
              <>
                <span className="text-3xl mb-2">⭐</span>
                <p className="text-xs font-bold text-rose-950">Reto 28 Días: Versión Esencial</p>
                <p className="text-[11px] text-slate-500 mt-1">Acceso a todas las rutinas clave a mitad de precio</p>
              </>
            )}
            {currentOffer.mockupType === 'face_yoga' && (
              <>
                <span className="text-3xl mb-2">✨</span>
                <p className="text-xs font-bold text-rose-950">Yoga Facial y Cuello 21 Días</p>
                <p className="text-[11px] text-slate-500 mt-1">5 minutos al día frente al espejo para oxigenar tu piel</p>
              </>
            )}
            {currentOffer.mockupType === 'ai_coach' && (
              <>
                <span className="text-3xl mb-2">💬</span>
                <p className="text-xs font-bold text-rose-950">Coach IA Personal 24/7</p>
                <p className="text-[11px] text-slate-500 mt-1">Tu acompañante para dudas, motivación y ajustes de ejercicios</p>
              </>
            )}
          </div>

          {/* Pricing anchor */}
          <div className="flex items-center justify-between pt-4 pb-2 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {t('offers.one_click_badge')}
              </span>
            </div>
            <div className="text-right">
              {currentOffer.anchor && (
                <span className="text-xs text-slate-400 line-through mr-2">
                  ${currentOffer.anchor}
                </span>
              )}
              <span className="text-2xl font-bold text-slate-900">
                ${currentOffer.price}
              </span>
              {currentOffer.interval && (
                <span className="text-xs text-slate-500">/mes</span>
              )}
            </div>
          </div>

          {/* Bullets */}
          <ul className="space-y-2.5 text-xs text-slate-700 pt-3">
            {currentOffer.bulletsKeys.map((bKey, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-snug">{t(bKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          size="xl"
          onClick={handleAccept}
          isLoading={isLoading}
        >
          {t('offers.yes_add', { price: currentOffer.price })}
        </Button>

        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800 py-2.5 transition select-none"
        >
          {t('offers.no_thanks')}
        </button>
      </div>
    </div>
  );
};
