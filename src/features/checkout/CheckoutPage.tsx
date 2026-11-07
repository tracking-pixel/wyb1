import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { plansConfig, Plan } from '@/src/config/plans.config';
import { funnelConfig } from '@/src/config/funnel.config';
import { paymentService } from '@/src/services/payment';
import { trackingService } from '@/src/services/tracking';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { brand } from '@/src/config/brand';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const planId = searchParams.get('plan') || plansConfig.defaultPlanId;
  const plan: Plan =
    plansConfig.plans.find((p) => p.id === planId) || plansConfig.plans[1];

  // Card fields (mimicking Stripe Element)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('123');
  const [cardholderName, setCardholderName] = useState('Carmen R.');

  // Dev toggles
  const [simulateFail, setSimulateFail] = useState(paymentService.getSimulateFailure());
  const [simulate3DS, setSimulate3DS] = useState(paymentService.getSimulate3DS());

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [show3DSModal, setShow3DSModal] = useState(false);

  useEffect(() => {
    trackingService.track('initiate_checkout', {
      plan_id: plan.id,
      value: plan.introPrice,
      currency: 'USD',
    });
  }, [plan.id, plan.introPrice]);

  const handleToggleFail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSimulateFail(val);
    paymentService.setSimulateFailure(val);
  };

  const handleToggle3DS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSimulate3DS(val);
    paymentService.setSimulate3DS(val);
  };

  const proceedToOffers = () => {
    const firstOffer = funnelConfig.offers[0];
    navigate(`/oferta/${firstOffer.slug}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await paymentService.purchaseSubscription(plan.id, {
      number: cardNumber,
      expiry,
      cvc,
      name: cardholderName,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || t('common.error'));
      return;
    }

    if (result.requires3DS) {
      setShow3DSModal(true);
      return;
    }

    proceedToOffers();
  };

  const handleComplete3DS = () => {
    setShow3DSModal(false);
    proceedToOffers();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between max-w-md mx-auto w-full px-4 sm:px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-rose-100/70 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          ← {t('common.back')}
        </button>
        <span className="font-bold text-base text-rose-950">
          {brand.name} Checkout
        </span>
        <div className="w-10" />
      </div>

      <div className="space-y-5 pb-8">
        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('checkout.order_summary')}
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-base">
                {t(plan.nameKey)}
              </p>
              <p className="text-xs text-rose-800 font-semibold">
                Suscripción de bienestar 100% de bajo impacto
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">
                ${plan.introPrice}
              </p>
              <p className="text-[10px] text-slate-400">USD</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{t('checkout.today_charge')}</span>
            <span className="font-bold text-slate-900 text-sm">${plan.introPrice}</span>
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            {t('checkout.recurring_note', {
              price: plan.renewalPrice,
              interval: t(plan.renewalIntervalKey),
            })}
          </p>
        </div>

        {/* Express Checkout Visual Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 text-center">
            {t('checkout.payment_methods')} express
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              className="min-h-[44px] rounded-2xl bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-900 transition"
            >
              <span>Pay</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="min-h-[44px] rounded-2xl bg-white border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 transition"
            >
              <span>G Pay</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-400">
            {t('checkout.or_card')}
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Form mimicking Stripe Payment Element */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('checkout.card_name')}
            </label>
            <input
              type="text"
              required
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-rose-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('checkout.card_number')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full min-h-[44px] pl-3.5 pr-10 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-rose-800"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-rose-800">
                VISA
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('checkout.card_expiry')}
              </label>
              <input
                type="text"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-rose-800 text-center"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('checkout.card_cvc')}
              </label>
              <input
                type="text"
                required
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-rose-800 text-center"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            size="xl"
            isLoading={isLoading}
            className="mt-2"
          >
            {t('checkout.pay_button', { price: plan.introPrice })}
          </Button>

          <p className="text-[10px] text-slate-500 leading-relaxed text-center pt-1">
            {t('checkout.legal_terms', { price: plan.introPrice })}
          </p>
        </form>

        {/* Dev Options Accordion / Controls */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs space-y-2">
          <p className="font-bold text-slate-700">
            🛠️ {t('checkout.dev_tools_title')}
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={simulateFail}
                onChange={handleToggleFail}
                className="rounded text-rose-800 focus:ring-rose-800"
              />
              <span>{t('checkout.dev_simulate_fail')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={simulate3DS}
                onChange={handleToggle3DS}
                className="rounded text-rose-800 focus:ring-rose-800"
              />
              <span>{t('checkout.dev_simulate_3ds')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3DS Verification Modal */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto text-xl font-bold">
              🛡️
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Verificación 3D Secure (Simulación)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tu banco requiere autenticar la transacción para mayor seguridad.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 text-xs font-mono text-slate-700 border">
              Código SMS enviado: <strong>482-910</strong>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleComplete3DS}
            >
              Completar verificación
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
