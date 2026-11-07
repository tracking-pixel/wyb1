import React, { useEffect, useState } from 'react';
import { trackingService } from '@/src/services/tracking';
import { TrackingEventRecord } from '@/src/types';
import { useTranslation } from '@/src/i18n';

export const DebugPanel: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TrackingEventRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasDebugQuery, setHasDebugQuery] = useState(false);

  useEffect(() => {
    const checkQuery = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1') {
        setHasDebugQuery(true);
      }
    };
    checkQuery();

    const loadEvents = () => {
      setEvents(trackingService.getEventsQueue());
    };
    loadEvents();

    const handleNewEvent = () => {
      loadEvents();
    };

    window.addEventListener('ligera_track_event', handleNewEvent);
    window.addEventListener('ligera_track_event_cleared', loadEvents);

    return () => {
      window.removeEventListener('ligera_track_event', handleNewEvent);
      window.removeEventListener('ligera_track_event_cleared', loadEvents);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    trackingService.clearQueue();
    setEvents([]);
  };

  // Always show floating debug trigger when ?debug=1, or subtle toggle in corner
  if (!hasDebugQuery && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-3 z-50 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-[10px] text-white/90 rounded-md shadow-md backdrop-blur-xs transition opacity-60 hover:opacity-100"
        title="Tracking Debug (?debug=1)"
      >
        Track Debug ({events.length})
      </button>
    );
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 text-white text-xs font-semibold rounded-full shadow-lg border border-rose-700 animate-pulse"
        >
          <span>DataLayer Debug</span>
          <span className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-[10px]">
            {events.length}
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div>
                <h3 className="font-bold text-base text-rose-400">
                  {t('tracking_debug.title')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('tracking_debug.events_count', { count: events.length })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  {copied ? t('tracking_debug.copied') : t('tracking_debug.copy_json')}
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 transition"
                >
                  {t('tracking_debug.clear_events')}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Attribution summary */}
            <div className="p-3 bg-slate-900/40 border-b border-slate-800 text-xs text-slate-300">
              <span className="font-medium text-slate-400">Atribución actual: </span>
              <code className="text-amber-300">
                {JSON.stringify(trackingService.getAttribution(), null, 1).replace(/[\{\}]/g, '')}
              </code>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {events.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No hay eventos registrados aún. Interactúa con el funil para ver eventos.
                </p>
              ) : (
                events.map((evt, idx) => (
                  <div
                    key={evt.event_id || idx}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-sm">
                        {evt.event_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      event_id: <span className="text-slate-300">{evt.event_id}</span>
                    </div>
                    <details className="text-[11px] text-slate-400 mt-1 cursor-pointer">
                      <summary className="text-rose-400 hover:underline">Ver payload</summary>
                      <pre className="mt-1 p-2 rounded bg-slate-950 text-slate-300 overflow-x-auto text-[10px]">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
