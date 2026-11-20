type WindowAntiCheatAPI = {
    AntiCheat: {
        load: () => Promise<AntiCheatSettings | null>;
        save: (settings: AntiCheatSettings) => Promise<{ success: boolean; error?: string }>;
    };
};

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

declare global {
    interface Window extends Partial<WindowAntiCheatAPI> { }
}

function getAntiCheatBridge() {
    const bridge = window.AntiCheat;
    if (!bridge) {
        throw new Error(
            "AntiCheat API is not available. Ensure electron preload exposes window.AntiCheat."
        );
    }
    return bridge;
}

export async function loadAntiCheatSettings(): Promise<AntiCheatSettings> {
    const bridge = getAntiCheatBridge();
    const loaded = await bridge.load();
    return (
        loaded ?? {
            autoKick: false,
            autoBan: false,
            banIP: false,
            banHours: 0,
            banVoilations: false,
            banVioNo: 0,
            banXbans: false,
            xBansHours: 0,
            banVAC: false,
            vacBans: 0,
            banGame: false,
            gamBanHours: 0,
            daysSinceLast: false,
            lastBanHours: 0,
        }
    );
}

export async function saveAntiCheatSettings(settings: AntiCheatSettings) {
    const bridge = getAntiCheatBridge();
    return bridge.save(settings);
}
