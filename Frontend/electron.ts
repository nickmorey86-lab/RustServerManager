// electron.ts
import { app, BrowserWindow, ipcMain, protocol } from "electron";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { ThemeDefinition } from "./src/pages/settings/settingsTabs/themes/themeTypes";
import { pathToFileURL } from "url";

const isDev = !app.isPackaged;

// -------------------------------------------------------
// PATHS (single consolidated storage base)
// -------------------------------------------------------
// All user JSON + theme assets are stored under ONE stable folder.
const consolidatedDataRoot = path.join(app.getAppPath(), "app-data", "RustServerManager");
const userThemesDir = path.join(consolidatedDataRoot, "themes");

const userApiServicesDirBase = path.join(consolidatedDataRoot, "apiServices");
const userApiServicesPath = path.join(userApiServicesDirBase, "apiServices.json");

const userChatMessagesDir = path.join(consolidatedDataRoot, "serverMessages");
const userChatMessagesPath = path.join(userChatMessagesDir, "ChatMessages.json");

const userCombinedAdminWhitelistDir = path.join(consolidatedDataRoot, "adminWhitelist");
const userCombinedAdminWhitelistPath = path.join(userCombinedAdminWhitelistDir, "AdminWhitelist.json");

const userRulesDir = path.join(consolidatedDataRoot, "rules");

const userLanguageFilterDir = path.join(consolidatedDataRoot, "languageFilter");
const userLanguageFilterPath = path.join(userLanguageFilterDir, "languageFilter.json");

const userAntiCheatDir = path.join(consolidatedDataRoot, "antiCheat");
const userAntiCheatPath = path.join(userAntiCheatDir, "AntiCheat.json");

const userOtherStuffDir = path.join(consolidatedDataRoot, "otherStuff");
const userOtherStuffPath = path.join(userOtherStuffDir, "OtherStuff.json");

// Ensure consolidated root exists
if (!fs.existsSync(consolidatedDataRoot)) {
  fs.mkdirSync(consolidatedDataRoot, { recursive: true });
}

// Ensure all required user folders exist
for (const dir of [
  userThemesDir,
  userApiServicesDirBase,
  userChatMessagesDir,
  userCombinedAdminWhitelistDir,
  userRulesDir,
  userLanguageFilterDir,
  userAntiCheatDir,
  userOtherStuffDir,
]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// -------------------------------------------------------
// THEMES: source folder + protocol
// -------------------------------------------------------
const sourceThemesDir = isDev
  ? path.join(__dirname, "../src/pages/settings/settingsTabs/themes")
  : path.join(process.resourcesPath, "themes");

// One-time migration: normalize existing theme.json files (user themes)
function migrateThemesOnStartup() {
  const marker = path.join(userThemesDir, ".migrated");
  if (fs.existsSync(marker)) return;

  if (!fs.existsSync(userThemesDir)) return;

  for (const id of fs.readdirSync(userThemesDir)) {
    const themeDir = path.join(userThemesDir, id);
    const jsonPath = path.join(themeDir, "theme.json");
    if (!fs.existsSync(jsonPath)) continue;

    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      const t = JSON.parse(raw);

      // Normalize logo
      if (t.logo && typeof t.logo === "string" && !t.logo.startsWith("theme://") && !t.logo.startsWith("http")) {
        const clean = t.logo.replace(/^\//, "");
        const ext = path.extname(clean).toLowerCase();
        if (!(ext === ".ttf" || ext === ".otf" || ext === ".woff" || ext === ".woff2")) {
          if (!clean.startsWith("images/") && !clean.startsWith("icons/")) t.logo = `images/${clean}`;
          else t.logo = clean;
        }
      }

      // Normalize icons
      if (t.icons && typeof t.icons === "object") {
        for (const k of Object.keys(t.icons)) {
          const v = t.icons[k];
          if (!v || typeof v !== "string") continue;
          if (v.startsWith("theme://") || v.startsWith("http")) continue;

          const clean = v.replace(/^\//, "");
          if (!clean.startsWith("icons/")) t.icons[k] = `icons/${clean}`;
          else t.icons[k] = clean;
        }
      }

      // Normalize fonts
      if (t.font && typeof t.font === "string" && !t.font.startsWith("theme://") && !t.font.startsWith("http")) {
        const clean = t.font.replace(/^\//, "");
        t.font = clean.startsWith("fonts/") ? clean : `fonts/${clean}`;
      }
      if (t.bodyFont && typeof t.bodyFont === "string" && !t.bodyFont.startsWith("theme://") && !t.bodyFont.startsWith("http")) {
        const clean = t.bodyFont.replace(/^\//, "");
        t.bodyFont = clean.startsWith("fonts/") ? clean : `fonts/${clean}`;
      }

      fs.writeFileSync(jsonPath, JSON.stringify(t, null, 2), "utf8");
    } catch (err) {
      console.warn("Migration failed for", jsonPath, err);
    }
  }

  try {
    fs.writeFileSync(marker, String(Date.now()), "utf8");
  } catch {
    // ignore
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function copyFolder(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.lstatSync(srcPath).isDirectory()) copyFolder(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function ensureThemeFolderComplete(sourceThemeFolder: string, destThemeFolder: string) {
  // Always create dest folder structure; then copy missing files/folders.
  if (!fs.existsSync(destThemeFolder)) fs.mkdirSync(destThemeFolder, { recursive: true });

  // Copy theme.json + any asset subfolders that exist in source
  const requiredRel = ["theme.json", "fonts", "icons", "images"];
  for (const rel of requiredRel) {
    const srcPath = path.join(sourceThemeFolder, rel);
    const destPath = path.join(destThemeFolder, rel);

    if (!fs.existsSync(srcPath)) continue;

    // If it's a file, copy if missing (or overwrite if sizes mismatch is okay, but we'll keep it simple)
    if (fs.lstatSync(srcPath).isFile()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(path.dirname(destPath), { recursive: true });
      if (!fs.existsSync(destPath)) fs.copyFileSync(srcPath, destPath);
      continue;
    }

    // If it's a directory, copy folder contents (we want to "repair", so overwrite is acceptable)
    if (fs.existsSync(destPath)) {
      // overwrite files inside to repair missing/corrupt
      copyFolder(srcPath, destPath);
    } else {
      copyFolder(srcPath, destPath);
    }
  }

  // Finally, ensure marker for nested theme asset existence
  // (no-op; marker is handled elsewhere)
}

// Copy built-in theme folders into user theme storage (repair mode).
if (fs.existsSync(sourceThemesDir)) {
  for (const folder of fs.readdirSync(sourceThemesDir)) {
    const src = path.join(sourceThemesDir, folder);
    const dest = path.join(userThemesDir, folder);
    if (!fs.existsSync(src)) continue;
    if (!fs.lstatSync(src).isDirectory()) continue;

    ensureThemeFolderComplete(src, dest);
  }
}

function registerThemeProtocol() {
  protocol.registerFileProtocol("theme", (request, callback) => {
    try {
      let url = request.url;
      if (!url.startsWith("theme://")) return callback({ path: "" });
      url = url.slice("theme://".length);

      const [themeId, ...rest] = url.split("/");
      if (!themeId) return callback({ path: "" });

      const relPath = rest.join("/");
      const absPath = path.join(userThemesDir, themeId, relPath);
      if (!fs.existsSync(absPath)) return callback({ path: "" });

      return callback({ path: absPath });
    } catch (err) {
      console.error("theme protocol error:", err);
      return callback({ path: "" });
    }
  });
}

export function resolveThemeUrl(themeId: string, p?: string | null) {
  if (!p) return null;

  // Prefer theme:// for internal assets when already resolved.
  if (p.startsWith("theme://")) return p;

  if (p.startsWith("/icons/") || p.startsWith("icons/")) {
    const file = p.replace(/^\/?icons\//, "");
    const filePath = path.join(userThemesDir, themeId, "icons", file);
    return pathToFileURL(filePath).href;
  }
  if (p.startsWith("/images/") || p.startsWith("images/")) {
    const file = p.replace(/^\/?images\//, "");
    const filePath = path.join(userThemesDir, themeId, "images", file);
    return pathToFileURL(filePath).href;
  }

  const normalized = p.replace(/^\//, "");
  const ext = path.extname(normalized).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"].includes(ext)) {
    const imagePath = path.join(userThemesDir, themeId, "images", normalized);
    if (fs.existsSync(imagePath)) return pathToFileURL(imagePath).href;

    const iconPath = path.join(userThemesDir, themeId, "icons", normalized);
    if (fs.existsSync(iconPath)) return pathToFileURL(iconPath).href;
  }

  if (p.startsWith("/fonts/") || p.startsWith("fonts/")) {
    const file = p.replace(/^\/?fonts\//, "");
    const filePath = path.join(userThemesDir, themeId, "fonts", file);
    return pathToFileURL(filePath).href;
  }

  if (p.startsWith("http")) return p;
  return p;
}

function loadThemesFromDisk(): ThemeDefinition[] {
  const themes: ThemeDefinition[] = [];
  if (!fs.existsSync(userThemesDir)) return themes;

  for (const folder of fs.readdirSync(userThemesDir)) {
    const themeFolder = path.join(userThemesDir, folder);
    const jsonPath = path.join(themeFolder, "theme.json");
    if (!fs.existsSync(jsonPath)) continue;

    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      const theme = JSON.parse(raw);

      const id: string = theme.id ?? folder;
      theme.id = id;
      theme.name ??= folder;

      const loadedTheme: ThemeDefinition = {
        ...theme,
        logo: resolveThemeUrl(id, theme.logo ?? null),
        font: resolveThemeUrl(id, theme.font ?? null),
        bodyFont: resolveThemeUrl(id, theme.bodyFont ?? null),
        icons: {
          dashboard: resolveThemeUrl(id, theme.icons?.dashboard ?? null),
          servers: resolveThemeUrl(id, theme.icons?.servers ?? null),
          players: resolveThemeUrl(id, theme.icons?.players ?? null),
          console: resolveThemeUrl(id, theme.icons?.console ?? null),
          settings: resolveThemeUrl(id, theme.icons?.settings ?? null),
          carbon: resolveThemeUrl(id, theme.icons?.carbon ?? null),
          oxide: resolveThemeUrl(id, theme.icons?.oxide ?? null),
          serverinstaller: resolveThemeUrl(id, theme.icons?.serverinstaller ?? null),
          pluginmanager: resolveThemeUrl(id, theme.icons?.pluginmanager ?? null),
        },
      };

      themes.push(loadedTheme);
    } catch {
      // ignore malformed theme
    }
  }

  return themes;
}

ipcMain.handle("themes:save", async (_event, theme: ThemeDefinition) => {
  if (!theme.id) theme.id = slugify(theme.name || crypto.randomUUID());

  const themeFolder = path.join(userThemesDir, theme.id);
  if (!fs.existsSync(themeFolder)) fs.mkdirSync(themeFolder, { recursive: true });

  const imagesDir = path.join(themeFolder, "images");
  const iconsDir = path.join(themeFolder, "icons");
  const fontsDir = path.join(themeFolder, "fonts");

  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(fontsDir, { recursive: true });

  function copyBuiltinAsset(relPath: string, destFolder: string): string {
    const clean = relPath.replace(/^\//, "");
    const prodSrc = path.join(process.resourcesPath, clean);
    const devSrc = path.join(__dirname, "../public", clean);

    let sourcePath: string | null = null;
    if (fs.existsSync(prodSrc)) sourcePath = prodSrc;
    else if (fs.existsSync(devSrc)) sourcePath = devSrc;
    else {
      const basename = path.basename(clean);
      try {
        const stack = [sourceThemesDir];
        while (stack.length) {
          const dir = stack.pop()!;
          try {
            for (const entry of fs.readdirSync(dir)) {
              const full = path.join(dir, entry);
              try {
                const stat = fs.lstatSync(full);
                if (stat.isDirectory()) stack.push(full);
                else if (stat.isFile() && entry === basename) {
                  sourcePath = full;
                  stack.length = 0;
                  break;
                }
              } catch {
                // ignore
              }
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    }

    if (!sourcePath || !fs.existsSync(sourcePath)) {
      console.warn("Built-in asset not found, skipping copy:", prodSrc, devSrc);
      return path.basename(clean);
    }

    const fileName = path.basename(sourcePath);
    fs.copyFileSync(sourcePath, path.join(destFolder, fileName));
    return fileName;
  }

  let finalLogo: string | null = null;
  if (theme.logo?.startsWith("theme://")) finalLogo = theme.logo;
  else if (theme.logo?.startsWith("/images/")) finalLogo = "images/" + copyBuiltinAsset(theme.logo, imagesDir);
  else if (theme.logo?.startsWith("http")) finalLogo = theme.logo;

  const iconKeys = [
    "dashboard",
    "servers",
    "players",
    "console",
    "settings",
    "carbon",
    "oxide",
    "serverinstaller",
    "pluginmanager",
  ] as const;
  type IconKey = (typeof iconKeys)[number];

  const finalIcons: Record<IconKey, string | null> = Object.fromEntries(
    iconKeys.map((k) => [k, null])
  ) as Record<IconKey, string | null>;

  for (const key of iconKeys) {
    const iconPath = theme.icons?.[key] ?? null;
    if (!iconPath) {
      finalIcons[key] = null;
      continue;
    }
    if (iconPath.startsWith("theme://")) {
      finalIcons[key] = iconPath;
      continue;
    }
    const isIconsBuiltin = iconPath.startsWith("/icons/") || iconPath.startsWith("icons/");
    if (isIconsBuiltin) {
      try {
        const fileName = copyBuiltinAsset(iconPath, iconsDir);
        finalIcons[key] = `icons/${fileName}`;
      } catch {
        finalIcons[key] = `icons/${path.basename(iconPath)}`;
      }
      continue;
    }
    if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) {
      finalIcons[key] = iconPath;
      continue;
    }

    finalIcons[key] = iconPath;
  }

  function resolveFont(fontPath: string | null | undefined): string | null {
    if (!fontPath) return null;
    if (fontPath.startsWith("theme://")) return fontPath;
    if (fontPath.startsWith("/fonts/")) {
      const fileName = copyBuiltinAsset(fontPath, fontsDir);
      return `fonts/${fileName}`;
    }
    if (fontPath.startsWith("http")) return fontPath;
    return null;
  }

  const finalFont = resolveFont(theme.font);
  const finalBodyFont = resolveFont(theme.bodyFont);

  const finalTheme: ThemeDefinition = {
    ...theme,
    logo: finalLogo,
    icons: finalIcons,
    font: finalFont,
    bodyFont: finalBodyFont,
  };

  finalTheme.logoSource = finalTheme.logoSource ?? "builtin";
  finalTheme.iconsSource = finalTheme.iconsSource ?? "builtin";
  finalTheme.fontSource = finalTheme.fontSource ?? "builtin";
  finalTheme.bodyFontSource = finalTheme.bodyFontSource ?? "builtin";
  finalTheme.logoOriginal = finalTheme.logoOriginal ?? null;
  finalTheme.fontOriginal = finalTheme.fontOriginal ?? null;
  finalTheme.bodyFontOriginal = finalTheme.bodyFontOriginal ?? null;
  finalTheme.uploadedIconNames = finalTheme.uploadedIconNames ?? null;
  finalTheme.iconPack = finalTheme.iconPack ?? null;
  finalTheme.iconUrlBase = finalTheme.iconUrlBase ?? null;

  fs.writeFileSync(path.join(themeFolder, "theme.json"), JSON.stringify(finalTheme, null, 2));
  return true;
});

ipcMain.handle("themes:loadAll", () => loadThemesFromDisk());

// -------------------------------------------------------
// IPC: Fonts list (for ThemeBuilder dropdown)
// -------------------------------------------------------
ipcMain.handle("fonts:list", () => {
  try {
    // In dev, fonts are in Frontend/public/fonts
    const devFontsDir = path.join(__dirname, "../public/fonts");

    // In packaged builds, bundled public assets end up under resourcesPath
    const prodFontsDir = path.join(process.resourcesPath, "fonts");

    const fontsDir = fs.existsSync(prodFontsDir) ? prodFontsDir : devFontsDir;
    if (!fs.existsSync(fontsDir)) return [];

    const files = fs
      .readdirSync(fontsDir)
      .filter((f) => {
        const lower = f.toLowerCase();
        return (
          lower.endsWith(".ttf") ||
          lower.endsWith(".otf") ||
          lower.endsWith(".woff") ||
          lower.endsWith(".woff2")
        );
      })
      .sort((a, b) => a.localeCompare(b));

    return files;
  } catch (err) {
    console.warn("fonts:list failed:", err);
    return [];
  }
});

ipcMain.handle("theme:saveIcon", async (_event, args: { themeId: string; filename: string; buffer: Buffer }) => {
  const { themeId, filename, buffer } = args;
  const themeIconDir = path.join(userThemesDir, themeId, "icons");
  await fs.promises.mkdir(themeIconDir, { recursive: true });
  const filePath = path.join(themeIconDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/icons/${filename}`;
});

ipcMain.handle("theme:saveLogo", async (_event, args: { themeId: string; filename: string; buffer: Buffer }) => {
  const { themeId, filename, buffer } = args;
  const dir = path.join(userThemesDir, themeId, "images");
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/images/${filename}`;
});

ipcMain.handle("theme:saveFont", async (_event, args: { themeId: string; filename: string; buffer: Buffer }) => {
  const { themeId, filename, buffer } = args;
  const dir = path.join(userThemesDir, themeId, "fonts");
  await fs.promises.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/fonts/${filename}`;
});

ipcMain.handle("themes:delete", async (_event, themeId: string) => {
  try {
    const themeFolder = path.join(userThemesDir, themeId);
    if (!fs.existsSync(themeFolder)) return { success: false, error: "Theme not found" };
    fs.rmSync(themeFolder, { recursive: true, force: true });
    return { success: true };
  } catch (err) {
    console.error("Failed to delete theme:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: Language filter
// -------------------------------------------------------
type LanguageFilterSettings = {
  enable: boolean;
  wordList: string[];
  kickReason: string;
  numWarnings: number;
};

ipcMain.handle("languageFilter:load", () => {
  try {
    if (!fs.existsSync(userLanguageFilterPath)) return null;
    const raw = fs.readFileSync(userLanguageFilterPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LanguageFilterSettings>;

    return {
      enable: !!parsed.enable,
      wordList: Array.isArray(parsed.wordList) ? parsed.wordList.map(String) : [],
      kickReason: typeof parsed.kickReason === "string" ? parsed.kickReason : "",
      numWarnings: typeof parsed.numWarnings === "number" ? parsed.numWarnings : 0,
    } satisfies LanguageFilterSettings;
  } catch (err) {
    console.error("Failed to load language filter settings:", err);
    return null;
  }
});

ipcMain.handle("languageFilter:save", async (_event, settings: LanguageFilterSettings) => {
  try {
    const safe: LanguageFilterSettings = {
      enable: !!settings.enable,
      wordList: Array.isArray(settings.wordList) ? settings.wordList.map(String) : [],
      kickReason: typeof settings.kickReason === "string" ? settings.kickReason : "",
      numWarnings: typeof settings.numWarnings === "number" && Number.isFinite(settings.numWarnings) ? settings.numWarnings : 0,
    };

    fs.writeFileSync(userLanguageFilterPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save language filter settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: AntiCheat
// -------------------------------------------------------
type AntiCheatSettings = {
  autoKick: boolean;
  autoBan: boolean;
  banIP: boolean;
  banHours: number;
  banVoilations: boolean;
  banVioNo: number;
  banXbans: boolean;
  xBansHours: number;
  banVAC: boolean;
  vacBans: number;
  banGame: boolean;
  gamBanHours: number;
  daysSinceLast: boolean;
  lastBanHours: number;
};

ipcMain.handle("AntiCheat:load", () => {
  try {
    if (!fs.existsSync(userAntiCheatPath)) return null;
    const raw = fs.readFileSync(userAntiCheatPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AntiCheatSettings>;

    return {
      autoKick: !!parsed.autoKick,
      autoBan: !!parsed.autoBan,
      banIP: !!parsed.banIP,
      banHours: typeof parsed.banHours === "number" ? parsed.banHours : 0,
      banVoilations: !!parsed.banVoilations,
      banVioNo: typeof parsed.banVioNo === "number" ? parsed.banVioNo : 0,
      banXbans: !!parsed.banXbans,
      xBansHours: typeof parsed.xBansHours === "number" ? parsed.xBansHours : 0,
      banVAC: !!parsed.banVAC,
      vacBans: typeof parsed.vacBans === "number" ? parsed.vacBans : 0,
      banGame: !!parsed.banGame,
      gamBanHours: typeof parsed.gamBanHours === "number" ? parsed.gamBanHours : 0,
      daysSinceLast: !!parsed.daysSinceLast,
      lastBanHours: typeof parsed.lastBanHours === "number" ? parsed.lastBanHours : 0,
    } satisfies AntiCheatSettings;
  } catch (err) {
    console.error("Failed to load Anti Cheat settings:", err);
    return null;
  }
});

ipcMain.handle("AntiCheat:save", async (_event, settings: AntiCheatSettings) => {
  try {
    const errors: string[] = [];

    if (settings.banIP && (!settings.banHours || settings.banHours <= 0)) errors.push("Please set the number of hours for IP bans.");
    if (settings.banVoilations && (!settings.banVioNo || settings.banVioNo <= 0)) errors.push("Please set the maximum number of violations allowed.");
    if (settings.banXbans && (!settings.xBansHours || settings.xBansHours <= 0)) errors.push("Please set the number of combined VAC and Game bans allowed.");
    if (settings.banVAC && (!settings.vacBans || settings.vacBans <= 0)) errors.push("Please set the number of VAC bans allowed.");
    if (settings.banGame && (!settings.gamBanHours || settings.gamBanHours <= 0)) errors.push("Please set the number of game bans allowed.");
    if (settings.daysSinceLast && (!settings.lastBanHours || settings.lastBanHours <= 0)) errors.push("Please set the game ban limit for the days-since-last check.");

    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }

    const safe: AntiCheatSettings = {
      autoKick: !!settings.autoKick,
      autoBan: !!settings.autoBan,
      banIP: !!settings.banIP,
      banHours: typeof settings.banHours === "number" ? settings.banHours : 0,
      banVoilations: !!settings.banVoilations,
      banVioNo: typeof settings.banVioNo === "number" ? settings.banVioNo : 0,
      banXbans: !!settings.banXbans,
      xBansHours: typeof settings.xBansHours === "number" ? settings.xBansHours : 0,
      banVAC: !!settings.banVAC,
      vacBans: typeof settings.vacBans === "number" ? settings.vacBans : 0,
      banGame: !!settings.banGame,
      gamBanHours: typeof settings.gamBanHours === "number" ? settings.gamBanHours : 0,
      daysSinceLast: !!settings.daysSinceLast,
      lastBanHours: typeof settings.lastBanHours === "number" ? settings.lastBanHours : 0,
    };

    fs.writeFileSync(userAntiCheatPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save Anti Cheat settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: OtherStuff
// -------------------------------------------------------
type OtherStuff = {
  enableHP: boolean;
  chatWarn: boolean;
  pingMax: number;
  warnNo: number;
  chatRegEx: string;
  regExForm: string[];
  invalCharName: boolean;
  invalNameReas: string;
  whenWipe: boolean;
  wipeInfo: string;
};

ipcMain.handle("OtherStuff:load", () => {
  try {
    if (!fs.existsSync(userOtherStuffPath)) return null;
    const raw = fs.readFileSync(userOtherStuffPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<OtherStuff>;

    return {
      enableHP: !!parsed.enableHP,
      chatWarn: !!parsed.chatWarn,
      pingMax: typeof parsed.pingMax === "number" ? parsed.pingMax : 0,
      warnNo: typeof parsed.warnNo === "number" ? parsed.warnNo : 0,
      chatRegEx: typeof parsed.chatRegEx === "string" ? parsed.chatRegEx : "",
      regExForm: Array.isArray(parsed.regExForm) ? parsed.regExForm.map(String) : [],
      invalCharName: !!parsed.invalCharName,
      invalNameReas: typeof parsed.invalNameReas === "string" ? parsed.invalNameReas : "",
      whenWipe: !!parsed.whenWipe,
      wipeInfo: typeof parsed.wipeInfo === "string" ? parsed.wipeInfo : "",
    } satisfies OtherStuff;
  } catch (err) {
    console.error("Failed to load OtherStuff settings:", err);
    return null;
  }
});

ipcMain.handle("OtherStuff:save", async (_event, settings: OtherStuff) => {
  try {
    const errors: string[] = [];

    if (settings.enableHP) {
      if (!settings.chatWarn) errors.push("Please enable Chat Warnings.");
      if (!settings.pingMax || settings.pingMax <= 1) errors.push("Please set a maximum ping limit.");
      if (!settings.warnNo || settings.warnNo <= 1) errors.push("Please set the number of warnings allowed.");
    }

    if (settings.invalCharName && (!settings.invalNameReas || settings.invalNameReas.trim() === "")) {
      errors.push("Please provide a reason for invalid character names.");
    }

    if (settings.whenWipe && (!settings.wipeInfo || settings.wipeInfo.trim() === "")) {
      errors.push("Please provide the wipe information details.");
    }

    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }

    const safe: OtherStuff = {
      enableHP: !!settings.enableHP,
      chatWarn: !!settings.chatWarn,
      pingMax: typeof settings.pingMax === "number" ? settings.pingMax : 0,
      warnNo: typeof settings.warnNo === "number" ? settings.warnNo : 0,
      chatRegEx: typeof settings.chatRegEx === "string" ? settings.chatRegEx : "",
      regExForm: Array.isArray(settings.regExForm) ? settings.regExForm.map(String) : [],
      invalCharName: !!settings.invalCharName,
      invalNameReas: typeof settings.invalNameReas === "string" ? settings.invalNameReas : "",
      whenWipe: !!settings.whenWipe,
      wipeInfo: typeof settings.wipeInfo === "string" ? settings.wipeInfo : "",
    };

    fs.writeFileSync(userOtherStuffPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save OtherStuff settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: Rules (folder of JSON files)
// -------------------------------------------------------
ipcMain.handle("rules:loadAll", () => {
  try {
    if (!fs.existsSync(userRulesDir)) return [];
    const files = fs.readdirSync(userRulesDir).filter((f) => f.endsWith(".json"));

    return files.map((file) => {
      const filePath = path.join(userRulesDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      return { ...parsed, fileName: file };
    });
  } catch (err) {
    console.error("Failed to load rules:", err);
    return [];
  }
});

ipcMain.handle("rules:save", async (_event, rule: unknown) => {
  try {
    const fileName = `${String((rule as { ruleName?: string }).ruleName ?? "rule").replace(/\s+/g, "_")}_${Date.now()}.json`;
    const filePath = path.join(userRulesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(rule, null, 2), "utf8");
    return { success: true, fileName };
  } catch (err) {
    console.error("Failed to save rule:", err);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle("rules:delete", async (_event, fileName: string) => {
  try {
    const filePath = path.join(userRulesDir, fileName);
    if (!fs.existsSync(filePath)) return { success: false, error: "File not found" };
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete rule:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: apiServices
// -------------------------------------------------------
ipcMain.handle("apiServices:load", () => {
  try {
    if (!fs.existsSync(userApiServicesPath)) return null;
    const raw = fs.readFileSync(userApiServicesPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load apiServices settings:", err);
    return null;
  }
});

ipcMain.handle("apiServices:save", async (_event, settings: unknown) => {
  try {
    fs.writeFileSync(userApiServicesPath, JSON.stringify(settings, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save apiServices settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: AdminWhitelist (single consolidated JSON)
// -------------------------------------------------------
type CombinedAdminWhitelist = {
  newAdminID: number;
  addRemoveAdmin: string;
  enable: boolean;
  steamID: number;
  addRemoveList: string;
  kickReason: string;
};

ipcMain.handle("CombinedAdminWhitelist:load", () => {
  try {
    if (!fs.existsSync(userCombinedAdminWhitelistPath)) return null;
    const raw = fs.readFileSync(userCombinedAdminWhitelistPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CombinedAdminWhitelist>;

    return {
      newAdminID: typeof parsed.newAdminID === "number" ? parsed.newAdminID : 0,
      addRemoveAdmin: typeof parsed.addRemoveAdmin === "string" ? parsed.addRemoveAdmin : "",
      enable: !!parsed.enable,
      steamID: typeof parsed.steamID === "number" ? parsed.steamID : 0,
      addRemoveList: typeof parsed.addRemoveList === "string" ? parsed.addRemoveList : "",
      kickReason: typeof parsed.kickReason === "string" ? parsed.kickReason : "",
    } satisfies CombinedAdminWhitelist;
  } catch (err) {
    console.error("Failed to load CombinedAdminWhitelist settings:", err);
    return null;
  }
});

ipcMain.handle("CombinedAdminWhitelist:save", async (_event, settings: CombinedAdminWhitelist) => {
  try {
    const errors: string[] = [];

    if (settings.addRemoveAdmin && (!settings.newAdminID || settings.newAdminID <= 0)) {
      errors.push("Please set the number of hours for IP bans.");
    }

    if (
      settings.enable &&
      (!settings.steamID || settings.steamID <= 0 || !settings.addRemoveList || settings.addRemoveList.trim() === "")
    ) {
      errors.push("Missing required fields: When enabled, you must provide a valid SteamID and a list selection.");
    }

    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }

    const safe: CombinedAdminWhitelist = {
      newAdminID: typeof settings.newAdminID === "number" ? settings.newAdminID : 0,
      addRemoveAdmin: typeof settings.addRemoveAdmin === "string" ? settings.addRemoveAdmin : "",
      enable: !!settings.enable,
      steamID: typeof settings.steamID === "number" ? settings.steamID : 0,
      addRemoveList: typeof settings.addRemoveList === "string" ? settings.addRemoveList : "",
      kickReason: typeof settings.kickReason === "string" ? settings.kickReason : "",
    };

    fs.writeFileSync(userCombinedAdminWhitelistPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save CombinedAdminWhitelist settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// IPC: Server Messages
// -------------------------------------------------------
type ChatMessages = {
  id: string;
  enable: boolean;
  sayWhat: string;
  everyMins: number;
};

ipcMain.handle("ChatMessages:load", () => {
  try {
    if (!fs.existsSync(userChatMessagesPath)) return null;
    const raw = fs.readFileSync(userChatMessagesPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ChatMessages>;

    return {
      id: typeof parsed.id === "string" ? parsed.id : "",
      enable: !!parsed.enable,
      sayWhat: typeof parsed.sayWhat === "string" ? parsed.sayWhat : "",
      everyMins: typeof parsed.everyMins === "number" ? parsed.everyMins : 0,
    } satisfies ChatMessages;
  } catch (err) {
    console.error("Failed to load ChatMessages settings:", err);
    return null;
  }
});

ipcMain.handle("ChatMessages:save", async (_event, settings: ChatMessages) => {
  try {
    const errors: string[] = [];
    if (settings.enable && (!settings.sayWhat || settings.sayWhat <= "")) errors.push("Please enter your message.");
    if (settings.enable && (!settings.everyMins || settings.everyMins <= 0)) errors.push("Please enter the frequency of the message.");

    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }

    const safe: ChatMessages = {
      id: typeof settings.id === "string" ? settings.id : "",
      enable: !!settings.enable,
      sayWhat: typeof settings.sayWhat === "string" ? settings.sayWhat : "",
      everyMins: typeof settings.everyMins === "number" ? settings.everyMins : 0,
    };

    fs.writeFileSync(userChatMessagesPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save ChatMessages settings:", err);
    return { success: false, error: String(err) };
  }
});

// -------------------------------------------------------
// WINDOW CREATION
// -------------------------------------------------------
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  if (isDev) mainWindow.loadURL("http://localhost:5173/");
  else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  migrateThemesOnStartup();
  registerThemeProtocol();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

