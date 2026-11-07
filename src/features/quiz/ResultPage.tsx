import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';
import { SilhouetteIcon } from '@/src/components/ui/SilhouetteIcon';
import { brand } from '@/src/config/brand';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { answers, getBmi, getProjectedWeeks } = useQuizStore();

  const currentBmi = getBmi(answers.current_weight_kg, answers.height_cm);
  const targetBmi = getBmi(answers.target_weight_kg, answers.height_cm);
  const totalWeeks = getProjectedWeeks();

  // Generate conservative projection data points (weekly ~0.6 kg drop)
  const isMetric = answers.units === 'metric';
  const unitLabel = isMetric ? 'kg' : 'lb';
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462);

  const startWeight = isMetric ? answers.current_weight_kg : kgToLbs(answers.current_weight_kg);
  const goalWeight = isMetric ? answers.target_weight_kg : kgToLbs(answers.target_weight_kg);
  const weightDiff = startWeight - goalWeight;

  const chartData = [];
  const pointsCount = Math.min(totalWeeks, 12);
  for (let w = 0; w <= pointsCount; w++) {
    const fraction = w / pointsCount;
    // slightly decelerating curve
    const drop = weightDiff * Math.pow(fraction, 0.9);
    const projected = Number((startWeight - drop).toFixed(1));
    chartData.push({
      semana: w === 0 ? 'Hoy' : `Sem ${w}`,
      peso: projected,
    });
  }

  // Estimated goal target date
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + totalWeeks * 7);
  const targetDateString = targetDateObj.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  const currentSilhouette = (answers.current_body_type as any) || 'rectangle';
  const targetSilhouette = (answers.target_body_type as any)?.replace('_fit', '') || 'hourglass';

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between p-4 sm:p-5 max-w-md mx-auto w-full">
      {/* Top Bar */}
      <div className="text-center pt-2 pb-4">
        <span className="font-bold text-lg text-rose-950 tracking-tight">
          {brand.name}
        </span>
      </div>

      <div className="space-y-5 pb-8">
        {/* Header greeting */}
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/70 px-3 py-1 rounded-full">
            Diagnóstico Completado
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 leading-tight">
            {t('result.greeting', { name: answers.user_name || 'Amiga' })}
          </h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {t('result.subtitle')}
          </p>
        </div>

        {/* Silhouette Comparison Card */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-4">
            {t('result.silhouette_comparison.title')}
          </h3>
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Current */}
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 mb-1">
                {t('result.silhouette_comparison.current')}
              </span>
              <SilhouetteIcon type={currentSilhouette} isTarget={false} className="w-16 h-28" />
              <span className="text-xs font-bold text-slate-800 mt-2">
                {startWeight} {unitLabel}
              </span>
              <span className="text-[10px] text-slate-400">IMC {currentBmi}</span>
            </div>

            {/* Target */}
            <div className="flex flex-col items-center p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-800 mb-1">
                {t('result.silhouette_comparison.projected')}
              </span>
              <SilhouetteIcon type={targetSilhouette} isTarget={true} className="w-16 h-28" />
              <span className="text-xs font-bold text-rose-900 mt-2">
                {goalWeight} {unitLabel}
              </span>
              <span className="text-[10px] text-rose-700 font-semibold">IMC {targetBmi}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">
            {t('result.silhouette_comparison.notice')}
          </p>
        </div>

        {/* Projection Chart */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {t('result.chart.title')}
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('result.chart.subtitle')}
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                <Tooltip
                  formatter={(val: any) => [`${val} ${unitLabel}`, 'Peso estimado']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #FECDD3' }}
                />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="#BE123C"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#weightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Date Highlight */}
          <div className="mt-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-950">
                {t('result.chart.estimated_date')}
              </p>
              <p className="text-xs text-rose-800 font-bold capitalize">
                {targetDateString} ({t('result.chart.weeks_label', { weeks: totalWeeks })})
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-800 text-white flex items-center justify-center font-bold text-xs">
              🎯
            </div>
          </div>

          {answers.motivating_event && answers.motivating_event !== 'no_event' && (
            <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ✨ <strong>Motivación clave:</strong> Estarás en tu punto de mayor ligereza para tu evento.{' '}
              {answers.motivating_event_date && (
                <span>Fecha esperada: {new Date(answers.motivating_event_date).toLocaleDateString()}</span>
              )}
            </div>
          )}

          <p className="text-[10px] text-slate-400 mt-2 leading-tight">
            {t('result.chart.disclaimer')}
          </p>
        </div>

        {/* Diagnostic Key Points */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-600">{t('result.summary_card.preferred_movement')}</span>
            <span className="font-semibold text-slate-900 capitalize">
              {answers.workout_preference?.replace('_', ' ') || 'Pilates en pared'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-600">{t('result.summary_card.joint_care')}</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
              {t('result.summary_card.joint_care_adapted')}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-slate-600">{t('result.summary_card.daily_dedication')}</span>
            <span className="font-semibold text-slate-900">
              {answers.daily_time?.replace('_', ' ') || '15 min'}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Button
            size="xl"
            onClick={() => navigate('/planes')}
          >
            {t('result.cta')}
          </Button>
        </div>
      </div>
    </div>
  );
};
