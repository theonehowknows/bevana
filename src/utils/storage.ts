import { Blueprint, ThemeMode } from '../types/blueprint';

const BLUEPRINTS_KEY = 'vibe_blueprint_library_v1';
const ACTIVE_DRAFT_KEY = 'vibe_blueprint_active_draft_v1';
const THEME_KEY = 'vibe_blueprint_theme';

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadBlueprints(fallback: Blueprint[]): Blueprint[] {
  try {
    const raw = localStorage.getItem(BLUEPRINTS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Blueprint[];
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveBlueprints(blueprints: Blueprint[]): void {
  try {
    localStorage.setItem(BLUEPRINTS_KEY, JSON.stringify(blueprints));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadActiveDraft(fallback: Blueprint): Blueprint {
  try {
    const raw = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Blueprint>;
    if (parsed && typeof parsed.appName === 'string' && parsed.environment && parsed.aesthetic) {
      return {
        ...fallback,
        ...parsed,
        referenceScope: { ...fallback.referenceScope, ...parsed.referenceScope },
        environment: { ...fallback.environment, ...parsed.environment },
        aesthetic: { ...fallback.aesthetic, ...parsed.aesthetic },
        dataModel: { ...fallback.dataModel, ...parsed.dataModel },
        features: Array.isArray(parsed.features) ? parsed.features : fallback.features,
        constraints: Array.isArray(parsed.constraints) ? parsed.constraints : fallback.constraints,
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveActiveDraft(blueprint: Blueprint): void {
  try {
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(blueprint));
  } catch {
    // Ignore storage quota errors
  }
}
