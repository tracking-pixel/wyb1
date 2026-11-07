import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/src/services/auth';
import { useUserStore } from '@/src/store/userStore';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';

export const CuentaTab: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refreshUser } = useUserStore();
  const { answers, setAnswer } = useQuizStore();

  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [retentionMessage, setRetentionMessage] = useState<string | null>(null);

  const sub = user?.subscription;

  const handlePause = () => {
    authService.pauseSubscription(30);
    refreshUser();
    setRetentionMessage('¡Tu suscripción ha sido pausada por 30 días!');
    setTimeout(() => {
      setShowRetentionModal(false);
      setRetentionMessage(null);
    }, 2000);
  };

  const handleDiscount = () => {
    authService.applyDiscount(30);
    refreshUser();
    setRetentionMessage('¡30% de descuento aplicado a tu próxima renovación!');
    setTimeout(() => {
      setShowRetentionModal(false);
      setRetentionMessage(null);
    }, 2000);
  };

  const handleConfirmCancel = () => {
    authService.cancelSubscription();
    refreshUser();
    setRetentionMessage(t('app.cuenta.retention.canceled_notice'));
    setTimeout(() => {
      setShowRetentionModal(false);
      setRetentionMessage(null);
    }, 2500);
  };

  const handleLogout = () => {
    authService.logOut();
    navigate('/login');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {t('app.cuenta.title')}
        </h1>
      </div>

      {/* Profile Section */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t('app.cuenta.profile_section')}
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">{t('app.cuenta.name_label')}</span>
            <span className="font-bold text-slate-800">{user?.name || answers.user_name}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">{t('app.cuenta.email_label')}</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {user?.email || answers.email || 'carmen@ejemplo.com'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">{t('app.cuenta.units_label')}</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setAnswer('units', 'metric')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  answers.units === 'metric' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                kg / cm
              </button>
              <button
                onClick={() => setAnswer('units', 'imperial')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  answers.units === 'imperial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                lb / ft
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500">{t('app.cuenta.reminder_label')}</span>
            <span className="font-bold text-slate-800">{user?.reminderTime || '08:30'}</span>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t('app.cuenta.subscription_section')}
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">{t('app.cuenta.plan_label')}</span>
            <span className="font-bold text-slate-900">
              {sub?.planId === 'm6' ? '6 Meses VIP' : '3 Meses (Popular)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Estado</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                sub?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : sub?.status === 'paused'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {sub?.status === 'active' ? 'Activa' : sub?.status === 'paused' ? 'Pausada' : 'Cancelada'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">{t('app.cuenta.next_billing_label')}</span>
            <span className="font-semibold text-slate-800">
              {sub?.renewAt ? new Date(sub.renewAt).toLocaleDateString() : 'En 90 días'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">{t('app.cuenta.amount_label')}</span>
            <span className="font-bold text-slate-900">
              ${sub?.renewalPrice || 39.99} USD
            </span>
          </div>
        </div>

        {sub?.status !== 'canceled' && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowRetentionModal(true)}
              className="text-xs text-rose-700 hover:text-rose-900 font-medium hover:underline"
            >
              {t('app.cuenta.cancel_subscription')}
            </button>
          </div>
        )}
      </div>

      {/* Logout button */}
      <div>
        <Button
          variant="outline"
          size="lg"
          className="w-full text-slate-700"
          onClick={handleLogout}
        >
          {t('app.cuenta.logout')}
        </Button>
      </div>

      {/* Retention Modal */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl mx-auto">
              🌸
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {t('app.cuenta.retention.title')}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('app.cuenta.retention.subtitle')}
            </p>

            {retentionMessage ? (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                {retentionMessage}
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <Button
                  size="md"
                  className="w-full"
                  onClick={handlePause}
                >
                  {t('app.cuenta.retention.pause_option')}
                </Button>

                <Button
                  variant="soft"
                  size="md"
                  className="w-full"
                  onClick={handleDiscount}
                >
                  {t('app.cuenta.retention.discount_option')}
                </Button>

                <button
                  onClick={handleConfirmCancel}
                  className="text-xs text-slate-400 hover:text-slate-600 pt-1 underline block mx-auto"
                >
                  {t('app.cuenta.retention.confirm_cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
