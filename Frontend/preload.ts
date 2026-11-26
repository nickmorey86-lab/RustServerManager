import { contextBridge, ipcRenderer } from "electron";
import type { ThemeDefinition } from "./src/pages/settings/settingsTabs/themes/themeTypes";
type AntiChatSpamRule = Record<string, unknown>;

contextBridge.exposeInMainWorld("themeAPI", {
  save: (theme: ThemeDefinition) => ipcRenderer.invoke("themes:save", theme),
  delete: (themeId: string) => ipcRenderer.invoke("themes:delete", themeId),
  saveIcon: (themeId: string, filename: string, buffer: Buffer) =>
    ipcRenderer.invoke("theme:saveIcon", { themeId, filename, buffer }),
  saveLogo: (themeId: string, filename: string, buffer: Buffer) =>
    ipcRenderer.invoke("theme:saveLogo", { themeId, filename, buffer }),
  saveFont: (themeId: string, filename: string, buffer: Buffer) =>
    ipcRenderer.invoke("theme:saveFont", { themeId, filename, buffer }),
  loadAll: (): Promise<ThemeDefinition[]> => ipcRenderer.invoke("themes:loadAll"),
  getFonts: (): Promise<string[]> => ipcRenderer.invoke("fonts:list"),
  loadThemeId: () => localStorage.getItem("activeThemeId"),
  saveThemeId: (id: string) => localStorage.setItem("activeThemeId", id)
});

contextBridge.exposeInMainWorld("rules", {
  loadAll: (): Promise<AntiChatSpamRule[]> => ipcRenderer.invoke("rules:loadAll"),
  save: (rule: AntiChatSpamRule) => ipcRenderer.invoke("rules:save", rule),
  delete: (fileName: string) => ipcRenderer.invoke("rules:delete", fileName)
});

contextBridge.exposeInMainWorld("apiServices", {
load: (): Promise<Record<string, unknown> | null> =>
  ipcRenderer.invoke("apiServices:load"),
save: (settings: Record<string, unknown>) =>
  ipcRenderer.invoke("apiServices:save", settings),
  browseMapFile: (opts?: { defaultPath?: string }) =>
    ipcRenderer.invoke("apiServices:browseMapFile", opts)
});


contextBridge.exposeInMainWorld("languageFilter", {
  load: (): Promise<Record<string, unknown> | null> => ipcRenderer.invoke("languageFilter:load"),
  save: (settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("languageFilter:save", settings)
});

contextBridge.exposeInMainWorld("AntiCheat", {
  load: (): Promise<Record<string, unknown> | null> => ipcRenderer.invoke("AntiCheat:load"),
  save: (settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("AntiCheat:save", settings)

});

contextBridge.exposeInMainWorld("OtherStuff", {
  load: (): Promise<Record<string, unknown> | null> => ipcRenderer.invoke("OtherStuff:load"),
  save: (settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("OtherStuff:save", settings)

})

contextBridge.exposeInMainWorld("CombinedAdminWhitelist", {
  load: (): Promise<Record<string, unknown> | null> => ipcRenderer.invoke("CombinedAdminWhitelist:load"),
  save: (settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("CombinedAdminWhitelist:save", settings)

})

contextBridge.exposeInMainWorld("serverMessages", {
  load: (): Promise<Record<string, unknown> | null> => ipcRenderer.invoke("serverMessages:load"),
  save: (settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke("serverMessages:save", settings)

})








