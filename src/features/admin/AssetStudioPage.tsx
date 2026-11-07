import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ASSET_MANIFEST, AssetManifestItem, AssetType } from '@/src/config/assets.manifest';
import { assetService, generateBrandPlaceholderSvg } from '@/src/services/assetService';
import {
  Sparkles,
  Download,
  Play,
  RotateCw,
  CheckCircle2,
  Trash2,
  Eye,
  Filter,
  Search,
  Check,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const AssetStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAdmin = searchParams.get('admin') === '1';

  const [assets, setAssets] = useState<AssetManifestItem[]>(ASSET_MANIFEST);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromptItem, setSelectedPromptItem] = useState<AssetManifestItem | null>(null);

  // Queue state
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });

  // Load existing assets from IndexedDB
  useEffect(() => {
    async function checkExisting() {
      const dbAssets = await assetService.getAll();
      setAssetUrls(dbAssets);

      setAssets((prev) =>
        prev.map((item) => {
          if (dbAssets[item.id]) {
            return { ...item, status: 'generated' };
          }
          return item;
        })
      );
    }
    checkExisting();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Acceso Restringido</h1>
        <p className="text-sm text-stone-600 mt-2 max-w-sm">
          El Asset Studio es un panel exclusivo de administración de diseño visual. Añade{' '}
          <code className="bg-stone-200 px-1 py-0.5 rounded text-rose-800">?admin=1</code> a la URL para acceder.
        </p>
        <Button
          variant="outline"
          size="md"
          className="mt-5"
          onClick={() => navigate('/app/hoy')}
        >
          Volver a la aplicación
        </Button>
      </div>
    );
  }

  // Filter items
  const filteredAssets = assets.filter((item) => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const generatedCount = Object.keys(assetUrls).length;
  const pendingCount = assets.length - generatedCount;

  // Single asset generator
  const generateSingleAsset = async (item: AssetManifestItem): Promise<boolean> => {
    try {
      // Call backend generation endpoint
      const response = await fetch('/api/admin/generate-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          prompt: item.prompt,
          aspectRatio: item.aspectRatio,
          type: item.type,
        }),
      });

      const data = await response.json();
      const finalUrl =
        data.dataUrl ||
        generateBrandPlaceholderSvg(item.id, item.name, item.type);

      await assetService.save(item.id, finalUrl, item);

      setAssetUrls((prev) => ({ ...prev, [item.id]: finalUrl }));
      setAssets((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: 'generated' } : a))
      );
      return true;
    } catch (e) {
      console.error(`Error generating ${item.id}:`, e);
      return false;
    }
  };

  // Concurrency-2 queue for "Generar faltantes"
  const handleGenerateMissing = async () => {
    const missing = assets.filter((item) => !assetUrls[item.id]);
    if (missing.length === 0) {
      alert('¡Todos los assets ya han sido generados!');
      return;
    }

    setIsProcessingQueue(true);
    setQueueProgress({ current: 0, total: missing.length });

    const concurrency = 2;
    let index = 0;

    const worker = async () => {
      while (index < missing.length) {
        const currentItem = missing[index++];
        await generateSingleAsset(currentItem);
        setQueueProgress((prev) => ({
          ...prev,
          current: Math.min(prev.total, prev.current + 1),
        }));
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    setIsProcessingQueue(false);
  };

  const handleApprove = (id: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    );
  };

  const handleDelete = async (id: string) => {
    await assetService.delete(id);
    setAssetUrls((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'pending' } : a))
    );
  };

  const handleExportZip = async () => {
    try {
      const blob = await assetService.exportZip();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ligera-assets-v2-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exportando ZIP: ' + String(err));
    }
  };

  const assetTypes: AssetType[] = [
    'character',
    'exercise_frame',
    'workout_cover',
    'module_cover',
    'home_header',
    'postcard',
    'badge',
    'recipe',
  ];

  return (
    <div className="min-h-screen bg-[#F0EAE1] p-4 sm:p-8 selection:bg-[#8B1E3F] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header & Stats */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#8B1E3F] uppercase tracking-wider bg-[#8B1E3F]/10 px-2.5 py-1 rounded-full">
                Ligera Studio v2
              </span>
              <span className="text-xs text-stone-500 font-mono">
                {assets.length} total manifest items
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl text-[#2A1E22]">
              Estudio de Assets con IA (Sofía & Ejercicios)
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Pipeline de generación previa y almacenamiento en IndexedDB. Nunca en tiempo de ejecución para la usuaria final.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              className="border-stone-300 text-stone-700 flex items-center gap-1.5 text-xs font-bold"
              onClick={handleExportZip}
            >
              <Download className="w-4 h-4" />
              <span>Exportar ZIP</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={isProcessingQueue}
              className="bg-[#8B1E3F] hover:bg-[#A32349] text-white flex items-center gap-1.5 text-xs font-bold shadow-sm"
              onClick={handleGenerateMissing}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isProcessingQueue
                  ? `Generando (${queueProgress.current}/${queueProgress.total})...`
                  : `Generar faltantes (${pendingCount})`}
              </span>
            </Button>
          </div>
        </div>

        {/* Progress bar during queue generation */}
        {isProcessingQueue && (
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>Procesando cola de generación (concurrencia 2)...</span>
              <span>{Math.round((queueProgress.current / queueProgress.total) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-[#8B1E3F] transition-all duration-300"
                style={{
                  width: `${(queueProgress.current / queueProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por ID, nombre o prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#8B1E3F]"
              />
            </div>

            {/* Type Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedType === 'all'
                    ? 'bg-[#8B1E3F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todos ({assets.length})
              </button>
              {assetTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    selectedType === type
                      ? 'bg-[#8B1E3F] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((item) => {
            const currentUrl = assetUrls[item.id];
            const hasGenerated = !!currentUrl;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-3xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between space-y-3 group"
              >
                {/* Thumbnail container */}
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
                  {currentUrl ? (
                    <img
                      src={currentUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#F3E9DC]/60 text-stone-400">
                      <Layers className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-mono">Pendiente</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase">
                    {item.aspectRatio}
                  </span>

                  <span
                    className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      hasGenerated
                        ? 'bg-[#8FAF9A] text-white'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {hasGenerated ? 'Generado' : 'Pendiente'}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <h4 className="font-bold text-xs text-[#2A1E22] line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-mono text-stone-400 truncate mt-0.5">
                    {item.id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-stone-100 text-xs">
                  <button
                    onClick={() => setSelectedPromptItem(item)}
                    className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                    title="Ver prompt detallado"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {hasGenerated && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar de almacenamiento local"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-stone-200 text-stone-700 py-1 px-2.5 rounded-xl text-[11px] font-bold"
                      onClick={() => generateSingleAsset(item)}
                    >
                      <RotateCw className="w-3 h-3 mr-1" />
                      {hasGenerated ? 'Re-generar' : 'Generar'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prompt Modal */}
        {selectedPromptItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
              <button
                onClick={() => setSelectedPromptItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider">
                  {selectedPromptItem.type} · Ratio {selectedPromptItem.aspectRatio}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2A1E22] mt-0.5">
                  {selectedPromptItem.name}
                </h3>
                <p className="text-[11px] font-mono text-stone-400">
                  {selectedPromptItem.id}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase">
                  Prompt Oficial Gemini Imagen
                </span>
                <p className="leading-relaxed font-sans">{selectedPromptItem.prompt}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSelectedPromptItem(null)}
                >
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="bg-[#8B1E3F] text-white"
                  onClick={() => {
                    generateSingleAsset(selectedPromptItem);
                    setSelectedPromptItem(null);
                  }}
                >
                  Generar ahora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
