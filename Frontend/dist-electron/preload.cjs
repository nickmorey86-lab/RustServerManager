// preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("themeAPI", {
  save: (theme) => import_electron.ipcRenderer.invoke("themes:save", theme),
  delete: (themeId) => import_electron.ipcRenderer.invoke("themes:delete", themeId),
  saveIcon: (themeId, filename, buffer) => import_electron.ipcRenderer.invoke("theme:saveIcon", { themeId, filename, buffer }),
  saveLogo: (themeId, filename, buffer) => import_electron.ipcRenderer.invoke("theme:saveLogo", { themeId, filename, buffer }),
  saveFont: (themeId, filename, buffer) => import_electron.ipcRenderer.invoke("theme:saveFont", { themeId, filename, buffer }),
  loadAll: () => import_electron.ipcRenderer.invoke("themes:loadAll"),
  getFonts: () => import_electron.ipcRenderer.invoke("fonts:list"),
  loadThemeId: () => localStorage.getItem("activeThemeId"),
  saveThemeId: (id) => localStorage.setItem("activeThemeId", id)
});
import_electron.contextBridge.exposeInMainWorld("rules", {
  loadAll: () => import_electron.ipcRenderer.invoke("rules:loadAll"),
  save: (rule) => import_electron.ipcRenderer.invoke("rules:save", rule),
  delete: (fileName) => import_electron.ipcRenderer.invoke("rules:delete", fileName)
});
import_electron.contextBridge.exposeInMainWorld("apiServices", {
  load: () => import_electron.ipcRenderer.invoke("apiServices:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("apiServices:save", settings),
  browseMapFile: (opts) => import_electron.ipcRenderer.invoke("apiServices:browseMapFile", opts)
});
import_electron.contextBridge.exposeInMainWorld("languageFilter", {
  load: () => import_electron.ipcRenderer.invoke("languageFilter:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("languageFilter:save", settings)
});
import_electron.contextBridge.exposeInMainWorld("AntiCheat", {
  load: () => import_electron.ipcRenderer.invoke("AntiCheat:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("AntiCheat:save", settings)
});
import_electron.contextBridge.exposeInMainWorld("OtherStuff", {
  load: () => import_electron.ipcRenderer.invoke("OtherStuff:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("OtherStuff:save", settings)
});
import_electron.contextBridge.exposeInMainWorld("CombinedAdminWhitelist", {
  load: () => import_electron.ipcRenderer.invoke("CombinedAdminWhitelist:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("CombinedAdminWhitelist:save", settings)
});
import_electron.contextBridge.exposeInMainWorld("serverMessages", {
  load: () => import_electron.ipcRenderer.invoke("serverMessages:load"),
  save: (settings) => import_electron.ipcRenderer.invoke("serverMessages:save", settings)
});
