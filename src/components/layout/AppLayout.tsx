import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { brand } from '@/src/config/brand';
import { gamificationService, GamificationState } from '@/src/services/gamificationService';
import {
  Home,
  Dumbbell,
  Compass,
  Award,
  User,
  Flame,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PWAInstallPrompt } from '../ui/PWAInstallPrompt';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GamificationState>(
    gamificationService.getState()
  );

  useEffect(() => {
    return gamificationService.subscribe((state) => {
      setGameState(state);
    });
  }, []);

  const levelInfo = gamificationService.getCurrentLevel();

  const navItems = [
    {
      to: '/app/hoy',
      label: 'Hoy',
      icon: Home,
    },
    {
      to: '/app/entrenar',
      label: 'Entrenar',
      icon: Dumbbell,
    },
    {
      to: '/app/camino',
      label: 'Camino',
      icon: Compass,
    },
    {
      to: '/app/logros',
      label: 'Logros',
      icon: Award,
    },
    {
      to: '/app/perfil',
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0EAE1] flex items-center justify-center p-0 sm:py-6 selection:bg-[#8B1E3F] selection:text-white">
      {/* Authentic Mobile Container Frame on Desktop */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] sm:rounded-[44px] bg-[#FFF9F3] shadow-2xl sm:border-8 sm:border-[#2A1E22]/10 overflow-hidden flex flex-col relative">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-[#FFF9F3]/90 backdrop-blur-md px-4 py-3 border-b border-stone-200/70 flex items-center justify-between min-h-[56px]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/app/hoy')}>
            <div className="w-8 h-8 rounded-xl bg-[#8B1E3F] text-[#FFF9F3] flex items-center justify-center font-serif font-bold text-base shadow-xs">
              L
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#2A1E22] tracking-tight block leading-tight">
                {brand.name}
              </span>
              <span className="text-[10px] text-stone-500 font-medium leading-none">
                Bienestar 35+
              </span>
            </div>
          </div>

          {/* Gamification Level & Streak Bar */}
          <div className="flex items-center gap-2">
            {/* Level Badge */}
            <div
              onClick={() => navigate('/app/logros')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 text-[#8B1E3F] text-[11px] font-bold cursor-pointer hover:bg-[#8B1E3F]/15 transition-colors"
              title={`${levelInfo.current.name} — ${gameState.xp} XP`}
            >
              <Sparkles className="w-3 h-3 text-[#8B1E3F]" />
              <span>Nivel {levelInfo.current.level}: {levelInfo.current.name}</span>
            </div>

            {/* Streak Flame Pill */}
            <div
              onClick={() => navigate('/app/hoy')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold cursor-pointer transition-colors ${
                gameState.streak > 0
                  ? 'bg-[#F4A582]/20 border-[#F4A582]/40 text-[#A34F2D]'
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}
              title={`Racha de ${gameState.streak} días`}
            >
              <Flame className={`w-3.5 h-3.5 ${gameState.streak > 0 ? 'text-[#F4A582] fill-current animate-pulse' : 'text-stone-400'}`} />
              <span>{gameState.streak}</span>
              {gameState.streakShieldAvailable && (
                <span title="Protector de racha disponible" className="inline-flex items-center">
                  <ShieldCheck className="w-3 h-3 text-[#8FAF9A]" />
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-none">
          <Outlet />
        </main>

        {/* Fixed Bottom Navigation (5 Tabs) */}
        <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-lg">
          <div className="grid grid-cols-5 h-16 items-center px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname.startsWith(item.to) ||
                (item.to === '/app/entrenar' && location.pathname.startsWith('/app/entrenos')) ||
                (item.to === '/app/perfil' &&
                  (location.pathname.startsWith('/app/cuenta') ||
                    location.pathname.startsWith('/app/progreso') ||
                    location.pathname.startsWith('/app/planes')));

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all select-none relative ${
                    isActive ? 'text-[#8B1E3F]' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  <span
                    className={`text-[10px] mt-1 tracking-tight transition-colors ${
                      isActive ? 'font-bold text-[#8B1E3F]' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8B1E3F]" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* PWA Install Notification Prompt */}
        <PWAInstallPrompt />
      </div>
    </div>
  );
};
