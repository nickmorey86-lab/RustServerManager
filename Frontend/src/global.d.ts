// global.d.ts
import type { ThemeDefinition } from "./pages/settings/settingsTabs/themes/themeTypes";
import type { Buffer } from "buffer";


export { };

declare global {
  interface Window {
    servers: {
      start(id: number): Promise<void>;
      stop(id: number): Promise<void>;
      restart(id: number): Promise<void>;
    };

    themeAPI: {
      save: (theme: ThemeDefinition) => Promise<boolean>;
      saveIcon: (themeId: string, filename: string, buffer: Buffer) => Promise<string>;
      saveLogo: (themeId: string, filename: string, buffer: Buffer) => Promise<string>;
      saveFont: (themeId: string, filename: string, buffer: Buffer) => Promise<string>;
      loadAll: () => Promise<ThemeDefinition[]>;
      getFonts: () => Promise<string[]>;
      loadThemeId: () => string | null;
      saveThemeId: (id: string) => void;
    };
  }
}
