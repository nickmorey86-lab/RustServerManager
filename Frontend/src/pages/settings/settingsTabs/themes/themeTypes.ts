export interface ThemeColors {
  background: string;
  text: string;
  textMuted: string;

  sidebarBg: string;
  sidebarText: string;
  sidebarHover: string;
  sidebarActive: string;

  panelBg: string;
  panelBorder: string;
  panelShadow: string;

  primaryBg: string;
  primaryText: string;

  secondaryBg: string;
  secondaryText: string;

  dangerBg: string;
  dangerText: string;

  statusOnline: string;
  statusOffline: string;

  shadow: string;

  addThemeHover: string;

  accent: string;
}

export interface ThemeIcons {
  dashboard: string | null;
  servers: string | null;
  players: string | null;
  carbon: string | null;
  oxide: string | null;
  serverinstaller: string | null;
  pluginmanager: string | null;
  console: string | null;
  settings: string | null;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  isDefault: boolean;

  // Asset fields (always present, nullable)
  logo: string | null;
  font: string | null;
  bodyFont: string | null;
  icons: ThemeIcons;

  // Source metadata
  logoSource: "builtin" | "upload" | "url";
  iconsSource: "builtin" | "upload" | "url";
  fontSource: "builtin" | "upload" | "url";
  bodyFontSource: "builtin" | "upload" | "url";

  // Original filenames for uploaded assets
  logoOriginal: string | null;
  fontOriginal: string | null;
  bodyFontOriginal: string | null;

  // Uploaded icon filenames
  uploadedIconNames: string[] | null;

  // Built‑in icon pack name
  iconPack: string | null;

  // URL base used for URL icon packs
  iconUrlBase: string | null;

  // Background fields
  backgroundMode: "solid" | "gradient";
  solidBackground: string | null;
  gradientStart: string | null;
  gradientEnd: string | null;

  // Colors
  colors: ThemeColors;
}
