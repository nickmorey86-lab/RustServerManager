var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron.ts
var electron_exports = {};
__export(electron_exports, {
  resolveThemeUrl: () => resolveThemeUrl
});
module.exports = __toCommonJS(electron_exports);
var import_electron = require("electron");
var import_crypto = __toESM(require("crypto"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_url = require("url");
var isDev = !import_electron.app.isPackaged;
var consolidatedDataRoot = import_path.default.join(import_electron.app.getAppPath(), "app-data", "RustServerManager");
var userThemesDir = import_path.default.join(consolidatedDataRoot, "themes");
var userApiServicesDirBase = import_path.default.join(consolidatedDataRoot, "apiServices");
var userApiServicesPath = import_path.default.join(userApiServicesDirBase, "apiServices.json");
var userChatMessagesDir = import_path.default.join(consolidatedDataRoot, "serverMessages");
var userChatMessagesPath = import_path.default.join(userChatMessagesDir, "ChatMessages.json");
var userCombinedAdminWhitelistDir = import_path.default.join(consolidatedDataRoot, "adminWhitelist");
var userCombinedAdminWhitelistPath = import_path.default.join(userCombinedAdminWhitelistDir, "AdminWhitelist.json");
var userRulesDir = import_path.default.join(consolidatedDataRoot, "rules");
var userLanguageFilterDir = import_path.default.join(consolidatedDataRoot, "languageFilter");
var userLanguageFilterPath = import_path.default.join(userLanguageFilterDir, "languageFilter.json");
var userAntiCheatDir = import_path.default.join(consolidatedDataRoot, "antiCheat");
var userAntiCheatPath = import_path.default.join(userAntiCheatDir, "AntiCheat.json");
var userOtherStuffDir = import_path.default.join(consolidatedDataRoot, "otherStuff");
var userOtherStuffPath = import_path.default.join(userOtherStuffDir, "OtherStuff.json");
if (!import_fs.default.existsSync(consolidatedDataRoot)) {
  import_fs.default.mkdirSync(consolidatedDataRoot, { recursive: true });
}
for (const dir of [
  userThemesDir,
  userApiServicesDirBase,
  userChatMessagesDir,
  userCombinedAdminWhitelistDir,
  userRulesDir,
  userLanguageFilterDir,
  userAntiCheatDir,
  userOtherStuffDir
]) {
  if (!import_fs.default.existsSync(dir)) import_fs.default.mkdirSync(dir, { recursive: true });
}
var sourceThemesDir = isDev ? import_path.default.join(__dirname, "../src/pages/settings/settingsTabs/themes") : import_path.default.join(process.resourcesPath, "themes");
function migrateThemesOnStartup() {
  const marker = import_path.default.join(userThemesDir, ".migrated");
  if (import_fs.default.existsSync(marker)) return;
  if (!import_fs.default.existsSync(userThemesDir)) return;
  for (const id of import_fs.default.readdirSync(userThemesDir)) {
    const themeDir = import_path.default.join(userThemesDir, id);
    const jsonPath = import_path.default.join(themeDir, "theme.json");
    if (!import_fs.default.existsSync(jsonPath)) continue;
    try {
      const raw = import_fs.default.readFileSync(jsonPath, "utf8");
      const t = JSON.parse(raw);
      if (t.logo && typeof t.logo === "string" && !t.logo.startsWith("theme://") && !t.logo.startsWith("http")) {
        const clean = t.logo.replace(/^\//, "");
        const ext = import_path.default.extname(clean).toLowerCase();
        if (!(ext === ".ttf" || ext === ".otf" || ext === ".woff" || ext === ".woff2")) {
          if (!clean.startsWith("images/") && !clean.startsWith("icons/")) t.logo = `images/${clean}`;
          else t.logo = clean;
        }
      }
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
      if (t.font && typeof t.font === "string" && !t.font.startsWith("theme://") && !t.font.startsWith("http")) {
        const clean = t.font.replace(/^\//, "");
        t.font = clean.startsWith("fonts/") ? clean : `fonts/${clean}`;
      }
      if (t.bodyFont && typeof t.bodyFont === "string" && !t.bodyFont.startsWith("theme://") && !t.bodyFont.startsWith("http")) {
        const clean = t.bodyFont.replace(/^\//, "");
        t.bodyFont = clean.startsWith("fonts/") ? clean : `fonts/${clean}`;
      }
      import_fs.default.writeFileSync(jsonPath, JSON.stringify(t, null, 2), "utf8");
    } catch (err) {
      console.warn("Migration failed for", jsonPath, err);
    }
  }
  try {
    import_fs.default.writeFileSync(marker, String(Date.now()), "utf8");
  } catch {
  }
}
function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function copyFolder(src, dest) {
  if (!import_fs.default.existsSync(src)) return;
  if (!import_fs.default.existsSync(dest)) import_fs.default.mkdirSync(dest, { recursive: true });
  for (const item of import_fs.default.readdirSync(src)) {
    const srcPath = import_path.default.join(src, item);
    const destPath = import_path.default.join(dest, item);
    if (import_fs.default.lstatSync(srcPath).isDirectory()) copyFolder(srcPath, destPath);
    else import_fs.default.copyFileSync(srcPath, destPath);
  }
}
function ensureThemeFolderComplete(sourceThemeFolder, destThemeFolder) {
  if (!import_fs.default.existsSync(destThemeFolder)) import_fs.default.mkdirSync(destThemeFolder, { recursive: true });
  const requiredRel = ["theme.json", "fonts", "icons", "images"];
  for (const rel of requiredRel) {
    const srcPath = import_path.default.join(sourceThemeFolder, rel);
    const destPath = import_path.default.join(destThemeFolder, rel);
    if (!import_fs.default.existsSync(srcPath)) continue;
    if (import_fs.default.lstatSync(srcPath).isFile()) {
      if (!import_fs.default.existsSync(destPath)) import_fs.default.mkdirSync(import_path.default.dirname(destPath), { recursive: true });
      if (!import_fs.default.existsSync(destPath)) import_fs.default.copyFileSync(srcPath, destPath);
      continue;
    }
    if (import_fs.default.existsSync(destPath)) {
      copyFolder(srcPath, destPath);
    } else {
      copyFolder(srcPath, destPath);
    }
  }
}
if (import_fs.default.existsSync(sourceThemesDir)) {
  for (const folder of import_fs.default.readdirSync(sourceThemesDir)) {
    const src = import_path.default.join(sourceThemesDir, folder);
    const dest = import_path.default.join(userThemesDir, folder);
    if (!import_fs.default.existsSync(src)) continue;
    if (!import_fs.default.lstatSync(src).isDirectory()) continue;
    ensureThemeFolderComplete(src, dest);
  }
}
function registerThemeProtocol() {
  import_electron.protocol.registerFileProtocol("theme", (request, callback) => {
    try {
      let url = request.url;
      if (!url.startsWith("theme://")) return callback({ path: "" });
      url = url.slice("theme://".length);
      const [themeId, ...rest] = url.split("/");
      if (!themeId) return callback({ path: "" });
      const relPath = rest.join("/");
      const absPath = import_path.default.join(userThemesDir, themeId, relPath);
      if (!import_fs.default.existsSync(absPath)) return callback({ path: "" });
      return callback({ path: absPath });
    } catch (err) {
      console.error("theme protocol error:", err);
      return callback({ path: "" });
    }
  });
}
function resolveThemeUrl(themeId, p) {
  if (!p) return null;
  if (p.startsWith("theme://")) return p;
  if (p.startsWith("/icons/") || p.startsWith("icons/")) {
    const file = p.replace(/^\/?icons\//, "");
    const filePath = import_path.default.join(userThemesDir, themeId, "icons", file);
    return (0, import_url.pathToFileURL)(filePath).href;
  }
  if (p.startsWith("/images/") || p.startsWith("images/")) {
    const file = p.replace(/^\/?images\//, "");
    const filePath = import_path.default.join(userThemesDir, themeId, "images", file);
    return (0, import_url.pathToFileURL)(filePath).href;
  }
  const normalized = p.replace(/^\//, "");
  const ext = import_path.default.extname(normalized).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"].includes(ext)) {
    const imagePath = import_path.default.join(userThemesDir, themeId, "images", normalized);
    if (import_fs.default.existsSync(imagePath)) return (0, import_url.pathToFileURL)(imagePath).href;
    const iconPath = import_path.default.join(userThemesDir, themeId, "icons", normalized);
    if (import_fs.default.existsSync(iconPath)) return (0, import_url.pathToFileURL)(iconPath).href;
  }
  if (p.startsWith("/fonts/") || p.startsWith("fonts/")) {
    const file = p.replace(/^\/?fonts\//, "");
    const filePath = import_path.default.join(userThemesDir, themeId, "fonts", file);
    return (0, import_url.pathToFileURL)(filePath).href;
  }
  if (p.startsWith("http")) return p;
  return p;
}
function loadThemesFromDisk() {
  const themes = [];
  if (!import_fs.default.existsSync(userThemesDir)) return themes;
  for (const folder of import_fs.default.readdirSync(userThemesDir)) {
    const themeFolder = import_path.default.join(userThemesDir, folder);
    const jsonPath = import_path.default.join(themeFolder, "theme.json");
    if (!import_fs.default.existsSync(jsonPath)) continue;
    try {
      const raw = import_fs.default.readFileSync(jsonPath, "utf8");
      const theme = JSON.parse(raw);
      const id = theme.id ?? folder;
      theme.id = id;
      theme.name ??= folder;
      const loadedTheme = {
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
          pluginmanager: resolveThemeUrl(id, theme.icons?.pluginmanager ?? null)
        }
      };
      themes.push(loadedTheme);
    } catch {
    }
  }
  return themes;
}
import_electron.ipcMain.handle("themes:save", async (_event, theme) => {
  if (!theme.id) theme.id = slugify(theme.name || import_crypto.default.randomUUID());
  const themeFolder = import_path.default.join(userThemesDir, theme.id);
  if (!import_fs.default.existsSync(themeFolder)) import_fs.default.mkdirSync(themeFolder, { recursive: true });
  const imagesDir = import_path.default.join(themeFolder, "images");
  const iconsDir = import_path.default.join(themeFolder, "icons");
  const fontsDir = import_path.default.join(themeFolder, "fonts");
  import_fs.default.mkdirSync(imagesDir, { recursive: true });
  import_fs.default.mkdirSync(iconsDir, { recursive: true });
  import_fs.default.mkdirSync(fontsDir, { recursive: true });
  function copyBuiltinAsset(relPath, destFolder) {
    const clean = relPath.replace(/^\//, "");
    const prodSrc = import_path.default.join(process.resourcesPath, clean);
    const devSrc = import_path.default.join(__dirname, "../public", clean);
    let sourcePath = null;
    if (import_fs.default.existsSync(prodSrc)) sourcePath = prodSrc;
    else if (import_fs.default.existsSync(devSrc)) sourcePath = devSrc;
    else {
      const basename = import_path.default.basename(clean);
      try {
        const stack = [sourceThemesDir];
        while (stack.length) {
          const dir = stack.pop();
          try {
            for (const entry of import_fs.default.readdirSync(dir)) {
              const full = import_path.default.join(dir, entry);
              try {
                const stat = import_fs.default.lstatSync(full);
                if (stat.isDirectory()) stack.push(full);
                else if (stat.isFile() && entry === basename) {
                  sourcePath = full;
                  stack.length = 0;
                  break;
                }
              } catch {
              }
            }
          } catch {
          }
        }
      } catch {
      }
    }
    if (!sourcePath || !import_fs.default.existsSync(sourcePath)) {
      console.warn("Built-in asset not found, skipping copy:", prodSrc, devSrc);
      return import_path.default.basename(clean);
    }
    const fileName = import_path.default.basename(sourcePath);
    import_fs.default.copyFileSync(sourcePath, import_path.default.join(destFolder, fileName));
    return fileName;
  }
  let finalLogo = null;
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
    "pluginmanager"
  ];
  const finalIcons = Object.fromEntries(
    iconKeys.map((k) => [k, null])
  );
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
        finalIcons[key] = `icons/${import_path.default.basename(iconPath)}`;
      }
      continue;
    }
    if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) {
      finalIcons[key] = iconPath;
      continue;
    }
    finalIcons[key] = iconPath;
  }
  function resolveFont(fontPath) {
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
  const finalTheme = {
    ...theme,
    logo: finalLogo,
    icons: finalIcons,
    font: finalFont,
    bodyFont: finalBodyFont
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
  import_fs.default.writeFileSync(import_path.default.join(themeFolder, "theme.json"), JSON.stringify(finalTheme, null, 2));
  return true;
});
import_electron.ipcMain.handle("themes:loadAll", () => loadThemesFromDisk());
import_electron.ipcMain.handle("fonts:list", () => {
  try {
    const devFontsDir = import_path.default.join(__dirname, "../public/fonts");
    const prodFontsDir = import_path.default.join(process.resourcesPath, "fonts");
    const fontsDir = import_fs.default.existsSync(prodFontsDir) ? prodFontsDir : devFontsDir;
    if (!import_fs.default.existsSync(fontsDir)) return [];
    const files = import_fs.default.readdirSync(fontsDir).filter((f) => {
      const lower = f.toLowerCase();
      return lower.endsWith(".ttf") || lower.endsWith(".otf") || lower.endsWith(".woff") || lower.endsWith(".woff2");
    }).sort((a, b) => a.localeCompare(b));
    return files;
  } catch (err) {
    console.warn("fonts:list failed:", err);
    return [];
  }
});
import_electron.ipcMain.handle("theme:saveIcon", async (_event, args) => {
  const { themeId, filename, buffer } = args;
  const themeIconDir = import_path.default.join(userThemesDir, themeId, "icons");
  await import_fs.default.promises.mkdir(themeIconDir, { recursive: true });
  const filePath = import_path.default.join(themeIconDir, filename);
  await import_fs.default.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/icons/${filename}`;
});
import_electron.ipcMain.handle("theme:saveLogo", async (_event, args) => {
  const { themeId, filename, buffer } = args;
  const dir = import_path.default.join(userThemesDir, themeId, "images");
  await import_fs.default.promises.mkdir(dir, { recursive: true });
  const filePath = import_path.default.join(dir, filename);
  await import_fs.default.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/images/${filename}`;
});
import_electron.ipcMain.handle("theme:saveFont", async (_event, args) => {
  const { themeId, filename, buffer } = args;
  const dir = import_path.default.join(userThemesDir, themeId, "fonts");
  await import_fs.default.promises.mkdir(dir, { recursive: true });
  const filePath = import_path.default.join(dir, filename);
  await import_fs.default.promises.writeFile(filePath, buffer);
  return `theme://${themeId}/fonts/${filename}`;
});
import_electron.ipcMain.handle("themes:delete", async (_event, themeId) => {
  try {
    const themeFolder = import_path.default.join(userThemesDir, themeId);
    if (!import_fs.default.existsSync(themeFolder)) return { success: false, error: "Theme not found" };
    import_fs.default.rmSync(themeFolder, { recursive: true, force: true });
    return { success: true };
  } catch (err) {
    console.error("Failed to delete theme:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("languageFilter:load", () => {
  try {
    if (!import_fs.default.existsSync(userLanguageFilterPath)) return null;
    const raw = import_fs.default.readFileSync(userLanguageFilterPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      enable: !!parsed.enable,
      wordList: Array.isArray(parsed.wordList) ? parsed.wordList.map(String) : [],
      kickReason: typeof parsed.kickReason === "string" ? parsed.kickReason : "",
      numWarnings: typeof parsed.numWarnings === "number" ? parsed.numWarnings : 0
    };
  } catch (err) {
    console.error("Failed to load language filter settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("languageFilter:save", async (_event, settings) => {
  try {
    const safe = {
      enable: !!settings.enable,
      wordList: Array.isArray(settings.wordList) ? settings.wordList.map(String) : [],
      kickReason: typeof settings.kickReason === "string" ? settings.kickReason : "",
      numWarnings: typeof settings.numWarnings === "number" && Number.isFinite(settings.numWarnings) ? settings.numWarnings : 0
    };
    import_fs.default.writeFileSync(userLanguageFilterPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save language filter settings:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("AntiCheat:load", () => {
  try {
    if (!import_fs.default.existsSync(userAntiCheatPath)) return null;
    const raw = import_fs.default.readFileSync(userAntiCheatPath, "utf8");
    const parsed = JSON.parse(raw);
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
      lastBanHours: typeof parsed.lastBanHours === "number" ? parsed.lastBanHours : 0
    };
  } catch (err) {
    console.error("Failed to load Anti Cheat settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("AntiCheat:save", async (_event, settings) => {
  try {
    const errors = [];
    if (settings.banIP && (!settings.banHours || settings.banHours <= 0)) errors.push("Please set the number of hours for IP bans.");
    if (settings.banVoilations && (!settings.banVioNo || settings.banVioNo <= 0)) errors.push("Please set the maximum number of violations allowed.");
    if (settings.banXbans && (!settings.xBansHours || settings.xBansHours <= 0)) errors.push("Please set the number of combined VAC and Game bans allowed.");
    if (settings.banVAC && (!settings.vacBans || settings.vacBans <= 0)) errors.push("Please set the number of VAC bans allowed.");
    if (settings.banGame && (!settings.gamBanHours || settings.gamBanHours <= 0)) errors.push("Please set the number of game bans allowed.");
    if (settings.daysSinceLast && (!settings.lastBanHours || settings.lastBanHours <= 0)) errors.push("Please set the game ban limit for the days-since-last check.");
    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }
    const safe = {
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
      lastBanHours: typeof settings.lastBanHours === "number" ? settings.lastBanHours : 0
    };
    import_fs.default.writeFileSync(userAntiCheatPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save Anti Cheat settings:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("OtherStuff:load", () => {
  try {
    if (!import_fs.default.existsSync(userOtherStuffPath)) return null;
    const raw = import_fs.default.readFileSync(userOtherStuffPath, "utf8");
    const parsed = JSON.parse(raw);
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
      wipeInfo: typeof parsed.wipeInfo === "string" ? parsed.wipeInfo : ""
    };
  } catch (err) {
    console.error("Failed to load OtherStuff settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("OtherStuff:save", async (_event, settings) => {
  try {
    const errors = [];
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
    const safe = {
      enableHP: !!settings.enableHP,
      chatWarn: !!settings.chatWarn,
      pingMax: typeof settings.pingMax === "number" ? settings.pingMax : 0,
      warnNo: typeof settings.warnNo === "number" ? settings.warnNo : 0,
      chatRegEx: typeof settings.chatRegEx === "string" ? settings.chatRegEx : "",
      regExForm: Array.isArray(settings.regExForm) ? settings.regExForm.map(String) : [],
      invalCharName: !!settings.invalCharName,
      invalNameReas: typeof settings.invalNameReas === "string" ? settings.invalNameReas : "",
      whenWipe: !!settings.whenWipe,
      wipeInfo: typeof settings.wipeInfo === "string" ? settings.wipeInfo : ""
    };
    import_fs.default.writeFileSync(userOtherStuffPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save OtherStuff settings:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("rules:loadAll", () => {
  try {
    if (!import_fs.default.existsSync(userRulesDir)) return [];
    const files = import_fs.default.readdirSync(userRulesDir).filter((f) => f.endsWith(".json"));
    return files.map((file) => {
      const filePath = import_path.default.join(userRulesDir, file);
      const content = import_fs.default.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      return { ...parsed, fileName: file };
    });
  } catch (err) {
    console.error("Failed to load rules:", err);
    return [];
  }
});
import_electron.ipcMain.handle("rules:save", async (_event, rule) => {
  try {
    const fileName = `${String(rule.ruleName ?? "rule").replace(/\s+/g, "_")}_${Date.now()}.json`;
    const filePath = import_path.default.join(userRulesDir, fileName);
    import_fs.default.writeFileSync(filePath, JSON.stringify(rule, null, 2), "utf8");
    return { success: true, fileName };
  } catch (err) {
    console.error("Failed to save rule:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("rules:delete", async (_event, fileName) => {
  try {
    const filePath = import_path.default.join(userRulesDir, fileName);
    if (!import_fs.default.existsSync(filePath)) return { success: false, error: "File not found" };
    import_fs.default.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete rule:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("apiServices:load", () => {
  try {
    if (!import_fs.default.existsSync(userApiServicesPath)) return null;
    const raw = import_fs.default.readFileSync(userApiServicesPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load apiServices settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("apiServices:save", async (_event, settings) => {
  try {
    import_fs.default.writeFileSync(userApiServicesPath, JSON.stringify(settings, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save apiServices settings:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("CombinedAdminWhitelist:load", () => {
  try {
    if (!import_fs.default.existsSync(userCombinedAdminWhitelistPath)) return null;
    const raw = import_fs.default.readFileSync(userCombinedAdminWhitelistPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      newAdminID: typeof parsed.newAdminID === "number" ? parsed.newAdminID : 0,
      addRemoveAdmin: typeof parsed.addRemoveAdmin === "string" ? parsed.addRemoveAdmin : "",
      enable: !!parsed.enable,
      steamID: typeof parsed.steamID === "number" ? parsed.steamID : 0,
      addRemoveList: typeof parsed.addRemoveList === "string" ? parsed.addRemoveList : "",
      kickReason: typeof parsed.kickReason === "string" ? parsed.kickReason : ""
    };
  } catch (err) {
    console.error("Failed to load CombinedAdminWhitelist settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("CombinedAdminWhitelist:save", async (_event, settings) => {
  try {
    const errors = [];
    if (settings.addRemoveAdmin && (!settings.newAdminID || settings.newAdminID <= 0)) {
      errors.push("Please set the number of hours for IP bans.");
    }
    if (settings.enable && (!settings.steamID || settings.steamID <= 0 || !settings.addRemoveList || settings.addRemoveList.trim() === "")) {
      errors.push("Missing required fields: When enabled, you must provide a valid SteamID and a list selection.");
    }
    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }
    const safe = {
      newAdminID: typeof settings.newAdminID === "number" ? settings.newAdminID : 0,
      addRemoveAdmin: typeof settings.addRemoveAdmin === "string" ? settings.addRemoveAdmin : "",
      enable: !!settings.enable,
      steamID: typeof settings.steamID === "number" ? settings.steamID : 0,
      addRemoveList: typeof settings.addRemoveList === "string" ? settings.addRemoveList : "",
      kickReason: typeof settings.kickReason === "string" ? settings.kickReason : ""
    };
    import_fs.default.writeFileSync(userCombinedAdminWhitelistPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save CombinedAdminWhitelist settings:", err);
    return { success: false, error: String(err) };
  }
});
import_electron.ipcMain.handle("ChatMessages:load", () => {
  try {
    if (!import_fs.default.existsSync(userChatMessagesPath)) return null;
    const raw = import_fs.default.readFileSync(userChatMessagesPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      id: typeof parsed.id === "string" ? parsed.id : "",
      enable: !!parsed.enable,
      sayWhat: typeof parsed.sayWhat === "string" ? parsed.sayWhat : "",
      everyMins: typeof parsed.everyMins === "number" ? parsed.everyMins : 0
    };
  } catch (err) {
    console.error("Failed to load ChatMessages settings:", err);
    return null;
  }
});
import_electron.ipcMain.handle("ChatMessages:save", async (_event, settings) => {
  try {
    const errors = [];
    if (settings.enable && (!settings.sayWhat || settings.sayWhat <= "")) errors.push("Please enter your message.");
    if (settings.enable && (!settings.everyMins || settings.everyMins <= 0)) errors.push("Please enter the frequency of the message.");
    if (errors.length) {
      return { success: false, error: "Missing values found:\n" + errors.join("\n") };
    }
    const safe = {
      id: typeof settings.id === "string" ? settings.id : "",
      enable: !!settings.enable,
      sayWhat: typeof settings.sayWhat === "string" ? settings.sayWhat : "",
      everyMins: typeof settings.everyMins === "number" ? settings.everyMins : 0
    };
    import_fs.default.writeFileSync(userChatMessagesPath, JSON.stringify(safe, null, 2), "utf8");
    return { success: true };
  } catch (err) {
    console.error("Failed to save ChatMessages settings:", err);
    return { success: false, error: String(err) };
  }
});
var mainWindow = null;
function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });
  if (isDev) mainWindow.loadURL("http://localhost:5173/");
  else mainWindow.loadFile(import_path.default.join(__dirname, "../dist/index.html"));
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.app.whenReady().then(() => {
  migrateThemesOnStartup();
  registerThemeProtocol();
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron.app.quit();
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resolveThemeUrl
});
