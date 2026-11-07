import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { brand } from '@/src/config/brand';
import { Button } from '@/src/components/ui/Button';

export const AnalyzingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers, setAnswer } = useQuizStore();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAnswered, setPopupAnswered] = useState(false);

  const checklist = [
    t('analyzing.steps.0'),
    t('analyzing.steps.1'),
    t('analyzing.steps.2'),
    t('analyzing.steps.3'),
    t('analyzing.steps.4'),
  ];

  useEffect(() => {
    // Progress checklist
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev === 2 && !popupAnswered) {
          setShowPopup(true);
          return prev;
        }
        if (prev < checklist.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [popupAnswered, checklist.length]);

  // Once all steps finish, navigate to /email
  useEffect(() => {
    if (activeStepIndex >= checklist.length - 1 && popupAnswered) {
      const timer = setTimeout(() => {
        navigate('/email');
      }, 1200);
      return () => clearInterval(timer);
    }
  }, [activeStepIndex, popupAnswered, navigate, checklist.length]);

  const handleSelectTime = (pref: 'morning' | 'evening' | 'anytime') => {
    setAnswer('training_time_preference', pref);
    setPopupAnswered(true);
    setShowPopup(false);
    setActiveStepIndex(3);
  };

  const progressPct = Math.min(100, Math.round(((activeStepIndex + 1) / checklist.length) * 100));

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 flex flex-col items-center text-center">
        {/* Animated Brand Ring */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-rose-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-rose-700 border-t-transparent animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
          <span className="font-bold text-xl text-rose-900">{progressPct}%</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          {t('analyzing.title')}
        </h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {t('analyzing.subtitle')}
        </p>

        {/* Animated Checklist */}
        <div className="w-full space-y-3 text-left">
          {checklist.map((item, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-rose-50 border border-rose-200/80 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/70 border border-transparent opacity-85'
                    : 'opacity-40 border border-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-rose-700 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-xs ${
                    isCurrent ? 'font-bold text-rose-950' : 'font-medium text-slate-700'
                  }`}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini popup question in the middle */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-rose-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[11px] font-semibold tracking-wider text-rose-700 uppercase bg-rose-50 px-2.5 py-1 rounded-full">
              {t('analyzing.popup_question.badge')}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-3 mb-4 leading-snug">
              {t('analyzing.popup_question.question')}
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSelectTime('morning')}
                className="w-full min-h-[48px] p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-left text-xs font-semibold text-slate-800 transition"
              >
                ☀️ {t('analyzing.popup_question.morning')}
              </button>
              <button
                onClick={() => handleSelectTime('evening')}
                className="w-full min-h-[48px] p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-left text-xs font-semibold text-slate-800 transition"
              >
                🌙 {t('analyzing.popup_question.evening')}
              </button>
              <button
                onClick={() => handleSelectTime('anytime')}
                className="w-full min-h-[48px] p-3 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-left text-xs font-semibold text-slate-800 transition"
              >
                ⏱️ {t('analyzing.popup_question.anytime')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
