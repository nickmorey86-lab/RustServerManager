// src/contexts/themeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ThemeDefinition } from "./themeTypes";

/**
 * ThemeContext
 *
 * Responsibilities:
 * - Load available themes from the main process (window.themeAPI.loadAll)
 * - Track the active theme and apply it to the document (CSS variables + fonts)
 * - Persist the active theme id (window.themeAPI.saveThemeId or localStorage)
 * - Expose a setter that applies the theme immediately (setActiveTheme)
 */

/* -------------------------
   Context types and defaults
   ------------------------- */

interface ThemeContextShape {
  themes: ThemeDefinition[];
  setThemes: React.Dispatch<React.SetStateAction<ThemeDefinition[]>>;
  activeTheme: ThemeDefinition | null;
  setActiveTheme: (t: ThemeDefinition) => void;
}

const ThemeContext = createContext<ThemeContextShape>({
  themes: [],
  setThemes: (() => { }) as React.Dispatch<React.SetStateAction<ThemeDefinition[]>>,
  activeTheme: null,
  setActiveTheme: () => { }
});

export function useTheme() {
  return useContext(ThemeContext);
}

/* -------------------------
   Helpers
   ------------------------- */

function safeSetCssVar(name: string, value: string) {
  try {
    document.documentElement.style.setProperty(name, value);
  } catch {
    // ignore in environments without DOM
  }
}

function guessFontFormat(url: string) {
  const u = url.toLowerCase();
  if (u.endsWith(".woff2")) return "woff2";
  if (u.endsWith(".woff")) return "woff";
  if (u.endsWith(".ttf")) return "truetype";
  if (u.endsWith(".otf")) return "opentype";
  return "truetype";
}

/* -------------------------
   Apply theme to document
   ------------------------- */

function applyThemeToDocument(theme: ThemeDefinition) {

  // -----------------------------
  // Colors + background + aliases
  // -----------------------------
  try {
    const colors = theme.colors ?? {};

    // 1) Canonical theme variables (keeps existing mapping)
    Object.entries(colors).forEach(([k, v]) => {
      safeSetCssVar(`--theme-${k}`, String(v ?? ""));
    });

    // 2) Common aliases used across the app (explicit mapping)
    // Text / typography
    safeSetCssVar("--card-text", colors.text ?? "");
    safeSetCssVar("--card-text-muted", colors.textMuted ?? "");
    safeSetCssVar("--primary-text", colors.primaryText ?? "");
    safeSetCssVar("--secondary-text", colors.secondaryText ?? "");

    // Sidebar
    safeSetCssVar("--sidebar-bg", colors.sidebarBg ?? "");
    safeSetCssVar("--sidebar-text", colors.sidebarText ?? "");
    safeSetCssVar("--sidebar-hover", colors.sidebarHover ?? "");
    safeSetCssVar("--sidebar-active", colors.sidebarActive ?? "");

    // Panels / surfaces
    safeSetCssVar("--panel-bg", colors.panelBg ?? "");
    safeSetCssVar("--panel-border", colors.panelBorder ?? "");
    safeSetCssVar("--panel-shadow", colors.panelShadow ?? "");

    // Primary / secondary backgrounds
    safeSetCssVar("--primaryBg", colors.primaryBg ?? "");
    safeSetCssVar("--primaryText", colors.primaryText ?? "");
    safeSetCssVar("--card-primary-bg", colors.primaryBg ?? "");
    safeSetCssVar("--card-primary-text", colors.primaryText ?? "");
    safeSetCssVar("--secondary-bg", colors.secondaryBg ?? "");
    safeSetCssVar("--secondary-text", colors.secondaryText ?? "");


    // Danger / status / accent
    safeSetCssVar("--card-dangerBg", colors.dangerBg ?? "");
    safeSetCssVar("--card-dangerText", colors.dangerText ?? "");
    // compatibility alias used in some CSS files
    safeSetCssVar("--dangerBg", colors.dangerBg ?? "");
    safeSetCssVar("--dangerText", colors.dangerText ?? "");
    safeSetCssVar("--status-online", colors.statusOnline ?? "");
    safeSetCssVar("--status-offline", colors.statusOffline ?? "");
    safeSetCssVar("--accent", colors.accent ?? "");

    // Shadow / hover / misc
    safeSetCssVar("--shadow", colors.shadow ?? "");
    safeSetCssVar("--addThemeHover", colors.addThemeHover ?? "");

    // card glow: try to produce a translucent version of accent if not provided
    try {
      const accent = colors.accent ?? "";
      safeSetCssVar("--card-glow", accent ? `${accent}55` : "");
    } catch {
      safeSetCssVar("--card-glow", "");
    }

    try {
      const colors = theme.colors ?? {};

      // Text / typography aliases
      safeSetCssVar("--text", colors.text ?? "");
      safeSetCssVar("--textMuted", colors.textMuted ?? "");
      // font aliases: ensure headings and body pick up loaded families
      const activeTitle = getComputedStyle(document.documentElement).getPropertyValue("--active-title-font") || "";
      const activeBody = getComputedStyle(document.documentElement).getPropertyValue("--active-body-font") || "";
      safeSetCssVar("--font", activeTitle.trim() || (colors.text ? "inherit" : ""));
      safeSetCssVar("--font-body", activeBody.trim() || (colors.text ? "inherit" : ""));

      // Sidebar aliases (camelCase)
      safeSetCssVar("--sidebarBg", colors.sidebarBg ?? "");
      safeSetCssVar("--sidebarText", colors.sidebarText ?? "");
      safeSetCssVar("--sidebarHover", colors.sidebarHover ?? "");
      safeSetCssVar("--sidebarActive", colors.sidebarActive ?? "");

      // Panel / border aliases used in CSS
      safeSetCssVar("--panelBorder", colors.panelBorder ?? "");
      safeSetCssVar("--colorPanelBorder", colors.panelBorder ?? "");
      safeSetCssVar("--panelBg", colors.panelBg ?? "");
      safeSetCssVar("--panelShadow", colors.panelShadow ?? "");

      // Primary / secondary aliases
      safeSetCssVar("--primaryText", colors.primaryText ?? "");
      safeSetCssVar("--secondaryText", colors.secondaryText ?? "");
      safeSetCssVar("--primaryBg", colors.primaryBg ?? "");
      safeSetCssVar("--secondaryBg", colors.secondaryBg ?? "");

      // Accent / status / misc aliases
      safeSetCssVar("--accentColor", colors.accent ?? "");
      safeSetCssVar("--statusOnline", colors.statusOnline ?? "");
      safeSetCssVar("--statusOffline", colors.statusOffline ?? "");
      safeSetCssVar("--dangerBg", colors.dangerBg ?? "");
      safeSetCssVar("--dangerText", colors.dangerText ?? "");

      // Header / top nav aliases (common names)
      safeSetCssVar("--topNavBg", colors.panelBg ?? colors.sidebarBg ?? "");
      safeSetCssVar("--topNavText", colors.text ?? "");
      safeSetCssVar("--appHeader", colors.panelBg ?? "");
      safeSetCssVar("--headerBg", colors.panelBg ?? "");
      safeSetCssVar("--headerText", colors.text ?? "");

      // Glow / shadow
      safeSetCssVar("--cardGlow", (colors.accent ? `${colors.accent}55` : ""));
      safeSetCssVar("--card-glow", (colors.accent ? `${colors.accent}55` : ""));
    } catch (e) {
      console.warn("Failed to set compatibility aliases:", e);
    }

    // 3) Background handling (robust)
    const bgFromColors = (colors.background || "").toString().trim();

    if (theme.backgroundMode === "solid") {
      const solid = theme.solidBackground ?? (bgFromColors && !bgFromColors.includes("gradient") ? bgFromColors : "");
      safeSetCssVar("--theme-background", solid);
      safeSetCssVar("--appBackground", solid);
    } else {
      if (theme.gradientStart && theme.gradientEnd) {
        const composed = `radial-gradient(circle at top left, ${theme.gradientStart}, ${theme.gradientEnd})`;
        safeSetCssVar("--theme-background", composed);
        safeSetCssVar("--appBackground", composed);
        safeSetCssVar("--gradient-start", theme.gradientStart);
        safeSetCssVar("--gradient-end", theme.gradientEnd);
      } else if (bgFromColors && bgFromColors.includes("gradient")) {
        safeSetCssVar("--theme-background", bgFromColors);
        safeSetCssVar("--appBackground", bgFromColors);
        // best-effort extract stops
        try {
          const m = bgFromColors.match(/\(([^)]+)\)/);
          if (m && m[1]) {
            const parts = m[1].split(",").map(s => s.trim());
            const maybeStart = parts.length >= 2 ? parts[parts.length - 2] : "";
            const maybeEnd = parts.length >= 1 ? parts[parts.length - 1] : "";
            if (maybeStart) safeSetCssVar("--gradient-start", maybeStart);
            if (maybeEnd) safeSetCssVar("--gradient-end", maybeEnd);
          }
        } catch {
          // Ignore
        }
      } else {
        const fallback = theme.solidBackground ?? (bgFromColors && !bgFromColors.includes("gradient") ? bgFromColors : "");
        safeSetCssVar("--theme-background", fallback);
        safeSetCssVar("--appBackground", fallback);
      }
    }
  } catch (e) {
    console.warn("Failed to apply color/background variables:", e);
  }


  // Logo and icons (expose as CSS variables if needed)
  safeSetCssVar("--theme-logo", theme.logo ?? "");
  safeSetCssVar("--theme-icons-dashboard", theme.icons?.dashboard ?? "");
  safeSetCssVar("--theme-icons-servers", theme.icons?.servers ?? "");
  safeSetCssVar("--theme-icons-players", theme.icons?.players ?? "");
  safeSetCssVar("--theme-icons-console", theme.icons?.console ?? "");
  safeSetCssVar("--theme-icons-settings", theme.icons?.settings ?? "");
  safeSetCssVar("--theme-icons-carbon", theme.icons?.carbon ?? "")
  safeSetCssVar("--theme-icons-oxide", theme.icons?.oxide ?? "")
  safeSetCssVar("--theme-icons-serverinstaller", theme.icons?.serverinstaller ?? "")
  safeSetCssVar("--theme-icons-pluginmanager", theme.icons?.pluginmanager ?? "")

  // Fonts: set CSS variables for the family names that the FontFace loader will register.
  // The actual FontFace loading is handled elsewhere (see ThemeProvider useEffect).
  if (theme.font) {
    safeSetCssVar("--active-title-font", "active-display");
  } else {
    safeSetCssVar("--active-title-font", "inherit");
  }

  if (theme.bodyFont) {
    safeSetCssVar("--active-body-font", "active-body");
  } else {
    safeSetCssVar("--active-body-font", "Inter, system-ui, sans-serif");
  }
}

/* -------------------------
   ThemeProvider
   ------------------------- */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeDefinition | null>(null);

  // Wrapper to set active theme, apply it to the document, and persist the choice
  const setActiveThemeAndApply = (theme: ThemeDefinition) => {
    setActiveTheme(theme);

    try {
      applyThemeToDocument(theme);
    } catch (e) {
      console.warn("applyThemeToDocument failed:", e);
    }

    try {
      if (window.themeAPI?.saveThemeId && theme?.id) {
        // prefer IPC if available
        window.themeAPI.saveThemeId(theme.id);
      } else if (theme?.id) {
        // fallback to localStorage
        localStorage.setItem("activeThemeId", theme.id);
      }
    } catch (e) {
      console.warn("Failed to persist active theme id:", e);
    }
  };

  // Load all themes on mount and restore saved active theme id (with fallback)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const loaded: ThemeDefinition[] =
          (window.themeAPI && (await window.themeAPI.loadAll())) || [];

        if (!mounted) return;
        setThemes(loaded);


        const resolveSavedId = async (): Promise<string | null> => {
          try {
            if (window.themeAPI?.loadThemeId) {

              const maybe = window.themeAPI.loadThemeId() as unknown;

              if (
                maybe &&
                typeof (maybe as { then?: unknown }).then === "function"
              ) {
                return await (maybe as unknown as Promise<string>);
              }

              return (maybe as string) || null;
            }
          } catch (e) {
            console.warn("themeAPI.loadThemeId failed:", e);
          }

          try {
            return localStorage.getItem("activeThemeId");
          } catch {
            return null;
          }
        };


        const savedId = await resolveSavedId();
        const active =
          (savedId && loaded.find(t => t.id === savedId)) || loaded[0] || null;

        if (active) {
          setActiveTheme(active);
          try {
            applyThemeToDocument(active);
          } catch (e) {
            console.warn("applyThemeToDocument failed on initial load:", e);
          }
        }
      } catch (e) {
        console.warn("Failed to load themes:", e);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // When activeTheme changes, ensure fonts are loaded (FontFace) and applied.
  // --- Replace the existing activeTheme useEffect body with this ---
  useEffect(() => {
    if (!activeTheme) return;

    const loadedFaces: FontFace[] = [];

    const tryLoadFont = async (urlOrThemeUrl: string | null, familySuffix: "display" | "body") => {
      if (!urlOrThemeUrl) return;
      try {
        const fmt = guessFontFormat(urlOrThemeUrl);
        // Use per-theme family names so ThemeCard preview and global CSS align
        const family = `${activeTheme.id}-${familySuffix}`;
        const src = `url(${urlOrThemeUrl}) format("${fmt}")`;
        const face = new FontFace(family, src, { style: "normal", weight: "400" });
        const loaded = await face.load();
        document.fonts.add(loaded);
        loadedFaces.push(loaded);
      } catch (e) {
        console.warn(`Failed to load font ${familySuffix} for theme ${activeTheme.id} from ${urlOrThemeUrl}:`, e);
      }
    };

    (async () => {
      // Load title and body fonts using per-theme family names
      await tryLoadFont(activeTheme.font ?? null, "display");
      await tryLoadFont(activeTheme.bodyFont ?? null, "body");

      // After fonts load (or fail), set CSS variables to the per-theme family names
      try {
        // Set the active font family variables used by your global CSS
        const titleFamily = activeTheme.font ? `${activeTheme.id}-display` : "inherit";
        const bodyFamily = activeTheme.bodyFont ? `${activeTheme.id}-body` : "Inter, system-ui, sans-serif";

        safeSetCssVar("--active-title-font", titleFamily);
        safeSetCssVar("--active-body-font", bodyFamily);

        // Compatibility aliases (some CSS uses these names)
        safeSetCssVar("--font", titleFamily);
        safeSetCssVar("--font-body", bodyFamily);

        // Also set the app background variable your CSS uses
        // Reapply the full theme using the centralized logic (handles colors.background gradients)
        applyThemeToDocument(activeTheme);


        // Re-apply other color variables (keeps existing mapping)
        const colors = activeTheme.colors ?? {};
        Object.entries(colors).forEach(([k, v]) => {
          safeSetCssVar(`--theme-${k}`, String(v ?? ""));
        });

        // Also set a few common aliases used in components (optional but helpful)
        safeSetCssVar("--card-text", activeTheme.colors?.text ?? "");
        safeSetCssVar("--card-primary-bg", activeTheme.colors?.primaryBg ?? "");
        safeSetCssVar("--card-glow", (activeTheme.colors?.accent ?? "") + "55");
      } catch (e) {
        console.warn("applyThemeToDocument failed after font load:", e);
      }
    })();

    // No cleanup required for FontFace objects
    return () => {
      // nothing to remove
    };
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        themes,
        setThemes,
        activeTheme,
        setActiveTheme: setActiveThemeAndApply
      }}
    >
      {children}
    </ThemeContext.Provider>
  );


}
