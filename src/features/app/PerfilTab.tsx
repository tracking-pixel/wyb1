import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { authService } from '@/src/services/auth';
import { entitlementService } from '@/src/services/entitlements';
import { gamificationService, GamificationState } from '@/src/services/gamificationService';
import { useUserStore } from '@/src/store/userStore';
import { useQuizStore } from '@/src/store/quizStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import {
  User,
  TrendingDown,
  ShoppingBag,
  Settings,
  Sparkles,
  Flame,
  ShieldCheck,
  Plus,
  Camera,
  CheckCircle2,
  Lock,
  RotateCcw,
  LogOut,
  X,
  CreditCard,
  Sliders,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const PerfilTab: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUserStore();
  const { answers, setAnswer } = useQuizStore();
  const { weightLogs, logWeight } = useWorkoutStore();

  const [activeSection, setActiveSection] = useState<'progreso' | 'planes' | 'ajustes'>('progreso');
  const [gameState, setGameState] = useState<GamificationState>(
    gamificationService.getState()
  );

  // Weight tracking state
  const [newWeight, setNewWeight] = useState('');
  const [waistCm, setWaistCm] = useState('78');
  const [hipsCm, setHipsCm] = useState('102');
  const [chestCm, setChestCm] = useState('94');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  // Retention modal state
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [retentionMessage, setRetentionMessage] = useState<string | null>(null);

  useEffect(() => {
    return gamificationService.subscribe((st) => setGameState(st));
  }, []);

  const isMetric = answers.units === 'metric';
  const unitLabel = isMetric ? 'kg' : 'lb';

  const currentWeight =
    weightLogs[weightLogs.length - 1]?.weightKg || answers.current_weight_kg || 68;
  const initialWeight =
    weightLogs[0]?.weightKg || answers.current_weight_kg || 70;
  const targetWeight = answers.target_weight_kg || 62;
  const totalLost = Number((initialWeight - currentWeight).toFixed(1));

  const levelInfo = gamificationService.getCurrentLevel();

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 30 && val < 300) {
      logWeight(val);
      setNewWeight('');
    }
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'before' | 'after'
  ) => {
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

  const handleToggleUnits = () => {
    const next = isMetric ? 'imperial' : 'metric';
    setAnswer('units', next);
  };

  const handleSetDay1 = () => {
    gamificationService.resetToDay1();
    alert('Restablecido a estado de Día 1 (nueva usuaria).');
  };

  const handleSetDay4Demo = () => {
    gamificationService.resetToDay4Demo();
    alert('Restablecido a estado coherente de Día 4 (demo con racha de 3 días).');
  };

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
    setRetentionMessage('Tu suscripción ha sido cancelada.');
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
    <div className="space-y-4 p-4 pb-8">
      {/* User Header Profile Card */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B1E3F] to-[#F4A582] text-white flex items-center justify-center font-serif font-bold text-xl shadow-md">
            {answers.user_name ? answers.user_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1">
            <h1 className="font-serif font-bold text-lg text-[#2A1E22]">
              {answers.user_name || 'Mi Perfil'}
            </h1>
            <p className="text-xs text-stone-500">{user?.email || 'usuaria@ligera.fit'}</p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-[#8B1E3F]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nivel {levelInfo.current.level}: {levelInfo.current.name} ({gameState.xp} XP)</span>
            </div>
          </div>
        </div>

        {/* 3 Sub-Navigation Segmented Buttons */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-2xl">
          <button
            onClick={() => setActiveSection('progreso')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeSection === 'progreso'
                ? 'bg-white text-[#8B1E3F] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Progreso</span>
          </button>

          <button
            onClick={() => setActiveSection('planes')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeSection === 'planes'
                ? 'bg-white text-[#8B1E3F] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Planes</span>
          </button>

          <button
            onClick={() => setActiveSection('ajustes')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeSection === 'ajustes'
                ? 'bg-white text-[#8B1E3F] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-SECTION 1: PROGRESO
      ======================================================== */}
      {activeSection === 'progreso' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Weight Stats Summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs text-center">
              <span className="text-[10px] text-stone-400 block font-medium">Inicial</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                {initialWeight} {unitLabel}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 text-center">
              <span className="text-[10px] text-[#8B1E3F] block font-bold">Actual</span>
              <span className="text-base font-bold text-[#8B1E3F] font-mono">
                {currentWeight} {unitLabel}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs text-center">
              <span className="text-[10px] text-stone-400 block font-medium">Meta</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                {targetWeight} {unitLabel}
              </span>
            </div>
          </div>

          {/* Weight Evolution Chart */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xs text-[#2A1E22]">
                Evolución de Peso
              </h3>
              <span className="text-[11px] font-bold text-[#8FAF9A]">
                {totalLost > 0 ? `-${totalLost} ${unitLabel}` : 'En balance'}
              </span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightLogs}>
                  <XAxis dataKey="date" stroke="#A8A29E" fontSize={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#A8A29E" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2A1E22',
                      color: '#FFF9F3',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    stroke="#8B1E3F"
                    strokeWidth={3}
                    dot={{ fill: '#F4A582', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Log Form */}
            <form onSubmit={handleAddWeight} className="flex gap-2 pt-2 border-t border-stone-100">
              <input
                type="number"
                step="0.1"
                placeholder={`Nuevo peso (${unitLabel})`}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#8B1E3F]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#8B1E3F] text-white px-4 rounded-xl text-xs font-bold"
              >
                Registrar
              </Button>
            </form>
          </div>

          {/* Measurements */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-xs text-[#2A1E22]">
              Medidas Corporales (cm)
            </h3>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] text-stone-400 block">Cintura</span>
                <input
                  type="text"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="w-full text-center font-bold text-sm bg-transparent text-[#2A1E22] focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] text-stone-400 block">Cadera</span>
                <input
                  type="text"
                  value={hipsCm}
                  onChange={(e) => setHipsCm(e.target.value)}
                  className="w-full text-center font-bold text-sm bg-transparent text-[#2A1E22] focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] text-stone-400 block">Pecho</span>
                <input
                  type="text"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  className="w-full text-center font-bold text-sm bg-transparent text-[#2A1E22] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Before & After Photos */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <h3 className="font-serif font-bold text-xs text-[#2A1E22]">
              Fotos de Comparación Privadas
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="aspect-3/4 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-stone-50 transition-colors overflow-hidden relative">
                {beforePhoto ? (
                  <img src={beforePhoto} alt="Antes" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-stone-400 mb-1" />
                    <span className="text-[11px] font-bold text-stone-600">Día 1 (Antes)</span>
                    <span className="text-[9px] text-stone-400">Toca para subir</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'before')}
                />
              </label>

              <label className="aspect-3/4 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-stone-50 transition-colors overflow-hidden relative">
                {afterPhoto ? (
                  <img src={afterPhoto} alt="Hoy" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-[#8B1E3F] mb-1" />
                    <span className="text-[11px] font-bold text-[#8B1E3F]">Día 28 (Hoy)</span>
                    <span className="text-[9px] text-stone-400">Toca para subir</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, 'after')}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-SECTION 2: PLANES & TIENDA
      ======================================================== */}
      {activeSection === 'planes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Active Plan Card */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider block">
                  Tu Suscripción
                </span>
                <h3 className="font-serif font-bold text-base text-[#2A1E22] capitalize">
                  {user?.subscription?.planId
                    ? `Plan ${user.subscription.planId.replace(/_/g, ' ')}`
                    : 'Plan Ligera 28 Días'}
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-[#8FAF9A]/20 text-[#406852] px-2.5 py-1 rounded-full">
                {user?.subscription?.status === 'active' ? 'Activo' : 'En pausa'}
              </span>
            </div>

            <div className="text-xs text-stone-600 flex justify-between pt-1 border-t border-stone-100">
              <span>Próxima renovación</span>
              <span className="font-semibold text-stone-800">
                {user?.subscription?.renewAt
                  ? new Date(user.subscription.renewAt).toLocaleDateString()
                  : 'Automática'}
              </span>
            </div>

            <button
              onClick={() => setShowRetentionModal(true)}
              className="text-[11px] font-semibold text-rose-700 hover:underline pt-1 block"
            >
              Gestionar o cancelar suscripción
            </button>
          </div>

          {/* Add-ons Store */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#2A1E22]">
              Desbloquear Nuevos Módulos
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#2A1E22]">
                    Comidas Antiinflamatorias
                  </p>
                  <p className="text-[10px] text-stone-500">
                    4 semanas con recetas latinas fáciles
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#8B1E3F] text-white text-[11px] px-3 py-1 rounded-xl"
                  onClick={() => {
                    entitlementService.grant('meal_plan');
                    refreshUser();
                    alert('¡Módulo de Comidas desbloqueado con éxito!');
                  }}
                >
                  {entitlementService.has('meal_plan') ? 'Activo ✓' : '$14.99'}
                </Button>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#2A1E22]">
                    Yoga Facial 21 Días
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Tonificación muscular de rostro y cuello
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#8B1E3F] text-white text-[11px] px-3 py-1 rounded-xl"
                  onClick={() => {
                    entitlementService.grant('face_yoga');
                    refreshUser();
                    alert('¡Módulo de Yoga Facial desbloqueado con éxito!');
                  }}
                >
                  {entitlementService.has('face_yoga') ? 'Activo ✓' : '$14.99'}
                </Button>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#2A1E22]">
                    Coach IA Personal Sofía
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Acompañamiento 24/7 sin juicio
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#8B1E3F] text-white text-[11px] px-3 py-1 rounded-xl"
                  onClick={() => {
                    entitlementService.grant('ai_coach');
                    refreshUser();
                    alert('¡Coach IA Sofía desbloqueado con éxito!');
                  }}
                >
                  {entitlementService.has('ai_coach') ? 'Activo ✓' : '$9.99/mes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-SECTION 3: AJUSTES & DEMO CONTROL
      ======================================================== */}
      {activeSection === 'ajustes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Units Switcher */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-[#2A1E22]">
                Sistema de Unidades
              </p>
              <p className="text-[10px] text-stone-500">
                {isMetric ? 'Métrico (kg / cm)' : 'Imperial (lb / ft)'}
              </p>
            </div>
            <button
              onClick={handleToggleUnits}
              className="px-3 py-1.5 rounded-full border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cambiar a {isMetric ? 'Imperial (lb)' : 'Métrico (kg)'}
            </button>
          </div>

          {/* Demo Mode Consistency Switcher */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#8B1E3F]" />
              <h3 className="font-bold text-xs text-[#2A1E22]">
                Modo de Demostración (Evaluación)
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Alterna entre el estado de demostración coherente (Día 4 con racha de 3 días) y el estado limpio de nueva usuaria (Día 1).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSetDay4Demo}
                className="p-2.5 rounded-2xl bg-[#8B1E3F]/10 border border-[#8B1E3F]/30 text-[#8B1E3F] text-xs font-bold hover:bg-[#8B1E3F]/20"
              >
                Día 4 (Demo Activo)
              </button>
              <button
                onClick={handleSetDay1}
                className="p-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-200"
              >
                Día 1 (Nueva Usuaria)
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Subscription Retention Modal */}
      {showRetentionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
            <button
              onClick={() => setShowRetentionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-[#2A1E22]">
              ¿Necesitas una pausa en tu rutina?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cuidar tu cuerpo no es una carrera. Antes de cancelar, puedes pausar sin costo o disfrutar de un descuento especial para mantener tu ritmo.
            </p>

            {retentionMessage ? (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                {retentionMessage}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-[#8FAF9A] hover:bg-[#72927e] text-white py-2.5 rounded-2xl text-xs font-bold"
                  onClick={handlePause}
                >
                  Pausar suscripción por 30 días gratis
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-[#8B1E3F] text-[#8B1E3F] hover:bg-[#8B1E3F]/5 py-2.5 rounded-2xl text-xs font-bold"
                  onClick={handleDiscount}
                >
                  Quedarme con 30% de descuento
                </Button>

                <button
                  onClick={handleConfirmCancel}
                  className="text-stone-400 hover:text-stone-600 text-[11px] underline block mx-auto pt-1"
                >
                  Confirmar cancelación
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
