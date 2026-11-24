/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import React, { useState, useEffect, startTransition } from "react";
import { createPortal } from "react-dom";
import type { ThemeDefinition } from "../themeTypes";
import "./themeBuilder.css";
import { safeHex } from "../../../../../utils/safeHex";
import { Buffer } from "buffer";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

// Local slugify for renderer (used to generate theme ids)
function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper: guess font format from filename
/* function guessFormat(url: string) {
  const u = url.toLowerCase();
  if (u.endsWith(".woff2")) return "woff2";
  if (u.endsWith(".woff")) return "woff";
  if (u.endsWith(".ttf")) return "truetype";
  if (u.endsWith(".otf")) return "opentype";
  return "truetype";
} */

// Add near top of ThemeBuilder.tsx (below imports)
/* function normalizeBuiltinPath(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  if (path.startsWith("icons/")) {
    const fileName = path.split("/").pop();
    return fileName ? `/icons/${fileName}` : null;
  }
  if (path.startsWith("images/")) {
    const fileName = path.split("/").pop();
    return fileName ? `/images/${fileName}` : null;
  }
  if (path.startsWith("fonts/")) {
    const fileName = path.split("/").pop();
    return fileName ? `/fonts/${fileName}` : null;
  }
  return path;
} */




/* -------------------------------------------------------
   DEFAULT EMPTY THEME
------------------------------------------------------- */

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


/* -------------------------------------------------------
   TYPED DERIVE HELPERS
------------------------------------------------------- */

type AssetSource = "builtin" | "upload" | "url";

function deriveLogoSource(logo: string | null): AssetSource {
  if (!logo) return "builtin";
  if (logo.startsWith("theme://") && logo.includes("/images/")) return "upload";
  if (logo.startsWith("/images/")) return "builtin";
  if (logo.startsWith("http")) return "url";
  return "builtin";
}

function deriveIconSource(sampleIcon: string | null): {
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

function deriveFontSource(font: string | null): {
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
/* -------------------------------------------------------
   PROPS
------------------------------------------------------- */

interface ThemeBuilderProps {
  initial?: ThemeDefinition;
  onSave: (theme: ThemeDefinition) => void;
  onClose: () => void;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function ThemeBuilder({ initial, onSave, onClose }: ThemeBuilderProps) {
  const [theme, setTheme] = useState<ThemeDefinition>(() => initial || emptyTheme);

  // FONT DROPDOWN VALUES (filenames, not paths)
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);

  // LOGO + ICON PACK UI META
  const [logoSource, setLogoSource] = useState<AssetSource>("builtin");
  const [logo, setLogo] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");

  const [iconSource, setIconSource] = useState<AssetSource>("builtin");
  const [iconPack, setIconPack] = useState<string>("");
  const [iconFiles, setIconFiles] = useState<File[]>([]);
  const [iconUrlBase, setIconUrlBase] = useState<string>("");
  const [iconUrls, setIconUrls] = useState<Record<string, string>>({
    dashboard: "",
    servers: "",
    players: "",
    carbon: "",
    oxide: "",
    serverinstaller: "",
    pluginmanager: "",
    console: "",
    settings: ""

  });
  // URL validation state for icon packs
  const [iconUrlValid, setIconUrlValid] = useState<boolean | null>(null);
  const [iconUrlMissing, setIconUrlMissing] = useState<string[]>([]);

  // TITLE FONT UI META
  const [titleFontSource, setTitleFontSource] = useState<AssetSource>("builtin");
  const [titleFont, setTitleFont] = useState<string>("");
  const [titleFontFile, setTitleFontFile] = useState<File | null>(null);
  const [titleFontUrl, setTitleFontUrl] = useState<string>("");

  // BODY FONT UI META
  const [bodyFontSource, setBodyFontSource] = useState<AssetSource>("builtin");
  const [bodyFont, setBodyFont] = useState<string>("");
  const [bodyFontFile, setBodyFontFile] = useState<File | null>(null);
  const [bodyFontUrl, setBodyFontUrl] = useState<string>("");

  // BACKGROUND MODE + VALUES
  const [backgroundMode, setBackgroundMode] = useState<"solid" | "gradient">("solid");
  const [solidBackground, setSolidBackground] = useState<string>("#0f172a");
  const [gradientStart, setGradientStart] = useState<string>("#94a3b8");
  const [gradientEnd, setGradientEnd] = useState<string>("#ffffff");

  // ThemeBuilder.tsx (inside component)
  const REQUIRED_ICON_FILES = [
    "dashboard.png",
    "servers.png",
    "players.png",
    "carbon.png",
    "oxide.png",
    "serverinstaller.png",
    "pluginmanager.png",
    "console.png",
    "settings.png"

  ];
  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleIconFolderUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setIconFiles([]);
      return;
    }

    // Validate required filenames
    const missing = REQUIRED_ICON_FILES.filter(
      name => !files.some(f => f.name === name)
    );

    if (missing.length > 0) {
      setValidationError(
        `The selected folder is missing required icons: ${missing.join(
          ", "
        )}`
      );
      e.currentTarget.value = "";
      setIconFiles([]);
      return;
    }

    // Optional: validate MIME type and size
    const invalid = files.filter(
      f =>
        !f.type.startsWith("image/") ||
        f.size > 256 * 1024 // e.g. 256KB max
    );

    if (invalid.length > 0) {
      setValidationError(
        `Invalid or oversized files: ${invalid
          .map(f => `${f.name} (${Math.round(f.size / 1024)}KB)`)
          .join(", ")}`
      );
      e.currentTarget.value = "";
      setIconFiles([]);
      return;
    }

    setIconFiles(files);
  }

  const updateColor = (
    key: keyof ThemeDefinition["colors"],
    value: string
  ) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  /* -------------------------------------------------------
     LOAD AVAILABLE FONTS FROM PUBLIC/FONTS
  ------------------------------------------------------- */

  useEffect(() => {
    window.themeAPI
      .getFonts()
      .then(setAvailableFonts)
      .catch(() => setAvailableFonts([]));
  }, []);

  /* -------------------------------------------------------
     VALIDATE ICON URLS (per-icon or base) — checks required files exist
  ------------------------------------------------------- */
  useEffect(() => {
    if (iconSource !== "url") {
      setIconUrlValid(null);
      setIconUrlMissing([]);
      return;
    }

    let cancelled = false;
    const keys = ["dashboard", "servers", "players", "console", "settings", "carbon", "oxide", "serverinstaller", "pluginmanager"];

    const hasPerIcon = Object.values(iconUrls || {}).some(v => !!(v && v.trim()));

    (async () => {
      const missing: string[] = [];


      if (hasPerIcon) {
        // Validate each provided URL
        await Promise.all(keys.map(async (k) => {
          const url = (iconUrls as any)[k] || "";
          if (!url) {
            missing.push(k);
            return;
          }
          try {
            const res = await fetch(url, { method: "HEAD" });
            if (!res.ok) missing.push(k);
          } catch {
            missing.push(k);
          }
        }));
      } else if (iconUrlBase && iconUrlBase.trim()) {
        const base = iconUrlBase.trim().replace(/\/+$/g, "") + "/";
        await Promise.all(keys.map(async (k) => {
          const name = `${k === 'servers' ? 'servers' : k}.png`;
          try {
            const res = await fetch(base + name, { method: "HEAD" });
            if (!res.ok) missing.push(name);
          } catch (e) {
            missing.push(name);
          }
        }));
      }

      if (cancelled) return;
      setIconUrlMissing(missing);
      setIconUrlValid(missing.length === 0);
    })();

    return () => { cancelled = true; };
  }, [iconSource, iconUrlBase, iconUrls]);


  //  HYDRATION FROM initial PROP (FULLY PATCHED)

  useEffect(() => {
    if (!initial) return;

    startTransition(() => {
      setTheme(initial);

      // ---------------- LOGO ----------------
      const derivedLogoSource = deriveLogoSource(initial.logo ?? null);
      const effectiveLogoSource = initial.logoSource ?? derivedLogoSource;
      setLogoSource(effectiveLogoSource);

      if (effectiveLogoSource === "builtin") {
        setLogo(initial.logo?.split("/images/")[1] || "");
        setLogoUrl("");
        setLogoFile(null);
      }
      else if (effectiveLogoSource === "upload") {
        // Restore uploaded filename
        setLogo(initial.logoOriginal || "");
        setLogoUrl("");
        setLogoFile(null);
      }
      else {
        // URL
        setLogo("");
        setLogoUrl(initial.logo || "");
        setLogoFile(null);
      }

      // ---------------- ICON PACK ----------------
      const iconMeta = deriveIconSource(initial.icons?.dashboard ?? null);
      const effectiveIconSource = initial.iconsSource ?? iconMeta.source;
      setIconSource(effectiveIconSource);

      if (effectiveIconSource === "builtin") {
        // Restore built‑in pack - this is the KEY FIX for icon pack recall
        setIconPack(initial.iconPack ?? iconMeta.pack);
        setIconUrlBase("");
        setIconFiles([]);
      }
      else if (effectiveIconSource === "upload") {
        // Restore uploaded icon filenames (cannot recreate File objects)
        setIconPack("");
        setIconUrlBase("");
        setIconFiles(
          (initial.uploadedIconNames || []).map(name => ({ name } as File))
        );
      }
      else {
        // URL mode - restore the base URL and/or per-icon URLs
        setIconPack("");
        setIconUrlBase(iconMeta.urlBase || "");
        setIconFiles([]);
        setIconUrls({
          dashboard: initial.icons?.dashboard ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/dashboard.png` : ""),
          servers: initial.icons?.servers ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/servers.png` : ""),
          players: initial.icons?.players ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/players.png` : ""),
          carbon: initial.icons?.carbon ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/carbon.png` : ""),
          oxide: initial.icons?.oxide ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/oxide.png` : ""),
          serverinstaller: initial.icons?.serverinstaller ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/serverinstaller.png` : ""),
          pluginmanager: initial.icons?.pluginmanager ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/pluginmanager.png` : ""),
          console: initial.icons?.console ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/console.png` : ""),
          settings: initial.icons?.settings ?? (iconMeta.urlBase ? `${iconMeta.urlBase}/settings.png` : "")

        });
      }

      // ---------------- TITLE FONT ----------------
      const titleMeta = deriveFontSource(initial.font ?? null);
      const effectiveTitleSource =
        initial.fontSource ?? (titleMeta.source as AssetSource);
      setTitleFontSource(effectiveTitleSource);

      if (effectiveTitleSource === "builtin") {
        // Prefer fontOriginal if available (newly stored field), else derive from path
        const fontValue = initial.fontOriginal || titleMeta.value;
        setTitleFont(fontValue);
        setTitleFontUrl("");
        setTitleFontFile(null);
      }
      else if (effectiveTitleSource === "upload") {
        // Restore uploaded filename
        setTitleFont(initial.fontOriginal || "");
        setTitleFontUrl("");
        setTitleFontFile(null);
      }
      else {
        // URL
        setTitleFont("");
        setTitleFontUrl(initial.font || "");
        setTitleFontFile(null);
      }

      // ---------------- BODY FONT ----------------
      const bodyMeta = deriveFontSource(initial.bodyFont ?? null);
      const effectiveBodySource =
        initial.bodyFontSource ?? (bodyMeta.source as AssetSource);
      setBodyFontSource(effectiveBodySource);

      if (effectiveBodySource === "builtin") {
        // Prefer bodyFontOriginal if available (newly stored field), else derive from path
        const fontValue = initial.bodyFontOriginal || bodyMeta.value;
        setBodyFont(fontValue);
        setBodyFontUrl("");
        setBodyFontFile(null);
      }
      else if (effectiveBodySource === "upload") {
        // Restore uploaded filename
        setBodyFont(initial.bodyFontOriginal || "");
        setBodyFontUrl("");
        setBodyFontFile(null);
      }
      else {
        // URL
        setBodyFont("");
        setBodyFontUrl(initial.bodyFont || "");
        setBodyFontFile(null);
      }

      // ---------------- BACKGROUND ----------------
      const bg = initial.colors.background || "#0f172a";
      const isGradient = bg.includes("gradient");

      setBackgroundMode(
        initial.backgroundMode ?? (isGradient ? "gradient" : "solid")
      );

      if (initial.solidBackground) {
        setSolidBackground(initial.solidBackground);
      } else if (!isGradient) {
        setSolidBackground(bg);
      }

      if (initial.gradientStart) setGradientStart(initial.gradientStart);
      if (initial.gradientEnd) setGradientEnd(initial.gradientEnd);
    });
  }, [initial]);

  /* -------------------------------------------------------
     DYNAMIC CSS: COLOR PREVIEWS
  ------------------------------------------------------- */

  useEffect(() => {
    const styleId = "dynamic-color-vars";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const entries = Object.entries(theme.colors).map(([, value]) => {
      const hex = safeHex(value);
      const cls = `cp-${hex.replace("#", "")}`;
      return `.${cls} { --preview-color: ${hex}; }`;
    });

    const solidHex = safeHex(solidBackground);
    const gradStartHex = safeHex(gradientStart);
    const gradEndHex = safeHex(gradientEnd);

    style.textContent = `
      .cp-${solidHex.replace("#", "")} { --preview-color: ${solidHex}; }
      .cp-${gradStartHex.replace("#", "")} { --preview-color: ${gradStartHex}; }
      .cp-${gradEndHex.replace("#", "")} { --preview-color: ${gradEndHex}; }

      ${entries.join("\n")}
    `;
  }, [solidBackground, gradientStart, gradientEnd, theme.colors]);

  /* -------------------------------------------------------
     DYNAMIC CSS: GRADIENT VARS
  ------------------------------------------------------- */

  useEffect(() => {
    const styleId = "dynamic-gradient-vars";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const startHex = safeHex(gradientStart);
    const endHex = safeHex(gradientEnd);

    const startClass = `gs-${startHex.replace("#", "")}`;
    const endClass = `ge-${endHex.replace("#", "")}`;

    style.textContent = `
      .${startClass} { --gradient-start: ${startHex}; }
      .${endClass} { --gradient-end: ${endHex}; }
    `;
  }, [gradientStart, gradientEnd]);

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return createPortal(
    <div className="theme-builder-overlay">
      <div className="theme-builder-container">
        {/* Header */}
        <div className="theme-builder-header">
          <h2>{initial ? "Edit Theme" : "Create Theme"}</h2>
        </div>

        {/* Scrollable Content */}
        <div className="theme-builder-scroll">
          {/* Theme Identity */}
          <div className="theme-section-title">Theme Identity</div>
          <div className="theme-section-content">
            {/* THEME NAME */}
            <div className="theme-box">
              <label className="theme-name-field">
                Theme Name
                <input
                  type="text"
                  value={theme.name}
                  onChange={e => {
                    setValidationError(null);

                    setTheme(prev => ({
                      ...prev,
                      name: e.target.value
                    }));
                  }}
                  placeholder="Enter a theme name"
                />

              </label>


            </div>

            <div className="theme-two-col">
              {/* LOGO */}
              <div className="theme-box">
                <div className="theme-box-title">Logo</div>

                <div className="source-options">
                  <label>
                    <input
                      type="radio"
                      checked={logoSource === "builtin"}
                      onChange={() => setLogoSource("builtin")}
                    />
                    Built‑in
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={logoSource === "upload"}
                      onChange={() => setLogoSource("upload")}
                    />
                    Upload File
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={logoSource === "url"}
                      onChange={() => setLogoSource("url")}
                    />
                    URL
                  </label>
                </div>

                <div className="background-divider"></div>

                {logoSource === "builtin" && (
                  <label>
                    Select Built‑in Logo
                    <select
                      value={logo}
                      onChange={e => setLogo(e.target.value)}
                    >
                      <option value="">Select Logo</option>
                      <option value="rust-logo.png">Rust Logo</option>
                      <option value="midnight-logo.png">Midnight Logo</option>
                      <option value="slate-logo.png">Slate Logo</option>
                    </select>
                  </label>
                )}

                {logoSource === "upload" && (
                  <label>
                    Upload Logo File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e =>
                        setLogoFile(e.currentTarget.files?.[0] || null)
                      }
                    />
                  </label>

                )}
                {logoSource === "upload" && initial?.logoOriginal && (
                  <div className="current-asset">
                    Current logo: <span>{initial.logoOriginal}</span>
                  </div>
                )}



                {logoSource === "url" && (
                  <label>
                    Logo URL
                    <input
                      type="text"
                      placeholder="https://example.com/logo.svg"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                    />
                  </label>
                )}

              </div>

              {/* ICON PACK */}
              <div className="theme-box">
                <div className="theme-box-title">Icon Pack</div>

                <div className="source-options">
                  <label>
                    <input
                      type="radio"
                      checked={iconSource === "builtin"}
                      onChange={() => setIconSource("builtin")}
                    />
                    Built‑in
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={iconSource === "upload"}
                      onChange={() => setIconSource("upload")}
                    />
                    Upload Files
                  </label>

                  {iconSource === "upload" && (
                    <div className="theme-icon-upload">
                      <input
                        type="file"
                        multiple
                        onChange={handleIconFolderUpload}
                        {...({ webkitdirectory: "true", directory: "true" } as any)}
                      />

                      <div className="theme-icon-upload-hint">
                        Your icon pack must contain the following files:
                        <ul>
                          {REQUIRED_ICON_FILES.map(name => (
                            <li key={name}>{name}</li>
                          ))}
                          <li><strong>Recommended:</strong> 64×64 PNG, transparent background.</li>
                          <li> Supported formats: PNG, SVG, ICO, JPEG, JPG, GIF</li>
                        </ul>
                      </div>

                      {iconSource === "upload" && initial?.uploadedIconNames && (
                        <div className="current-asset">
                          Current icons: <span>{initial.uploadedIconNames.join(", ")}</span>
                        </div>
                      )}



                      {iconFiles.length > 0 && (
                        <div className="theme-icon-upload-summary">
                          Selected {iconFiles.length} files.
                        </div>
                      )}
                    </div>
                  )}

                  <label>
                    <input
                      type="radio"
                      checked={iconSource === "url"}
                      onChange={() => setIconSource("url")}
                    />
                    URL Base
                  </label>
                </div>

                <div className="background-divider"></div>

                {/* BUILT-IN PACK SELECTOR */}
                {iconSource === "builtin" && (
                  <label>
                    Select Built‑in Pack
                    <select
                      value={iconPack}
                      onChange={e => {
                        const pack = e.target.value;
                        setIconPack(pack);

                        if (!pack) return;

                        const newIcons = {
                          dashboard: `/icons/${pack}/dashboard.png`,
                          servers: `/icons/${pack}/servers.png`,
                          players: `/icons/${pack}/players.png`,
                          carbon: `/icons/${pack}/carbon.png`,
                          oxide: `/icons/${pack}/oxide.png`,
                          serverinstaller: `/icons/${pack}/serverinstaller.png`,
                          pluginmanager: `/icons/${pack}/pluginmanager.png`,
                          console: `/icons/${pack}/console.png`,
                          settings: `/icons/${pack}/settings.png`
                        };

                        setTheme(prev => ({
                          ...prev,
                          icons: newIcons
                        }));
                      }}
                    >
                      <option value="">Select icon pack</option>
                      <option value="rust">Rust Icons</option>
                      <option value="midnight">Midnight Icons</option>
                      <option value="slate">Slate Icons</option>
                    </select>
                  </label>
                )}

                {/* URL MODE */}
                {iconSource === "url" && (
                  <div className="icon-url-fields">
                    <label>
                      Dashboard Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/dashboard.png"
                        value={iconUrls.dashboard}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, dashboard: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, dashboard: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Server Info Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/servers.png"
                        value={iconUrls.servers}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, servers: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, servers: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Player Admin Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/players.png"
                        value={iconUrls.players}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, players: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, players: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Carbon Installer Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/carbon.png"
                        value={iconUrls.carbon}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, carbon: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, carbon: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Oxide/Umod Installer Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/oxide.png"
                        value={iconUrls.oxide}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, oxide: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, oxide: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Server Installer Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/serverinstaller.png"
                        value={iconUrls.serverinstaller}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, serverinstaller: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, serverinstaller: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Plugin Manager Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/pluginmanager.png"
                        value={iconUrls.pluginmanager}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, pluginmanager: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, pluginmanager: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Console Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/console.png"
                        value={iconUrls.console}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, console: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, console: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    <label>
                      Settings Icon URL
                      <input
                        type="text"
                        placeholder="https://example.com/icons/settings.png"
                        value={iconUrls.settings}
                        onChange={e => {
                          const v = e.target.value.trim();
                          setIconUrls(prev => ({ ...prev, settings: v }));
                          setTheme(prev => ({ ...prev, icons: { ...prev.icons, settings: v } }));
                          setIconUrlValid(null);
                        }}
                      />
                    </label>

                    {/* validation feedback */}
                    {iconUrlValid === false && (
                      <div className="validation-error">
                        Could not find the following icon files / URLs: {iconUrlMissing.join(", ")}
                      </div>
                    )}

                    {iconUrlValid === true && (
                      <div className="validation-success">Icon pack OK</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TITLE FONT */}
            <div className="theme-box">
              <div className="theme-box-title">Title Font</div>

              <div className="source-options">
                <label>
                  <input
                    type="radio"
                    checked={titleFontSource === "builtin"}
                    onChange={() => setTitleFontSource("builtin")}
                  />
                  Built‑in
                </label>

                <label>
                  <input
                    type="radio"
                    checked={titleFontSource === "upload"}
                    onChange={() => setTitleFontSource("upload")}
                  />
                  Upload File
                </label>

                <label>
                  <input
                    type="radio"
                    checked={titleFontSource === "url"}
                    onChange={() => setTitleFontSource("url")}
                  />
                  URL
                </label>

              </div>

              <div className="background-divider"></div>

              {titleFontSource === "builtin" && (
                <label>
                  Select Font
                  <select
                    value={titleFont}
                    onChange={e => setTitleFont(e.target.value)}
                  >
                    <option value="">Select font</option>
                    {availableFonts.map(f => (
                      <option key={f} value={f}>
                        {f.replace(/\.(ttf|otf|woff2?)$/i, "")}
                      </option>
                    ))}
                  </select>

                </label>
              )}

              {titleFontSource === "upload" && (
                <label>
                  Upload Font File
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={e =>
                      setTitleFontFile(e.currentTarget.files?.[0] || null)
                    }
                  />
                </label>
              )}

              {titleFontSource === "upload" && initial?.fontOriginal && (
                <div className="current-asset">
                  Current title font: <span>{initial.fontOriginal}</span>
                </div>
              )}



              {titleFontSource === "url" && (
                <label>
                  Font URL
                  <input
                    type="text"
                    placeholder="https://example.com/fonts/MyFont.ttf"
                    value={titleFontUrl}
                    onChange={e => setTitleFontUrl(e.target.value)}
                  />
                  {titleFontSource === "url" && (
                    <div className="theme-font-info">
                      <ul>
                        <li><h3>To use Google API fonts: https://fonts.google.com/ </h3></li>
                        <li>Select all the fonts you want to use and click get embed code</li>
                        <li>Copy the URL from the href in the link tag, it should look like: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap</li>
                        <li>Paste the URL into the address bar of your browser</li>
                        <li>This should display a list of all the fonts and their styles, locate the SRC url  and copy the link from inside the brackets, it should look like: https://fonts.gstatic.com/s/oswald/v57/TK3iWkUHHAIjg752FD8Ghe4.woff2 </li>
                        <li>Paste that URL into the font fields above</li>
                        <li>Note: This has only been tested with Google Fonts, other URL sources may not work</li>
                      </ul>
                    </div>
                  )}
                </label>
              )}
            </div>

            {/* BODY FONT */}
            <div className="theme-box">
              <div className="theme-box-title">Body Font</div>

              <div className="source-options">
                <label>
                  <input
                    type="radio"
                    checked={bodyFontSource === "builtin"}
                    onChange={() => setBodyFontSource("builtin")}
                  />
                  Built‑in
                </label>

                <label>
                  <input
                    type="radio"
                    checked={bodyFontSource === "upload"}
                    onChange={() => setBodyFontSource("upload")}
                  />
                  Upload File
                </label>

                <label>
                  <input
                    type="radio"
                    checked={bodyFontSource === "url"}
                    onChange={() => setBodyFontSource("url")}
                  />
                  URL
                </label>
              </div>

              <div className="background-divider"></div>

              {bodyFontSource === "builtin" && (
                <label>
                  Select Font
                  <select
                    value={bodyFont}
                    onChange={e => setBodyFont(e.target.value)}
                  >
                    <option value="">Select font</option>
                    {availableFonts.map(f => (
                      <option key={f} value={f}>
                        {f.replace(/\.(ttf|otf|woff2?)$/i, "")}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {bodyFontSource === "upload" && (
                <label>
                  Upload Font File
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={e =>
                      setBodyFontFile(e.currentTarget.files?.[0] || null)
                    }
                  />
                </label>
              )}

              {bodyFontSource === "upload" && initial?.bodyFontOriginal && (
                <div className="current-asset">
                  Current body font: <span>{initial.bodyFontOriginal}</span>
                </div>
              )}



              {bodyFontSource === "url" && (
                <label>
                  Font URL
                  <input
                    type="text"
                    placeholder="https://example.com/fonts/MyFont.ttf"
                    value={bodyFontUrl}
                    onChange={e => setBodyFontUrl(e.target.value)}
                  />
                </label>
              )}
              {bodyFontSource === "url" && (
                <div className="theme-font-info">
                  <ul>
                    <li><h3>To use Google API fonts: https://fonts.google.com/ </h3></li>
                    <li>Select all the fonts you want to use and click get embed code</li>
                    <li>Copy the URL from the href in the link tag, it should look like: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap</li>
                    <li>Paste the URL into the address bar of your browser</li>
                    <li>This should display a list of all the fonts and their styles, locate the SRC url  and copy the link from inside the brackets, it should look like: https://fonts.gstatic.com/s/oswald/v57/TK3iWkUHHAIjg752FD8Ghe4.woff2 </li>
                    <li>Paste that URL into the font fields above</li>
                    <li>Note: This has only been tested with Google Fonts, other URL sources may not work</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Background */}
          <div className="theme-section-divider"></div>

          <div className="theme-section-content theme-box">
            <div className="theme-box-title">Background</div>

            <div className="background-mode">
              <label>
                <input
                  type="radio"
                  checked={backgroundMode === "solid"}
                  onChange={() => setBackgroundMode("solid")}
                />
                Solid background
              </label>

              <label>
                <input
                  type="radio"
                  checked={backgroundMode === "gradient"}
                  onChange={() => setBackgroundMode("gradient")}
                />
                Gradient background
              </label>
            </div>

            <div className="background-divider"></div>

            {backgroundMode === "solid" && (
              <div className="background-fields">
                <label className="color-input-wrapper">
                  Background Colour

                  <div
                    className={`color-preview-box cp-${safeHex(
                      solidBackground
                    ).replace("#", "")}`}
                  />

                  <input
                    className="color-input-hidden"
                    type="color"
                    value={safeHex(solidBackground)}
                    onChange={e => setSolidBackground(e.target.value)}
                  />
                </label>
              </div>
            )}

            {backgroundMode === "gradient" && (
              <>
                <div className="background-fields">
                  <label className="color-input-wrapper">
                    Gradient Start

                    <div
                      className={`color-preview-box cp-${safeHex(
                        gradientStart
                      ).replace("#", "")}`}
                    />

                    <input
                      className="color-input-hidden"
                      type="color"
                      value={safeHex(gradientStart)}
                      onChange={e => setGradientStart(e.target.value)}
                    />
                  </label>

                  <label className="color-input-wrapper">
                    Gradient End

                    <div
                      className={`color-preview-box cp-${safeHex(
                        gradientEnd
                      ).replace("#", "")}`}
                    />

                    <input
                      className="color-input-hidden"
                      type="color"
                      value={safeHex(gradientEnd)}
                      onChange={e => setGradientEnd(e.target.value)}
                    />
                  </label>
                </div>

                <div className={`theme-gradient-preview`} style={{ display: "block", height: 48 }} />
              </>
            )}
          </div>

          {/* Colour System */}
          <div className="theme-section-divider"></div>
          <div className="theme-section-title">Colour System</div>

          <div className="theme-section-content">
            <div className="theme-three-col">
              {Object.entries(theme.colors).map(([_colorKey, value]) => {
                const colorKey =
                  _colorKey as keyof ThemeDefinition["colors"];
                const hex = safeHex(value);
                if (colorKey === "background") return null;

                return (
                  <label
                    key={colorKey}
                    className="color-input-wrapper"
                  >
                    {colorKey}

                    <div
                      className={`color-preview-box cp-${hex.replace(
                        "#",
                        ""
                      )}`}
                    />

                    <input
                      className="color-input-hidden"
                      type="color"
                      value={hex}
                      onChange={e =>
                        updateColor(colorKey, e.target.value)
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {validationError && (
          <div className="theme-validation-error">
            {validationError}
          </div>
        )}


        {/* Footer */}
        <div className="theme-builder-footer">
          <button
            onClick={async () => {
              // Validate required theme fields before saving
              setValidationError(null);
              const missing: string[] = [];

              if (!theme.name.trim()) {
                missing.push("Theme name");
              }

              // Logo / Icons / Fonts must not be in the "blank select" state
              const logoIsSelected = (() => {
                // Treat empty / "blank select" as not selected
                if (logoSource === "builtin") return !!logo && logo !== "select";
                if (logoSource === "upload") return !!logoFile || !!initial?.logoOriginal;
                if (logoSource === "url") return !!logoUrl.trim();
                return !!theme.logo;
              })();
              if (!logoIsSelected) missing.push("Logo (select/upload/provide URL)");

              const iconsIsSelected = (() => {
                if (iconSource === "builtin") return !!iconPack && iconPack !== "select";
                if (iconSource === "upload") return iconFiles.length > 0;
                if (iconSource === "url") {
                  const allPerIcon = Object.values(iconUrls || {}).every(
                    v => !!(v && v.trim())
                  );
                  return allPerIcon || !!(iconUrlBase && iconUrlBase.trim());
                }
                return !!theme.icons;
              })();
              if (!iconsIsSelected) missing.push("Icon pack (select/upload/provide URL)");

              const titleFontIsSelected = (() => {
                if (titleFontSource === "builtin") return !!titleFont && titleFont !== "select";
                if (titleFontSource === "upload") return !!titleFontFile || !!initial?.fontOriginal;
                if (titleFontSource === "url") return !!titleFontUrl.trim();
                return !!theme.font;
              })();
              if (!titleFontIsSelected) missing.push("Title font (select/upload/provide URL)");

              const bodyFontIsSelected = (() => {
                if (bodyFontSource === "builtin") return !!bodyFont && bodyFont !== "select";
                if (bodyFontSource === "upload") return !!bodyFontFile || !!initial?.bodyFontOriginal;
                if (bodyFontSource === "url") return !!bodyFontUrl.trim();
                return !!theme.bodyFont;
              })();
              if (!bodyFontIsSelected) missing.push("Body font (select/upload/provide URL)");

              if (missing.length > 0) {
                setValidationError(
                  `Missing required fields: ${missing.join(", ")}`
                );
                return;
              }

              // ---------------- THEME ID (Fix #1) ----------------
              let themeId: string;

              if (!initial) {
                // Creating a new theme → always generate a fresh ID
                themeId = slugify(theme.name || crypto.randomUUID());
              } else {
                // Editing an existing theme → keep its ID
                themeId = theme.id;
              }

              // Ensure local state also has the correct ID
              setTheme(prev => ({ ...prev, id: themeId }));


              // ---------------- TRACK ORIGINAL FILENAMES (Fix #3) ----------------
              let finalLogoOriginal = theme.logoOriginal ?? null;
              let finalFontOriginal = theme.fontOriginal ?? null;
              let finalBodyFontOriginal = theme.bodyFontOriginal ?? null;
              let finalUploadedIconNames = theme.uploadedIconNames ?? null;

              // ---------------- LOGO ----------------
              let finalLogo: string | null = null;

              if (logoSource === "builtin" && logo) {
                finalLogo = `/images/${logo.replace(/^\/?images\//, "")}`;
                finalLogoOriginal = null;
              }
              else if (logoSource === "upload" && logoFile) {
                const safeName = logoFile.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
                const arrayBuffer = await logoFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                finalLogo = await window.themeAPI.saveLogo(themeId, safeName, buffer);
                finalLogoOriginal = safeName;
              }
              else if (logoSource === "url" && logoUrl.trim()) {
                finalLogo = logoUrl.trim();
                finalLogoOriginal = null;
              }
              else if (theme.logo) {
                finalLogo = theme.logo;
              }

              // ---------------- ICONS ----------------
              const finalIcons: any = {
                dashboard: "",
                servers: "",
                players: "",
                carbon: "",
                oxide: "",
                serverinstaller: "",
                pluginmanager: "",
                console: "",
                settings: ""
              };

              if (iconSource === "builtin") {
                finalIcons.dashboard = `/icons/${iconPack}/dashboard.png`;
                finalIcons.servers = `/icons/${iconPack}/servers.png`;
                finalIcons.players = `/icons/${iconPack}/players.png`;
                finalIcons.carbon = `/icons/${iconPack}/carbon.png`;
                finalIcons.oxide = `/icons/${iconPack}/oxide.png`;
                finalIcons.serverinstaller = `/icons/${iconPack}/serverinstaller.png`;
                finalIcons.pluginmanager = `/icons/${iconPack}/pluginmanager.png`;
                finalIcons.console = `/icons/${iconPack}/console.png`;
                finalIcons.settings = `/icons/${iconPack}/settings.png`;
                finalUploadedIconNames = null;
              }
              else if (iconSource === "upload" && iconFiles.length > 0) {
                const fileMap = new Map<string, File>();
                iconFiles.forEach(f => fileMap.set(f.name, f));

                const required = ["dashboard.png", "servers.png", "players.png", "carbon.png", "oxide.png", "serverinstaller.png", "pluginmanager.png", "console.png", "settings.png"];

                for (const name of required) {
                  if (!fileMap.has(name)) {
                    setValidationError(
                      `Missing required icon: ${name}`
                    );
                    return;
                  }
                }

                const savedIcons: any = {};
                for (const name of required) {
                  const file = fileMap.get(name)!;
                  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
                  const arrayBuffer = await file.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  const savedPath = await window.themeAPI.saveIcon(themeId, safeName, buffer);
                  const key = name.replace(".png", "").toLowerCase();
                  savedIcons[key] = savedPath;
                }

                finalIcons.dashboard = savedIcons.dashboard;
                finalIcons.servers = savedIcons.servers;
                finalIcons.players = savedIcons.players;
                finalIcons.carbon = savedIcons.carbon;
                finalIcons.oxide = savedIcons.oxide;
                finalIcons.serverinstaller = savedIcons.serverinstaller;
                finalIcons.pluginmanager = savedIcons.pluginmanager;
                finalIcons.console = savedIcons.console;
                finalIcons.settings = savedIcons.settings;

                finalUploadedIconNames = required;
              }
              else if (iconSource === "url") {
                const anySpecified = Object.values(iconUrls || {}).some(v => v && v.trim());
                if (anySpecified) {
                  finalIcons.dashboard = iconUrls.dashboard || null;
                  finalIcons.servers = iconUrls.servers || null;
                  finalIcons.players = iconUrls.players || null;
                  finalIcons.carbon = iconUrls.carbon || null;
                  finalIcons.oxide = iconUrls.oxide || null;
                  finalIcons.serverinstaller = iconUrls.serverinstaller || null;
                  finalIcons.pluginmanager = iconUrls.pluginmanager || null;
                  finalIcons.console = iconUrls.console || null;
                  finalIcons.settings = iconUrls.settings || null;
                } else if (iconUrlBase && iconUrlBase.trim()) {
                  const base = iconUrlBase.trim().replace(/\/+$/g, "");
                  finalIcons.dashboard = `${base}/dashboard.png`;
                  finalIcons.servers = `${base}/servers.png`;
                  finalIcons.players = `${base}/players.png`;
                  finalIcons.carbon = `${base}/carbon.png`;
                  finalIcons.oxide = `${base}/oxide.png`;
                  finalIcons.serverinstaller = `${base}/serverinstaller.png`;
                  finalIcons.pluginmanager = `${base}/pluginmanager.png`;
                  finalIcons.console = `${base}/console.png`;
                  finalIcons.settings = `${base}/settings.png`;
                }
                finalUploadedIconNames = null;
              }
              else if (theme.icons) {
                finalIcons.dashboard = theme.icons.dashboard;
                finalIcons.servers = theme.icons.servers;
                finalIcons.players = theme.icons.players;
                finalIcons.carbon = theme.icons.carbon;
                finalIcons.oxide = theme.icons.oxide;
                finalIcons.serverinstaller = theme.icons.serverinstaller;
                finalIcons.pluginmanager = theme.icons.pluginmanager;
                finalIcons.console = theme.icons.console;
                finalIcons.settings = theme.icons.settings;
              }

              // ---------------- FONTS (Fix #2 + Fix #3) ----------------
              let finalTitleFont: string | null = null;
              let finalBodyFont: string | null = null;

              // TITLE FONT
              if (titleFontSource === "builtin" && titleFont) {
                finalTitleFont = `/fonts/${titleFont}`;
                finalFontOriginal = titleFont;
              }
              else if (titleFontSource === "upload" && titleFontFile) {
                const safeName = titleFontFile.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
                const arrayBuffer = await titleFontFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                finalTitleFont = await window.themeAPI.saveFont(themeId, safeName, buffer);
                finalFontOriginal = safeName;
              }
              else if (titleFontSource === "url" && titleFontUrl.trim()) {
                finalTitleFont = titleFontUrl.trim();
                finalFontOriginal = null;
              }
              else if (theme.font) {
                finalTitleFont = theme.font;
              }

              // BODY FONT
              if (bodyFontSource === "builtin" && bodyFont) {
                finalBodyFont = `/fonts/${bodyFont}`;
                finalBodyFontOriginal = bodyFont;
              }
              else if (bodyFontSource === "upload" && bodyFontFile) {
                const safeName = bodyFontFile.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
                const arrayBuffer = await bodyFontFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                finalBodyFont = await window.themeAPI.saveFont(themeId, safeName, buffer);
                finalBodyFontOriginal = safeName;
              }
              else if (bodyFontSource === "url" && bodyFontUrl.trim()) {
                finalBodyFont = bodyFontUrl.trim();
                finalBodyFontOriginal = null;
              }
              else if (theme.bodyFont) {
                finalBodyFont = theme.bodyFont;
              }

              // ---------------- FINAL THEME OBJECT ----------------
              const cleanedIconUrlBase = iconSource === "url" ? (iconUrlBase || "").trim().replace(/\/+$/g, "") : null;
              const finalTheme: ThemeDefinition = {
                ...theme,
                id: themeId,
                isDefault: false,

                // Source tracking
                logoSource,
                iconsSource: iconSource,
                fontSource: titleFontSource,
                bodyFontSource: bodyFontSource,

                // Original filenames (Fix #3)
                logoOriginal: finalLogoOriginal ?? theme.logoOriginal,
                fontOriginal: finalFontOriginal ?? theme.fontOriginal,
                bodyFontOriginal: finalBodyFontOriginal ?? theme.bodyFontOriginal,
                uploadedIconNames: finalUploadedIconNames ?? theme.uploadedIconNames,
                iconPack: iconSource === "builtin" ? iconPack : null,


                // Actual asset paths
                font: finalTitleFont,
                bodyFont: finalBodyFont,
                logo: finalLogo,
                icons: finalIcons,
                // Icon URL base (for URL-mode packs)
                iconUrlBase: cleanedIconUrlBase,

                backgroundMode,
                solidBackground,
                gradientStart,
                gradientEnd,

                colors: {
                  ...theme.colors,
                  background:
                    backgroundMode === "solid"
                      ? safeHex(solidBackground)
                      : `radial-gradient(circle at top left, ${safeHex(
                        gradientStart
                      )}, ${safeHex(gradientEnd)})`
                }
              };

              await window.themeAPI.save(finalTheme);
              onSave(finalTheme);
            }}



            className="primary-btn"
          >
            Save Theme
          </button>

          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
