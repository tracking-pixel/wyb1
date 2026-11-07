import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizSteps, QuizStepConfig, QuizOption } from '@/src/config/quiz.config';
import { useQuizStore } from '@/src/store/quizStore';
import { trackingService } from '@/src/services/tracking';
import { useTranslation } from '@/src/i18n';
import { QuizLayout } from '@/src/components/layout/QuizLayout';
import { Button } from '@/src/components/ui/Button';
import { SilhouetteIcon } from '@/src/components/ui/SilhouetteIcon';

export const QuizPage: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers, setAnswer, setLastStep, getBmi } = useQuizStore();

  const stepNumber = parseInt(step || '1', 10);
  const currentConfig: QuizStepConfig | undefined = quizSteps.find(
    (s) => s.stepNumber === stepNumber
  );

  const totalSteps = quizSteps.length;

  // Local state for complex inputs
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [userNameInput, setUserNameInput] = useState<string>(answers.user_name || '');
  const [heightCm, setHeightCm] = useState<number>(answers.height_cm || 162);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(answers.current_weight_kg || 68);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(answers.target_weight_kg || 60);
  const [units, setUnits] = useState<'metric' | 'imperial'>(answers.units || 'metric');
  const [eventDate, setEventDate] = useState<string>(answers.motivating_event_date || '');
  const [bmiWarning, setBmiWarning] = useState<string | null>(null);

  // Sync state when step changes
  useEffect(() => {
    if (!currentConfig) {
      navigate('/quiz/1', { replace: true });
      return;
    }

    setLastStep(stepNumber);

    // Track quiz_start on step 1
    if (stepNumber === 1) {
      trackingService.track('quiz_start');
    }

    // Populate multi-select if already answered
    if (currentConfig.id === 'target_zones') {
      setMultiSelected(answers.target_zones || []);
    } else if (currentConfig.id === 'limitations') {
      setMultiSelected(answers.limitations || []);
    } else if (currentConfig.id === 'habits') {
      setMultiSelected(answers.habits || []);
    }
  }, [stepNumber, currentConfig, navigate, setLastStep]);

  if (!currentConfig) return null;

  // Next step handler
  const goToNextStep = async (answerPayload?: any) => {
    // Track quiz_step
    await trackingService.track('quiz_step', {
      step: stepNumber,
      question_id: currentConfig.id,
      answer: answerPayload,
    });

    if (stepNumber < totalSteps) {
      navigate(`/quiz/${stepNumber + 1}`);
    } else {
      // Completed quiz!
      await trackingService.track('quiz_complete', {
        goal: answers.primary_goal,
        age: answers.age_range,
        units: answers.units,
      });
      navigate('/analizando');
    }
  };

  // Single choice handler (auto-advances)
  const handleSingleSelect = (optionId: string) => {
    setAnswer(currentConfig.id as any, optionId);
    goToNextStep(optionId);
  };

  // Multi select toggle
  const handleMultiToggle = (optionId: string) => {
    let updated: string[];
    if (optionId === 'none') {
      updated = ['none'];
    } else {
      const filtered = multiSelected.filter((id) => id !== 'none');
      if (filtered.includes(optionId)) {
        updated = filtered.filter((id) => id !== optionId);
      } else {
        updated = [...filtered, optionId];
      }
    }
    setMultiSelected(updated);
  };

  const handleMultiConfirm = () => {
    if (multiSelected.length === 0) return;
    setAnswer(currentConfig.id as any, multiSelected);
    goToNextStep(multiSelected);
  };

  // Body Measurements validation & submission
  const handleMeasurementsConfirm = () => {
    const targetBmi = getBmi(targetWeightKg, heightCm);
    if (targetBmi < 18.5) {
      setBmiWarning(t('quiz.validation.bmi_too_low'));
      return;
    }
    setBmiWarning(null);

    setAnswer('units', units);
    setAnswer('height_cm', heightCm);
    setAnswer('current_weight_kg', currentWeightKg);
    setAnswer('target_weight_kg', targetWeightKg);

    goToNextStep({
      units,
      height_cm: heightCm,
      current_weight_kg: currentWeightKg,
      target_weight_kg: targetWeightKg,
      target_bmi: targetBmi,
    });
  };

  // Name confirmation
  const handleNameConfirm = () => {
    const trimmed = userNameInput.trim();
    if (!trimmed) {
      return;
    }
    setAnswer('user_name', trimmed);
    goToNextStep(trimmed);
  };

  // Unit conversion helpers
  const lbsToKg = (lbs: number) => Math.round(lbs * 0.453592);
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462);
  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  const currentDisplayWeight = units === 'metric' ? currentWeightKg : kgToLbs(currentWeightKg);
  const targetDisplayWeight = units === 'metric' ? targetWeightKg : kgToLbs(targetWeightKg);
  const ftIn = cmToFtIn(heightCm);

  return (
    <QuizLayout
      currentStep={stepNumber}
      totalSteps={totalSteps}
      onBack={() => {
        if (stepNumber > 1) {
          navigate(`/quiz/${stepNumber - 1}`);
        }
      }}
    >
      <div className="flex-1 flex flex-col justify-between">
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {t(currentConfig.titleKey)}
          </h1>
          {currentConfig.subtitleKey && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {t(currentConfig.subtitleKey)}
            </p>
          )}
        </div>

        {/* Question Content by Type */}
        <div className="flex-1">
          {/* 1. SINGLE CHOICE */}
          {currentConfig.type === 'single_choice' && currentConfig.options && (
            <div className="space-y-3">
              {currentConfig.options.map((opt) => {
                const isSelected = (answers as any)[currentConfig.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSingleSelect(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between active:scale-[0.99] min-h-[56px] ${
                      isSelected
                        ? 'border-rose-800 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200/90 bg-white hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-base">
                        {t(opt.labelKey)}
                      </p>
                      {opt.sublabelKey && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t(opt.sublabelKey)}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-rose-800 bg-rose-800 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. BODY SILHOUETTES */}
          {currentConfig.type === 'body_silhouette' && currentConfig.options && (
            <div className="grid grid-cols-2 gap-3">
              {currentConfig.options.map((opt) => {
                const isSelected = (answers as any)[currentConfig.id] === opt.id;
                const isTarget = currentConfig.id === 'target_body_type';
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSingleSelect(opt.id)}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all min-h-[160px] active:scale-[0.98] ${
                      isSelected
                        ? 'border-rose-800 bg-rose-50/80 ring-2 ring-rose-800/20'
                        : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                  >
                    {opt.silhouetteType && (
                      <SilhouetteIcon
                        type={opt.silhouetteType}
                        isTarget={isTarget}
                        className="w-16 h-24 mb-2"
                      />
                    )}
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {t(opt.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. MULTIPLE CHOICE */}
          {currentConfig.type === 'multiple_choice' && currentConfig.options && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                {t('quiz.multi_select_hint')}
              </p>
              {currentConfig.options.map((opt) => {
                const isChecked = multiSelected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMultiToggle(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all min-h-[56px] flex items-center justify-between active:scale-[0.99] ${
                      isChecked
                        ? 'border-rose-800 bg-rose-50/80 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-rose-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {t(opt.labelKey)}
                      </p>
                      {opt.sublabelKey && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t(opt.sublabelKey)}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'border-rose-800 bg-rose-800 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. INTERMEDIATE SCREENS */}
          {currentConfig.type === 'intermediate' && currentConfig.intermediateContent && (
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <h2 className="text-xl font-bold text-rose-950 leading-snug">
                  {t(currentConfig.intermediateContent.headlineKey)}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(currentConfig.intermediateContent.paragraphKey)}
                </p>

                {currentConfig.intermediateContent.metricValue && (
                  <div className="pt-2 border-t border-rose-100/70">
                    <p className="text-2xl font-bold text-rose-800">
                      {currentConfig.intermediateContent.metricValue}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t(currentConfig.intermediateContent.metricLabelKey || '')}
                    </p>
                  </div>
                )}
              </div>

              {currentConfig.intermediateContent.testimonialPlaceholder && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                  <p className="text-xs italic text-slate-700 leading-relaxed">
                    {t(currentConfig.intermediateContent.testimonialPlaceholder.quoteKey)}
                  </p>
                  <p className="text-xs font-semibold text-rose-900 mt-2">
                    — {currentConfig.intermediateContent.testimonialPlaceholder.name}, {currentConfig.intermediateContent.testimonialPlaceholder.age} años
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. EVENT MOTIVATOR */}
          {currentConfig.type === 'event_motivator' && currentConfig.options && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {currentConfig.options.map((opt) => {
                  const isSelected = answers.motivating_event === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer('motivating_event', opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between min-h-[52px] ${
                        isSelected
                          ? 'border-rose-800 bg-rose-50/80 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <span className="font-semibold text-slate-900 text-sm">
                        {t(opt.labelKey)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-rose-800 bg-rose-800 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {answers.motivating_event && answers.motivating_event !== 'no_event' && (
                <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    {t('quiz.event_selector.has_date')}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      setAnswer('motivating_event_date', e.target.value);
                    }}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm focus:outline-rose-800"
                  />
                </div>
              )}
            </div>
          )}

          {/* 6. HEIGHT & WEIGHT MEASUREMENTS */}
          {currentConfig.type === 'height_weight' && (
            <div className="space-y-5">
              {/* Unit Toggle */}
              <div className="flex items-center justify-center p-1 bg-rose-100/60 rounded-xl max-w-[280px] mx-auto">
                <button
                  type="button"
                  onClick={() => setUnits('metric')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    units === 'metric'
                      ? 'bg-white text-rose-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('quiz.measurements.metric')}
                </button>
                <button
                  type="button"
                  onClick={() => setUnits('imperial')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    units === 'imperial'
                      ? 'bg-white text-rose-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('quiz.measurements.imperial')}
                </button>
              </div>

              {/* Height Input */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('quiz.measurements.height')}
                </label>
                {units === 'metric' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={120}
                      max={220}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="flex-1 min-h-[44px] px-3 text-lg font-bold rounded-xl border border-slate-300 focus:outline-rose-800"
                    />
                    <span className="text-sm font-semibold text-slate-500">cm</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={4}
                        max={7}
                        value={ftIn.feet}
                        onChange={(e) => {
                          const totalIn = Number(e.target.value) * 12 + ftIn.inches;
                          setHeightCm(Math.round(totalIn * 2.54));
                        }}
                        className="w-full min-h-[44px] px-2 text-base font-bold rounded-xl border border-slate-300 text-center"
                      />
                      <span className="text-xs text-slate-500">ft</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={ftIn.inches}
                        onChange={(e) => {
                          const totalIn = ftIn.feet * 12 + Number(e.target.value);
                          setHeightCm(Math.round(totalIn * 2.54));
                        }}
                        className="w-full min-h-[44px] px-2 text-base font-bold rounded-xl border border-slate-300 text-center"
                      />
                      <span className="text-xs text-slate-500">in</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Weight */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {t('quiz.measurements.current_weight')}
                  </label>
                  <span className="text-xs text-slate-500">
                    IMC actual: <strong className="text-slate-800">{getBmi(currentWeightKg, heightCm)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={units === 'metric' ? 40 : 90}
                    max={units === 'metric' ? 200 : 440}
                    value={currentDisplayWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentWeightKg(units === 'metric' ? val : lbsToKg(val));
                    }}
                    className="flex-1 min-h-[44px] px-3 text-lg font-bold rounded-xl border border-slate-300 focus:outline-rose-800"
                  />
                  <span className="text-sm font-semibold text-slate-500">
                    {units === 'metric' ? 'kg' : 'lb'}
                  </span>
                </div>
              </div>

              {/* Target Weight */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {t('quiz.measurements.target_weight')}
                  </label>
                  <span className="text-xs text-slate-500">
                    IMC meta: <strong className="text-rose-800">{getBmi(targetWeightKg, heightCm)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={units === 'metric' ? 40 : 90}
                    max={units === 'metric' ? 200 : 440}
                    value={targetDisplayWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const kg = units === 'metric' ? val : lbsToKg(val);
                      setTargetWeightKg(kg);
                      const bmi = getBmi(kg, heightCm);
                      if (bmi < 18.5) {
                        setBmiWarning(t('quiz.validation.bmi_too_low'));
                      } else {
                        setBmiWarning(null);
                      }
                    }}
                    className="flex-1 min-h-[44px] px-3 text-lg font-bold rounded-xl border border-slate-300 focus:outline-rose-800"
                  />
                  <span className="text-sm font-semibold text-slate-500">
                    {units === 'metric' ? 'kg' : 'lb'}
                  </span>
                </div>

                {/* Validation message if BMI < 18.5 */}
                {bmiWarning && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">⚠️</span>
                    <span>{bmiWarning}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. USER NAME INPUT */}
          {currentConfig.type === 'text_input' && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <label className="text-xs font-semibold text-slate-600 block mb-2">
                  {t('quiz.steps.user_name.hint')}
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej. Carmen"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameConfirm();
                  }}
                  className="w-full min-h-[50px] px-4 rounded-2xl border border-slate-300 text-lg font-semibold text-slate-900 focus:outline-rose-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA for multi-select, intermediate, measurements, name */}
        {(currentConfig.type === 'multiple_choice' ||
          currentConfig.type === 'intermediate' ||
          currentConfig.type === 'height_weight' ||
          currentConfig.type === 'event_motivator' ||
          currentConfig.type === 'text_input') && (
          <div className="pt-6">
            <Button
              size="xl"
              onClick={() => {
                if (currentConfig.type === 'multiple_choice') handleMultiConfirm();
                else if (currentConfig.type === 'intermediate') goToNextStep('read');
                else if (currentConfig.type === 'height_weight') handleMeasurementsConfirm();
                else if (currentConfig.type === 'event_motivator') goToNextStep(answers.motivating_event);
                else if (currentConfig.type === 'text_input') handleNameConfirm();
              }}
              disabled={
                (currentConfig.type === 'multiple_choice' && multiSelected.length === 0) ||
                (currentConfig.type === 'height_weight' && getBmi(targetWeightKg, heightCm) < 18.5) ||
                (currentConfig.type === 'text_input' && !userNameInput.trim())
              }
            >
              {t('common.continue')}
            </Button>
          </div>
        )}
      </div>
    </QuizLayout>
  );
};
