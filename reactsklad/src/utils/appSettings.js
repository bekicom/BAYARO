const STORAGE_KEY = "bayaro_app_settings";

export const APP_SETTINGS_DEFAULTS = {
  onScreenKeyboardEnabled: true,
};

export function getAppSettings() {
  if (typeof window === "undefined") return APP_SETTINGS_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return APP_SETTINGS_DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...APP_SETTINGS_DEFAULTS,
      ...parsed,
      onScreenKeyboardEnabled:
        parsed?.onScreenKeyboardEnabled !== false,
    };
  } catch {
    return APP_SETTINGS_DEFAULTS;
  }
}

export function saveAppSettings(settings) {
  if (typeof window === "undefined") return;
  const next = { ...APP_SETTINGS_DEFAULTS, ...settings };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("bayaro:app-settings", { detail: next }));
}
