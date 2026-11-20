type WindowLanguageFilterAPI = {
    languageFilter: {
        load: () => Promise<LanguageFilterSettings | null>;
        save: (settings: LanguageFilterSettings) => Promise<{ success: boolean; error?: string }>;
    };
};

type LanguageFilterSettings = {
    enable: boolean;
    wordList: string[];
    kickReason: string;
    numWarnings: number;
};

declare global {
    interface Window extends Partial<WindowLanguageFilterAPI> { }
}

function getLanguageFilterBridge() {
    const bridge = window.languageFilter;
    if (!bridge) {
        throw new Error(
            "languageFilter API is not available. Ensure electron preload exposes window.languageFilter."
        );
    }
    return bridge;
}

export async function loadLanguageFilterSettings(): Promise<LanguageFilterSettings> {
    const bridge = getLanguageFilterBridge();
    const loaded = await bridge.load();
    return (
        loaded ?? {
            enable: false,
            wordList: [],
            kickReason: "",
            numWarnings: 0
        }
    );
}

export async function saveLanguageFilterSettings(settings: LanguageFilterSettings) {
    const bridge = getLanguageFilterBridge();
    return bridge.save(settings);
}

