type adminWhitelistAPI = {
    AdminWhitelist: {
        load: () => Promise<CombinedAdminWhitelist | null>;
        save: (settings: CombinedAdminWhitelist) => Promise<{ success: boolean; error?: string }>;
    };
};

type CombinedAdminWhitelist = {
    newAdminID: number;
    addRemoveAdmin: string;
    enable: boolean;
    steamID: number;
    addRemoveList: string;
    kickReason: string;
};

declare global {
    interface Window extends Partial<adminWhitelistAPI> {
        CombinedAdminWhitelist?: adminWhitelistAPI["AdminWhitelist"];
    }
}

function getCombinedAdminWhitelistBridge() {
    const bridge = window.CombinedAdminWhitelist;

    if (!bridge) {
        throw new Error(
            "CombinedAdminWhitelist API is not available. Ensure electron preload exposes window.CombinedAdminWhitelist."
        );
    }
    return bridge;
}


export async function loadCombinedAdminWhitelist(): Promise<CombinedAdminWhitelist> {
    const bridge = getCombinedAdminWhitelistBridge();
    const loaded = await bridge.load();
    return (
        loaded ?? {
            newAdminID: 0,
            addRemoveAdmin: "",
            enable: true,
            steamID: 0,
            addRemoveList: "",
            kickReason: "",
        }
    );
}
export async function saveCombinedAdminWhitelist(settings: CombinedAdminWhitelist) {
    const bridge = getCombinedAdminWhitelistBridge();
    return bridge.save(settings);
}
