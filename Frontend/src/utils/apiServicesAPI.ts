type ApiServicesSettings = {
    api: {
        steamKey: string;
        rustMapsKey: string;
        codeflingKey: string;
        umodLoggedIn: boolean;
    };
    mapServer: {
        listenIp: string;
        port: string;
        mapFile: string;
    };
    rsmApi: {
        enabled: boolean;
        listenIp: string;
        port: string;
        apiKey: string;
        tlsEnabled: boolean;
        certFile: string;
        keyFile: string;
    };
    manager: {
        trayEnabled: boolean;
        trayTitle: string;
    };
};

type WindowApiServicesAPI = {
    apiServices: {
        load: () => Promise<ApiServicesSettings | null>;
        save: (settings: ApiServicesSettings) => Promise<{ success: boolean; error?: string }>;
    };
};

declare global {
    interface Window extends WindowApiServicesAPI { }
}

export async function loadApiServicesSettings(): Promise<ApiServicesSettings> {
    const loaded = await window.apiServices.load();
    return (
        loaded ?? {
            api: { steamKey: "", rustMapsKey: "", codeflingKey: "", umodLoggedIn: false },
            mapServer: { listenIp: "0.0.0.0", port: "8080", mapFile: "" },
            rsmApi: {
                enabled: false,
                listenIp: "0.0.0.0",
                port: "7744",
                apiKey: "",
                tlsEnabled: false,
                certFile: "",
                keyFile: ""
            },
            manager: { trayEnabled: true, trayTitle: "Rust Server Manager" }
        }
    );
}

export async function saveApiServicesSettings(settings: ApiServicesSettings) {
    return window.apiServices.save(settings);
}

