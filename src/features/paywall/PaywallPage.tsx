import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansConfig, Plan } from '@/src/config/plans.config';
import { useQuizStore } from '@/src/store/quizStore';
import { trackingService } from '@/src/services/tracking';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { CountdownTimer } from '@/src/components/ui/CountdownTimer';
import { SilhouetteIcon } from '@/src/components/ui/SilhouetteIcon';
import { brand } from '@/src/config/brand';

export const PaywallPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers } = useQuizStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plansConfig.defaultPlanId);
  const [discountExpired, setDiscountExpired] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    trackingService.track('view_paywall', {
      user_name: answers.user_name,
      primary_goal: answers.primary_goal,
    });
  }, [answers.user_name, answers.primary_goal]);

  const selectedPlan: Plan =
    plansConfig.plans.find((p) => p.id === selectedPlanId) || plansConfig.plans[1];

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    trackingService.track('select_plan', {
      plan_id: plan.id,
      intro_price: plan.introPrice,
      duration_months: plan.durationMonths,
    });
  };

  const handleCheckout = () => {
    navigate(`/checkout?plan=${selectedPlan.id}`);
  };

  const currentSilhouette = (answers.current_body_type as any) || 'rectangle';
  const targetSilhouette = (answers.target_body_type as any)?.replace('_fit', '') || 'hourglass';

  // Compute daily price
  const activePrice = discountExpired ? selectedPlan.regularPrice : selectedPlan.introPrice;
  const perDayPrice = (activePrice / selectedPlan.durationDays).toFixed(2);

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-5 py-5">
      {/* Top Bar with Real Timer */}
      <div className="flex items-center justify-between py-2 border-b border-rose-100/70 mb-4">
        <span className="font-bold text-lg text-rose-950 tracking-tight">
          {brand.name}
        </span>
        <div className="flex items-center gap-1.5">
          {!discountExpired && (
            <CountdownTimer
              durationMinutes={plansConfig.discountDurationMinutes}
              onExpire={() => setDiscountExpired(true)}
            />
          )}
        </div>
      </div>

      <div className="space-y-6 pb-24">
        {/* Hero header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {t('paywall.hero_title')}
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {t('paywall.hero_subtitle', { name: answers.user_name || 'Amiga' })}
          </p>
        </div>

        {/* Before / After Silhouette Summary */}
        <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs">
          <div className="flex items-center justify-around py-2">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-slate-400 mb-1">
                {t('result.silhouette_comparison.current')}
              </span>
              <SilhouetteIcon type={currentSilhouette} isTarget={false} className="w-14 h-24" />
              <span className="text-xs font-bold text-slate-700 mt-1">
                {answers.current_weight_kg} kg
              </span>
            </div>

            <div className="flex flex-col items-center text-rose-700">
              <span className="text-lg font-bold">➔</span>
              <span className="text-[10px] font-bold text-rose-800">
                {t('paywall.before_after_label')}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-rose-800 mb-1">
                {t('result.silhouette_comparison.projected')}
              </span>
              <SilhouetteIcon type={targetSilhouette} isTarget={true} className="w-14 h-24" />
              <span className="text-xs font-bold text-rose-900 mt-1">
                {answers.target_weight_kg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-950">
            {t('paywall.benefits_title')}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
              <span>{t('paywall.benefits.b1')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
              <span>{t('paywall.benefits.b2')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
              <span>{t('paywall.benefits.b3')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
              <span>{t('paywall.benefits.b4')}</span>
            </li>
          </ul>
        </div>

        {/* Plan Selector (3 Plans) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            {t('paywall.select_plan_title')}
          </h3>

          <div className="space-y-3">
            {plansConfig.plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const price = discountExpired ? plan.regularPrice : plan.introPrice;
              const daily = (price / plan.durationDays).toFixed(2);

              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-800 bg-white ring-2 ring-rose-800/15 shadow-md'
                      : 'border-slate-200 bg-white/70 hover:border-rose-200'
                  }`}
                >
                  {plan.badgeKey && (
                    <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-rose-800 text-white text-[10px] font-bold tracking-wider shadow-xs">
                      {t(plan.badgeKey)}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-base">
                        {t(plan.nameKey)}
                      </p>
                      <p className="text-xs text-rose-700 font-semibold mt-0.5">
                        {t('paywall.per_day_label', { amount: daily })}
                      </p>
                    </div>

                    <div className="text-right">
                      {!discountExpired && (
                        <p className="text-xs text-slate-400 line-through">
                          ${plan.regularPrice}
                        </p>
                      )}
                      <p className="text-xl font-bold text-slate-900">
                        ${price}
                      </p>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {plan.featuresKeys.slice(0, 3).map((fKey, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-rose-600">•</span>
                        <span>{t(fKey)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-Day Guarantee */}
        <div className="p-4 rounded-3xl bg-rose-50/70 border border-rose-200/60 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-rose-200 text-rose-800 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            🛡️
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-950">
              {t('paywall.guarantee.title')}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {t('paywall.guarantee.description')}
            </p>
          </div>
        </div>

        {/* Testimonials Placeholder */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('paywall.testimonials_title')}
          </h3>
          <div className="space-y-2.5">
            {plansConfig.testimonialsPlaceholder.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {item.name}, {item.age} años
                  </span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                    {item.weightLoss} en {item.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{t(item.quoteKey)}"
                </p>
                <p className="text-[10px] text-slate-400">{item.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            {t('paywall.faq_title')}
          </h3>
          {plansConfig.faqKeys.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900"
                >
                  <span>{t(faq.questionKey)}</span>
                  <span className="text-rose-800 text-sm ml-2 font-bold">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                    {t(faq.answerKey)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-around py-3 text-[11px] text-slate-500 border-t border-b border-rose-100">
          <span className="flex items-center gap-1">🔒 {t('paywall.badges.secure')}</span>
          <span className="flex items-center gap-1">✨ {t('paywall.badges.instant_access')}</span>
          <span className="flex items-center gap-1">↩️ {t('paywall.badges.cancel_anytime')}</span>
        </div>
      </div>

      {/* Sticky Bottom Checkout Bar (15% cap compliant) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 p-4 shadow-xl">
        <div className="max-w-md mx-auto space-y-1.5">
          <Button
            size="xl"
            onClick={handleCheckout}
          >
            {t('paywall.cta_button', { price: activePrice })}
          </Button>

          <p className="text-[10px] text-slate-500 text-center leading-tight">
            {t('paywall.renewal_notice', {
              price: selectedPlan.renewalPrice,
              interval: t(selectedPlan.renewalIntervalKey),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
