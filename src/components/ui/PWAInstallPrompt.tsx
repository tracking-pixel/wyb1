import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/src/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <div className="w-full">
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 transition-colors text-left ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-rose-950">{t('onboarding.step2.title')}</p>
              <p className="text-xs text-rose-800/80">{t('onboarding.step2.subtitle')}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-800 text-white shrink-0">
            {t('onboarding.step2.install_cta')}
          </span>
        </button>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-rose-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-slate-900 mb-2">
              Instalar en iPhone o iPad
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              1. Toca el botón <strong>Compartir</strong> (ícono cuadrado con flecha hacia arriba) en la barra de Safari.<br /><br />
              2. Desplázate hacia abajo y selecciona <strong>«Agregar a pantalla de inicio»</strong>.<br /><br />
              3. Toca <strong>«Agregar»</strong> arriba a la derecha.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full min-h-[44px] rounded-xl bg-rose-800 text-white font-medium text-sm hover:bg-rose-900 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
