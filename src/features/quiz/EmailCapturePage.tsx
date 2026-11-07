import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/src/store/quizStore';
import { trackingService } from '@/src/services/tracking';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { brand } from '@/src/config/brand';

export const EmailCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers, setAnswer } = useQuizStore();

  const [email, setEmail] = useState(answers.email || '');
  const [optIn, setOptIn] = useState(answers.marketing_opt_in ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t('email.invalid_email'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setAnswer('email', cleanEmail);
    setAnswer('marketing_opt_in', optIn);

    // Track lead event with SHA-256 hash (handled inside trackingService.track('lead', ...))
    await trackingService.track('lead', {
      email: cleanEmail,
      marketing_opt_in: optIn,
      user_name: answers.user_name,
      primary_goal: answers.primary_goal,
    });

    setIsSubmitting(false);
    navigate('/resultado');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between p-5 max-w-md mx-auto w-full">
      {/* Brand mark */}
      <div className="text-center pt-4">
        <span className="font-bold text-lg text-rose-950 tracking-tight">
          {brand.name}
        </span>
      </div>

      {/* Main card */}
      <div className="my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-900 text-center mb-2 leading-snug">
            {t('email.title')}
          </h1>
          <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
            {t('email.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('email.input_label')}
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder={t('email.placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full min-h-[50px] px-4 rounded-2xl border border-slate-300 text-base text-slate-900 focus:outline-rose-800"
              />
              {error && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
              )}
            </div>

            {/* Marketing Opt-in */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-rose-800 focus:ring-rose-800 border-slate-300"
              />
              <span className="leading-tight">{t('email.opt_in')}</span>
            </label>

            <Button
              type="submit"
              size="xl"
              isLoading={isSubmitting}
              className="mt-2"
            >
              {t('email.cta')}
            </Button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-4">
            {t('email.privacy_note')}
          </p>
        </div>
      </div>

      <div className="pb-4 text-center text-xs text-slate-400">
        © {brand.copyrightYear} {brand.name}
      </div>
    </div>
  );
};
