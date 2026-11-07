import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Download, Share2, Sparkles, X, Check } from 'lucide-react';

interface ShareStoryProps {
  workoutTitle: string;
  durationMinutes: number;
  streakDays: number;
  caminoKm: number;
  xpEarned: number;
  userName?: string;
  onClose: () => void;
}

export const ShareStoryCanvas: React.FC<ShareStoryProps> = ({
  workoutTitle,
  durationMinutes,
  streakDays,
  caminoKm,
  xpEarned,
  userName = 'Amiga',
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size: 1080 x 1920 (Instagram Stories standard 9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0, '#5A1827');
    bgGradient.addColorStop(0.35, '#8B1E3F');
    bgGradient.addColorStop(0.85, '#2A1E22');
    bgGradient.addColorStop(1, '#1A1215');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative radial aura
    const radial = ctx.createRadialGradient(540, 600, 50, 540, 600, 600);
    radial.addColorStop(0, 'rgba(244, 165, 130, 0.25)');
    radial.addColorStop(1, 'rgba(139, 30, 63, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Header Brand
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F4A582';
    ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('L I G E R A', 540, 180);

    ctx.fillStyle = '#FFF9F3';
    ctx.font = '300 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Bienestar y vitalidad para mujeres 35+', 540, 225);

    // 3. Central Trophy / Badge Box
    ctx.fillStyle = 'rgba(255, 249, 243, 0.08)';
    ctx.strokeStyle = 'rgba(244, 165, 130, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 320, 800, 780, 48);
    ctx.fill();
    ctx.stroke();

    // Icon Circle
    ctx.fillStyle = '#8B1E3F';
    ctx.beginPath();
    ctx.arc(540, 460, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F4A582';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Sparkle emblem in circle
    ctx.fillStyle = '#FFF9F3';
    ctx.font = '64px sans-serif';
    ctx.fillText('✨', 540, 482);

    // Headline
    ctx.fillStyle = '#FFF9F3';
    ctx.font = 'bold 54px "Fraunces", Georgia, serif';
    ctx.fillText('¡Entrenamiento completado!', 540, 620);

    ctx.fillStyle = '#F3E9DC';
    ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(workoutTitle, 540, 680);

    ctx.fillStyle = '#F4A582';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${userName} · ${new Date().toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' })}`, 540, 730);

    // 3 Stat Badges inside central box
    const drawPill = (x: number, y: number, w: number, h: number, label: string, val: string) => {
      ctx.fillStyle = 'rgba(255, 249, 243, 0.12)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 24);
      ctx.fill();

      ctx.fillStyle = '#F4A582';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(val, x + w / 2, y + 60);

      ctx.fillStyle = '#FFF9F3';
      ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(label, x + w / 2, y + 95);
    };

    drawPill(180, 800, 220, 130, 'Minutos', `${durationMinutes} min`);
    drawPill(430, 800, 220, 130, 'Racha', `${streakDays} días`);
    drawPill(680, 800, 220, 130, 'Energía', `+${xpEarned} XP`);

    // Progress milestone banner
    ctx.fillStyle = 'rgba(143, 175, 154, 0.2)';
    ctx.beginPath();
    ctx.roundRect(180, 960, 720, 90, 20);
    ctx.fill();
    ctx.fillStyle = '#8FAF9A';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`📍 ${caminoKm} km recorridos en El Camino de Santiago`, 540, 1016);

    // 4. Quote Card
    ctx.fillStyle = 'rgba(42, 30, 34, 0.6)';
    ctx.beginPath();
    ctx.roundRect(140, 1160, 800, 320, 36);
    ctx.fill();

    ctx.fillStyle = '#FFF9F3';
    ctx.font = 'italic 34px "Fraunces", Georgia, serif';
    ctx.fillText('“La constancia amable y diaria', 540, 1270);
    ctx.fillText('supera cualquier esfuerzo agotador.”', 540, 1330);

    ctx.fillStyle = '#F4A582';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('— Sofía, Coach Oficial de Ligera', 540, 1400);

    // 5. Footer CTA
    ctx.fillStyle = '#F3E9DC';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Únete en Ligera · app.ligera.fit', 540, 1750);

    // Convert to dataURL
    try {
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch (e) {
      console.warn('Canvas export error:', e);
    }
  }, [workoutTitle, durationMinutes, streakDays, caminoKm, xpEarned, userName]);

  const handleShare = async () => {
    if (navigator.share && imageUrl) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'ligera-entrenamiento.png', {
          type: 'image/png',
        });
        await navigator.share({
          title: 'Mi entrenamiento en Ligera',
          text: `¡Completé mi sesión de hoy en Ligera! Racha de ${streakDays} días activa. ✨`,
          files: [file],
        });
        return;
      } catch (err) {
        // Fallback to image download
      }
    }
    handleDownload();
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `ligera-entrenamiento-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#1A1215] text-[#FFF9F3] rounded-3xl p-5 shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de historia"
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 text-[#F4A582] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Tarjeta para Historia</span>
        </div>

        {/* Hidden high-res canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scaled preview */}
        <div className="w-full aspect-9/16 rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/40 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Historia de Instagram"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
              Generando diseño...
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="w-full flex items-center gap-3 mt-4">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 bg-[#8B1E3F] hover:bg-[#A32349] text-white flex items-center justify-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white/20 hover:bg-white/10 text-white flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copied ? 'Guardado' : 'Guardar'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
