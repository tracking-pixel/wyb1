import React, { useState } from 'react';
import { funnelConfig, FunnelOffer } from '@/src/config/funnel.config';
import { plansConfig } from '@/src/config/plans.config';
import { entitlementService } from '@/src/services/entitlements';
import { paymentService } from '@/src/services/payment';
import { authService } from '@/src/services/auth';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';

export const PlanesTab: React.FC = () => {
  const { t } = useTranslation();
  const [entitlements, setEntitlements] = useState(entitlementService.getAll());
  const [loadingOfferId, setLoadingOfferId] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const currentUser = authService.getCurrentUser();
  const currentSub = currentUser?.subscription;

  const handleBuyOffer = async (offer: FunnelOffer) => {
    setLoadingOfferId(offer.id);
    const res = await paymentService.chargeOneClick(offer.id);
    setLoadingOfferId(null);
    if (res.success) {
      setEntitlements(entitlementService.getAll());
    }
  };

  const handleUpgradePlan = () => {
    authService.updateProfile({
      subscription: {
        planId: 'm6',
        status: 'active',
        startedAt: new Date().toISOString(),
        renewAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        renewalPrice: 59.99,
        interval: 'cada 6 meses',
        cardLast4: '4242',
        cardBrand: 'Visa',
      },
    });
    setUpgradeSuccess(true);
    setTimeout(() => setUpgradeSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {t('app.planes.title')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('app.planes.subtitle')}
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
          {t('app.planes.subscription_status')}
        </span>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-base text-slate-900">
              {currentSub?.planId === 'm6' ? 'Plan 6 Meses VIP' : 'Plan 3 Meses Activo'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Renovación: ${currentSub?.renewalPrice || 39.99} {currentSub?.interval || 'cada 3 meses'}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Activo
          </span>
        </div>

        {currentSub?.planId !== 'm6' && (
          <div className="pt-2 border-t border-slate-100">
            {upgradeSuccess ? (
              <p className="text-xs font-bold text-emerald-700 text-center py-2">
                ✓ {t('app.planes.upgrade_success')}
              </p>
            ) : (
              <button
                onClick={handleUpgradePlan}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold transition"
              >
                {t('app.planes.upgrade_plan')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Available Store Offers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Módulos y Add-ons Disponibles
        </h3>

        <div className="space-y-3">
          {funnelConfig.offers.map((offer) => {
            const isOwned = entitlements.includes(offer.product);
            const isLoading = loadingOfferId === offer.id;

            return (
              <div
                key={offer.id}
                className="p-4 rounded-3xl bg-white border border-rose-100 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                      {offer.product.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                      {t(offer.titleKey)}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {t(offer.subtitleKey)}
                    </p>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p className="text-lg font-bold text-slate-900">
                      ${offer.price}
                    </p>
                    {offer.interval && (
                      <p className="text-[10px] text-slate-400">/mes</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isOwned ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <span>✓</span>
                      <span>{t('app.planes.active_badge')}</span>
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      isLoading={isLoading}
                      onClick={() => handleBuyOffer(offer)}
                    >
                      {t('app.planes.unlock_button', { price: offer.price })}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
