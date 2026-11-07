import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../ui/ProgressBar';
import { brand } from '@/src/config/brand';
import { useTranslation } from '@/src/i18n';

interface QuizLayoutProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
}

export const QuizLayout: React.FC<QuizLayoutProps> = ({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
  children,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F5]/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-rose-100/60 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between min-h-[44px]">
          {/* Left: Back button or placeholder */}
          <div className="w-10 flex items-center">
            {showBack && currentStep > 1 && (
              <button
                onClick={handleBack}
                aria-label={t('common.back')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-rose-100/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Center: Brand name */}
          <div className="text-center">
            <span className="font-bold text-lg text-rose-900 tracking-tight">
              {brand.name}
            </span>
          </div>

          {/* Right: Step label */}
          <div className="w-10 flex items-center justify-end text-xs font-medium text-slate-500">
            <span>{currentStep}/{totalSteps}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col">
        {children}
      </main>
    </div>
  );
};
