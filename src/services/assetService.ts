import JSZip from 'jszip';
import { ASSET_MANIFEST, AssetManifestItem } from '../config/assets.manifest';

const DB_NAME = 'ligera_assets_db';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generates an elegant brand SVG placeholder data URL when no real generated image exists yet.
 * Never returns a plain gray box.
 */
export function generateBrandPlaceholderSvg(
  id: string,
  title?: string,
  type?: string
): string {
  const cleanTitle = (title || id.replace(/_/g, ' ')).slice(0, 32);

  // Choose accent tones based on type
  let gradientStart = '#8B1E3F'; // Vino
  let gradientEnd = '#F4A582';   // Durazno
  let iconPath = '';

  if (type === 'exercise_frame') {
    gradientStart = '#5A1827';
    gradientEnd = '#8B1E3F';
    // Elegant fitness/movement icon
    iconPath = `
      <circle cx="200" cy="100" r="28" fill="#FFF9F3" opacity="0.95"/>
      <path d="M190 140 C175 160, 165 210, 160 270" stroke="#FFF9F3" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M210 140 C225 170, 235 220, 240 270" stroke="#FFF9F3" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M150 180 Q200 160 250 180" stroke="#FFF9F3" stroke-width="12" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === 'badge') {
    gradientStart = '#F4A582';
    gradientEnd = '#8FAF9A';
    // Medal star
    iconPath = `
      <circle cx="200" cy="180" r="70" fill="#FFF9F3" opacity="0.2"/>
      <polygon points="200,120 216,164 263,164 225,192 239,236 200,208 161,236 175,192 137,164 184,164" fill="#FFF9F3"/>
    `;
  } else if (type === 'postcard') {
    gradientStart = '#8FAF9A';
    gradientEnd = '#F3E9DC';
    // Mountain landscape
    iconPath = `
      <polygon points="90,260 170,140 250,260" fill="#FFF9F3" opacity="0.4"/>
      <polygon points="180,260 250,160 320,260" fill="#FFF9F3" opacity="0.6"/>
      <circle cx="140" cy="110" r="24" fill="#FFF9F3" opacity="0.8"/>
    `;
  } else {
    // Default leaf / wellness emblem
    iconPath = `
      <path d="M200,110 C250,110 270,170 270,220 C220,220 200,180 200,110 Z" fill="#FFF9F3" opacity="0.85"/>
      <path d="M200,110 C150,110 130,170 130,220 C180,220 200,180 200,110 Z" fill="#FFF9F3" opacity="0.6"/>
      <line x1="200" y1="120" x2="200" y2="260" stroke="#FFF9F3" stroke-width="6" stroke-linecap="round"/>
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}"/>
        <stop offset="100%" stop-color="${gradientEnd}"/>
      </linearGradient>
      <linearGradient id="overlayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="rgba(42,30,34,0.75)"/>
        <stop offset="100%" stop-color="rgba(42,30,34,0)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="320" fill="url(#bgGrad)"/>
    <g opacity="0.15">
      <circle cx="50" cy="50" r="120" fill="#FFF9F3"/>
      <circle cx="350" cy="270" r="100" fill="#FFF9F3"/>
    </g>
    ${iconPath}
    <rect width="400" height="320" fill="url(#overlayGrad)"/>
    <text x="200" y="285" fill="#FFF9F3" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="14" text-anchor="middle" letter-spacing="0.5">
      ${cleanTitle}
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

class AssetService {
  private memoryCache: Map<string, string> = new Map();

  async get(id: string): Promise<string> {
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    try {
      const db = await openDB();
      const item: any = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (item && item.dataUrl) {
        this.memoryCache.set(id, item.dataUrl);
        return item.dataUrl;
      }
    } catch {
      // IndexedDB failed or in private browsing; gracefully fallback
    }

    // Lookup metadata in manifest for better fallback
    const manifestItem = ASSET_MANIFEST.find((m) => m.id === id);
    const fallback = generateBrandPlaceholderSvg(
      id,
      manifestItem?.name,
      manifestItem?.type
    );
    this.memoryCache.set(id, fallback);
    return fallback;
  }

  async has(id: string): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(!!req.result?.dataUrl);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  async save(
    id: string,
    dataUrl: string,
    meta?: Partial<AssetManifestItem>
  ): Promise<void> {
    this.memoryCache.set(id, dataUrl);
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const payload = {
          id,
          dataUrl,
          meta,
          updatedAt: new Date().toISOString(),
        };
        const req = store.put(payload);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to persist asset to IndexedDB:', e);
    }
  }

  async delete(id: string): Promise<void> {
    this.memoryCache.delete(id);
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to delete asset from IndexedDB:', e);
    }
  }

  async getAll(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    try {
      const db = await openDB();
      const records: any[] = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      for (const rec of records) {
        if (rec.id && rec.dataUrl) {
          result[rec.id] = rec.dataUrl;
        }
      }
    } catch {
      // Return whatever is in memory cache
      this.memoryCache.forEach((v, k) => {
        result[k] = v;
      });
    }
    return result;
  }

  async exportZip(): Promise<Blob> {
    const zip = new JSZip();
    const assets = await this.getAll();
    const manifestExport: any[] = [];

    const imgFolder = zip.folder('images');

    for (const [id, dataUrl] of Object.entries(assets)) {
      manifestExport.push({ id, hasImage: true });

      if (dataUrl.startsWith('data:image/svg+xml')) {
        const svgContent = decodeURIComponent(dataUrl.replace('data:image/svg+xml;utf8,', ''));
        imgFolder?.file(`${id}.svg`, svgContent);
      } else if (dataUrl.startsWith('data:image/')) {
        // extract base64
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const ext = mime.split('/')[1] || 'png';
        const base64Data = parts[1];
        imgFolder?.file(`${id}.${ext}`, base64Data, { base64: true });
      }
    }

    zip.file('manifest.json', JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      count: Object.keys(assets).length,
      assets: manifestExport,
    }, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }
}

export const assetService = new AssetService();
