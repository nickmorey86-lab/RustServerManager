import type { ThemeDefinition } from "./themeTypes";

// Load custom themes (not defaults)
export function loadStoredThemes(): ThemeDefinition[] {
  try {
    const raw = localStorage.getItem("themes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveThemes(themes: ThemeDefinition[]) {
  localStorage.setItem("themes", JSON.stringify(themes));
}

// Load/save active theme ID
export function loadThemeId(): string | null {
  return localStorage.getItem("activeThemeId");
}

export function saveThemeId(id: string) {
  localStorage.setItem("activeThemeId", id);
}