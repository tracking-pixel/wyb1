import esTranslations from './es.json';

type NestedObject = { [key: string]: any };

const translations: NestedObject = esTranslations;

/**
 * Función de traducción para obtener cadenas de texto desde es.json.
 * Soporta claves anidadas tipo 'quiz.steps.primary_goal.title'
 * y reemplazo de variables tipo {{name}}, {{count}}, etc.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  if (!key) return '';

  const keys = key.split('.');
  let current: any = translations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Clave no encontrada, retorna la clave como fallback
      return key;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  let result = current;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }
  }

  return result;
}

export function useTranslation() {
  return { t };
}
