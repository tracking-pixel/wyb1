import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';

export const ProgresoTab: React.FC = () => {
  const { t } = useTranslation();
  const { answers } = useQuizStore();
  const { weightLogs, logWeight, streak, completedDays } = useWorkoutStore();

  const [newWeight, setNewWeight] = useState('');
  const [waistCm, setWaistCm] = useState('78');
  const [hipsCm, setHipsCm] = useState('102');
  const [chestCm, setChestCm] = useState('94');

  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  const isMetric = answers.units === 'metric';
  const unitLabel = isMetric ? 'kg' : 'lb';

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 30 && val < 300) {
      logWeight(val);
      setNewWeight('');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (slot === 'before') setBeforePhoto(reader.result as string);
        else setAfterPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentWeight = weightLogs[weightLogs.length - 1]?.weightKg || answers.current_weight_kg;
  const initialWeight = weightLogs[0]?.weightKg || answers.current_weight_kg;
  const totalLost = Number((initialWeight - currentWeight).toFixed(1));

  return (
    <div className="space-y-5 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {t('app.progreso.title')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('app.progreso.subtitle')}
        </p>
      </div>

      {/* High-level KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            {t('app.progreso.current_weight')}
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {currentWeight} <span className="text-sm font-semibold text-slate-500">{unitLabel}</span>
          </p>
          <span className="text-[10px] text-slate-400">Objetivo: {answers.target_weight_kg} {unitLabel}</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            {t('app.progreso.weight_lost')}
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {totalLost > 0 ? `-${totalLost}` : '0.0'} <span className="text-sm font-semibold text-emerald-600">{unitLabel}</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">¡Gran avance!</span>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t('app.progreso.chart_title')}
        </h3>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
              <Tooltip
                formatter={(val: any) => [`${val} ${unitLabel}`, 'Peso']}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #FECDD3' }}
              />
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#9F1239"
                strokeWidth={3}
                dot={{ r: 4, fill: '#9F1239' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Log new weight form */}
        <form onSubmit={handleAddWeight} className="pt-2 flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            placeholder={t('app.progreso.weight_input_placeholder')}
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 min-h-[44px] px-3.5 text-xs rounded-xl border border-slate-300 focus:outline-rose-800"
          />
          <Button type="submit" size="sm" className="min-h-[44px]">
            {t('common.save')}
          </Button>
        </form>
      </div>

      {/* Body Measurements */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {t('app.progreso.measurements_title')}
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[10px] font-semibold text-slate-500">
              {t('app.progreso.waist')}
            </span>
            <input
              type="text"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              className="w-full text-center font-bold text-base text-rose-950 bg-transparent border-b border-rose-300 mt-1 focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[10px] font-semibold text-slate-500">
              {t('app.progreso.hips')}
            </span>
            <input
              type="text"
              value={hipsCm}
              onChange={(e) => setHipsCm(e.target.value)}
              className="w-full text-center font-bold text-base text-rose-950 bg-transparent border-b border-rose-300 mt-1 focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[10px] font-semibold text-slate-500">
              {t('app.progreso.chest')}
            </span>
            <input
              type="text"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              className="w-full text-center font-bold text-base text-rose-950 bg-transparent border-b border-rose-300 mt-1 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Private Progress Photos Slots */}
      <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('app.progreso.photos_title')}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {t('app.progreso.photos_note')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Before Photo */}
          <label className="relative h-44 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition flex flex-col items-center justify-center p-3 text-center cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, 'before')}
            />
            {beforePhoto ? (
              <img
                src={beforePhoto}
                alt="Foto inicial"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <span className="text-2xl mb-1">📷</span>
                <span className="text-xs font-bold text-rose-900">Foto Inicial</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Toca para subir</span>
              </>
            )}
          </label>

          {/* After Photo */}
          <label className="relative h-44 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition flex flex-col items-center justify-center p-3 text-center cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, 'after')}
            />
            {afterPhoto ? (
              <img
                src={afterPhoto}
                alt="Foto actual"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <span className="text-2xl mb-1">✨</span>
                <span className="text-xs font-bold text-rose-900">Foto Actual</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Toca para subir</span>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};
