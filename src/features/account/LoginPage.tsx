import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/src/services/auth';
import { useUserStore } from '@/src/store/userStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { brand } from '@/src/config/brand';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await authService.logIn(email, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || t('common.error'));
      return;
    }

    refreshUser();
    navigate('/app/hoy');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between max-w-md mx-auto w-full px-5 py-6">
      <div className="text-center pt-2">
        <span className="font-bold text-lg text-rose-950 tracking-tight">
          {brand.name}
        </span>
      </div>

      <div className="my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-slate-900">
              {t('account.login_title')}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('account.login_subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('account.email_label')}
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-rose-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('account.password_label')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-rose-800"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <Button
              type="submit"
              size="xl"
              isLoading={isLoading}
              className="mt-2"
            >
              {t('account.login_button')}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-500 pt-2">
            {t('account.no_account')}{' '}
            <button
              onClick={() => navigate('/quiz/1')}
              className="text-rose-800 font-semibold hover:underline"
            >
              {t('account.start_quiz')}
            </button>
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pb-2">
        © {brand.copyrightYear} {brand.name}
      </div>
    </div>
  );
};
