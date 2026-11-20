type WindowOtherStuffAPI = {
    OtherStuff: {
        load: () => Promise<OtherStuff | null>;
        save: (settings: OtherStuff) => Promise<{ success: boolean; error?: string }>;
    };
};

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

declare global {
    interface Window extends Partial<WindowOtherStuffAPI> { }
}

function getOtherStuffBridge() {
    const bridge = window.OtherStuff;
    if (!bridge) {
        throw new Error(
            "OtherStuff API is not available. Ensure electron preload exposes window.otherStuff."
        );
    }
    return bridge;
}

export async function loadOtherStuff(): Promise<OtherStuff> {
    const bridge = getOtherStuffBridge();
    const loaded = await bridge.load();
    return (
        loaded ?? {
            enableHP: false,
            chatWarn: false,
            pingMax: 0,
            warnNo: 0,
            chatRegEx: "^\[CHAT\]\s(?<sender>.+?)\[([0-9]*?\/)?(?<steamid>[0-9]{17})\]\s:\s(?<message>.+)",
            regExForm: [
                "^\[Carbon\]\s[0-9]{1,2}:[0-9]{1,2}\s((A|P)M\s)?\[.*?\]\s\[Better\sChat\]\s\[.*?\]\s(?<sender>.*?):\s(?<message>.*) ^\[Carbon\]\s[0-9]{2}:[0-9]{2}\s\[Info\]\s\[Better\sChat\]\s(?<sender>.*?):\s(?<message>.*)"
            ],
            invalCharName: false,
            invalNameReas: "",
            whenWipe: false,
            wipeInfo: "",
        }
    );
}

export async function saveOtherStuff(settings: OtherStuff) {
    const bridge = getOtherStuffBridge();
    return bridge.save(settings);
}
