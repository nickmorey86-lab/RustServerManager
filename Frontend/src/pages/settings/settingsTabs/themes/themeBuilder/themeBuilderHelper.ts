import type { ThemeDefinition } from "../themeTypes";

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type AssetSource = "builtin" | "upload" | "url";

export function deriveLogoSource(logo: string | null): AssetSource {
  if (!logo) return "builtin";
  if (logo.startsWith("theme://") && logo.includes("/images/")) return "upload";
  if (logo.startsWith("/images/")) return "builtin";
  if (logo.startsWith("http")) return "url";
  return "builtin";
}

export function deriveIconSource(sampleIcon: string | null): {
  source: AssetSource;
  pack: string;
  urlBase: string;
} {
  if (!sampleIcon) return { source: "builtin", pack: "", urlBase: "" };
  if (sampleIcon.startsWith("theme://") && sampleIcon.includes("/icons/"))
    return { source: "upload", pack: "", urlBase: "" };
  if (sampleIcon.startsWith("/icons/")) {
    const pack = sampleIcon.split("/icons/")[1].split("/")[0];
    return { source: "builtin", pack, urlBase: "" };
  }
  if (sampleIcon.startsWith("http")) {
    const base = sampleIcon.replace(/dashboard\.png$/i, "");
    return { source: "url", pack: "", urlBase: base };
  }
  return { source: "builtin", pack: "", urlBase: "" };
}

export function deriveFontSource(font: string | null): {
  source: AssetSource;
  value: string;
  url: string;
} {
  if (!font) return { source: "builtin", value: "", url: "" };
  if (font.startsWith("theme://") && font.includes("/fonts/")) {
    return { source: "upload", value: font.split("/fonts/")[1], url: "" };
  }
  if (font.startsWith("/fonts/")) {
    return { source: "builtin", value: font.split("/fonts/")[1], url: "" };
  }
  if (font.startsWith("http")) {
    return { source: "url", value: font, url: font };
  }
  return { source: "url", value: font, url: font };
}

export const emptyTheme: ThemeDefinition = {
  id: "",  // id assigned when theme is saved
  name: "",
  isDefault: false,

  // Background
  backgroundMode: "solid",
  solidBackground: "#0f172a",
  gradientStart: "#0f172a",
  gradientEnd: "#0f172a",

  // Colors
  colors: {
    background: "#0f172a",
    text: "#e2e8f0",
    textMuted: "#94a3b8",

    sidebarBg: "#1e293b",
    sidebarText: "#e2e8f0",
    sidebarHover: "#334155",
    sidebarActive: "#475569",

    panelBg: "#1e293b",
    panelBorder: "#334155",
    panelShadow: "rgba(0,0,0,0.4)",

    primaryBg: "#22c55e",
    primaryText: "#0f172a",

    secondaryBg: "#334155",
    secondaryText: "#e2e8f0",

    dangerBg: "#dc2626",
    dangerText: "#ffffff",

    statusOnline: "#22c55e",
    statusOffline: "#dc2626",

    shadow: "rgba(0,0,0,0.4)",
    addThemeHover: "#22c55e33",
    accent: "#22c55e"
  },

  // Assets (nullable)
  logo: null,
  font: null,
  bodyFont: null,

  icons: {
    dashboard: null,
    servers: null,
    players: null,
    carbon: null,
    oxide: null,
    serverinstaller: null,
    pluginmanager: null,
    console: null,
    settings: null
  },

  // Sources
  logoSource: "builtin",
  iconsSource: "builtin",
  fontSource: "builtin",
  bodyFontSource: "builtin",

  // Original filenames (uploads)
  logoOriginal: null,
  fontOriginal: null,
  bodyFontOriginal: null,

  // Uploaded icon filenames
  uploadedIconNames: null,

  // URL base for icon packs
  iconUrlBase: null,

  // Built‑in icon pack name
  iconPack: null
};