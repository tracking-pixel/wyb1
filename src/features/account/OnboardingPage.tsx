import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { PWAInstallPrompt } from '@/src/components/ui/PWAInstallPrompt';
import { authService } from '@/src/services/auth';
import { brand } from '@/src/config/brand';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [reminderTime, setReminderTime] = useState<string>('08:30');

  const handleSaveReminder = () => {
    authService.updateProfile({ reminderTime });
    setCurrentStep(2);
  };

  const handleFinishOnboarding = () => {
    navigate('/app/hoy');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between max-w-md mx-auto w-full px-5 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-100">
        <span className="font-bold text-sm text-rose-950">
          {brand.name}
        </span>
        <span className="text-xs font-semibold text-rose-800 bg-rose-100/70 px-2.5 py-1 rounded-full">
          Paso {currentStep} de 3
        </span>
      </div>

      <div className="my-auto py-6">
        {/* Step 1: Reminder Time */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl mx-auto shadow-xs">
              ⏰
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {t('onboarding.step1.title')}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('onboarding.step1.subtitle')}
              </p>
            </div>

            <div className="py-2">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                {t('onboarding.step1.time_label')}
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-48 mx-auto min-h-[50px] px-4 text-center rounded-2xl border-2 border-rose-200 text-xl font-bold text-rose-950 focus:outline-rose-800"
              />
            </div>

            <Button
              size="xl"
              onClick={handleSaveReminder}
            >
              {t('onboarding.step1.save_time')}
            </Button>
          </div>
        )}

        {/* Step 2: Install PWA */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl mx-auto shadow-xs">
              📲
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {t('onboarding.step2.title')}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('onboarding.step2.subtitle')}
              </p>
            </div>

            <div className="py-2">
              <PWAInstallPrompt />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setCurrentStep(3)}
            >
              {t('common.continue')}
            </Button>
          </div>
        )}

        {/* Step 3: First Workout Start */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mx-auto shadow-xs">
              🎉
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {t('onboarding.step3.title')}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('onboarding.step3.subtitle')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-left text-xs space-y-1">
              <p className="font-bold text-rose-950">Día 1: Despertar Articular y Caminata Suave</p>
              <p className="text-slate-600">Duración: 12 minutos • 100% amigable con tus rodillas</p>
            </div>

            <Button
              size="xl"
              onClick={handleFinishOnboarding}
            >
              {t('onboarding.step3.start_first_workout')}
            </Button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 pb-2">
        © {brand.copyrightYear} {brand.name}
      </div>
    </div>
  );
};
