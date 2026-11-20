/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import "./apiServices.css";
import { useEffect, useState } from "react";
import { loadApiServicesSettings, saveApiServicesSettings } from "../../../../../../../utils/apiServicesAPI";
import { browseMapFile } from "../../../../../../../utils/apiServicesBrowseAPI";
import { ModalError } from "../../../../../../../components/ModalError/ModalError";

/* -------------------------------------------------------
   TYPES (local for now, later we can share with backend)
------------------------------------------------------- */

interface ApiSettings {
    steamKey: string;
    rustMapsKey: string;
    codeflingKey: string;
    umodLoggedIn: boolean;
}

interface MapServerSettings {
    listenIp: string;
    port: string;
    mapFile: string;
}

interface RsmApiSettings {
    enabled: boolean;
    listenIp: string;
    port: string;
    apiKey: string;
    tlsEnabled: boolean;
    certFile: string;
    keyFile: string;
}

interface ManagerSettings {
    trayEnabled: boolean;
    trayTitle: string;
}

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function APIServices() {
    // For now, local state only. Later we’ll load/save via IPC.
    const [api, setApi] = useState<ApiSettings>({
        steamKey: "",
        rustMapsKey: "",
        codeflingKey: "",
        umodLoggedIn: false
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const closeError = () => setErrorMessage(null);

    const [mapServer, setMapServer] = useState<MapServerSettings>({
        listenIp: "0.0.0.0",
        port: "8080",
        mapFile: ""
    });

    const [rsmApi, setRsmApi] = useState<RsmApiSettings>({
        enabled: false,
        listenIp: "0.0.0.0",
        port: "7744",
        apiKey: "",
        tlsEnabled: false,
        certFile: "",
        keyFile: ""
    });

    const [manager, setManager] = useState<ManagerSettings>({
        trayEnabled: true,
        trayTitle: "Rust Server Manager"
    });

    useEffect(() => {
        void (async () => {
            const loaded = await loadApiServicesSettings();
            setApi(loaded.api);
            setMapServer(loaded.mapServer);
            setRsmApi(loaded.rsmApi);
            setManager(loaded.manager);
        })();
    }, []);

    const handleBrowseMap = async () => {
        const current = mapServer.mapFile;
        const res = await browseMapFile(current || undefined);
        if (!res.success) {
            if (res.error) setErrorMessage(res.error);
            return;
        }
        if (!res.filePath) return;
        setMapServer(s => ({ ...s, mapFile: res.filePath! }));
    };



    const handleStartMapServer = () => {
        // TODO: IPC to start map server
        console.log("Start map server (TODO)", mapServer);
    };

    const handleStartRsmApi = () => {
        // TODO: IPC to start RSM API
        console.log("Start RSM API (TODO)", rsmApi);
    };

    const handleTestSteamKey = () => {
        // TODO: IPC to test Steam API key
        console.log("Test Steam key (TODO)", api.steamKey);
    };

    const handleTestRustMapsKey = () => {
        // TODO: IPC to test Rust Maps key
        console.log("Test Rust Maps key (TODO)", api.rustMapsKey);
    };

    const handleTestCodeflingKey = () => {
        // TODO: IPC to test Codefling key
        console.log("Test Codefling key (TODO)", api.codeflingKey);
    };

    const handleUmodLogin = () => {
        // TODO: open WebView2 login helper via IPC
        console.log("uMod login (TODO)");
    };

    const handleSaveManagerSettings = () => {
        const missing: string[] = [];

        if (!api.steamKey.trim()) missing.push("Steam Web API Key");
        if (!api.rustMapsKey.trim()) missing.push("Rust Maps API Key");
        if (!api.codeflingKey.trim()) missing.push("Codefling API Key");

        if (!mapServer.listenIp.trim()) missing.push("Map Server Listen IP");
        if (!mapServer.port.trim()) missing.push("Map Server Port");
        if (!mapServer.mapFile.trim()) missing.push("Map File");

        if (rsmApi.enabled) {
            if (!rsmApi.listenIp.trim()) missing.push("RSM API Host IP");
            if (!rsmApi.port.trim()) missing.push("RSM API Port");
            if (!rsmApi.apiKey.trim()) missing.push("RSM API Key");

            if (rsmApi.tlsEnabled) {
                if (!rsmApi.certFile.trim()) missing.push("TLS Certificate File (.crt)");
                if (!rsmApi.keyFile.trim()) missing.push("TLS Key File (.key)");
            }
        }

        if (missing.length > 0) {
            setErrorMessage(`Cannot save: missing required fields:\n- ${missing.join("\n- ")}`);
            return;
        }

        void (async () => {
            const settings = {
                api,
                mapServer,
                rsmApi,
                manager
            };
            const res = await saveApiServicesSettings(settings);

            if (res?.success) {
                setErrorMessage(null);
                return;
            }

            const errorText =
                typeof res?.error === "string" && res.error.trim().length > 0
                    ? res.error
                    : "Failed to save apiServices settings";

            console.error("Failed to save apiServices settings:", res?.error);
            setErrorMessage(errorText);
        })();
    };



    return (
        <div className="apiset-scroll">
            {errorMessage && (
                <ModalError message={errorMessage} onClose={closeError} />
            )}

            <div className="apiset-settings">
                <section className="apiset-section">
                    <div className="apiset-section-header">
                        API Keys
                    </div>

                    <div className="apiset-section-body api-keys-grid">
                        <div className="apiset-field">
                            <label>Steam Web API Key</label>
                            <div className="apiset-inline-extend">
                                <input
                                    type="text"
                                    value={api.steamKey}
                                    onChange={e => setApi(a => ({ ...a, steamKey: e.target.value }))}
                                    placeholder="Enter Steam Web API key"
                                />
                                <button className="btn-secondary" onClick={handleTestSteamKey}>
                                    Get Key
                                </button>
                            </div>
                            <div className="apiset-help-text">
                                Used to fetch player data: bans, server hours, country, IP.
                            </div>
                        </div>

                        {/* Rust Maps API */}
                        <div className="apiset-field">
                            <label>Rust Maps API Key</label>
                            <div className="apiset-inline-extend">
                                <input
                                    type="text"
                                    value={api.rustMapsKey}
                                    onChange={e =>
                                        setApi(a => ({ ...a, rustMapsKey: e.target.value }))
                                    }
                                    placeholder="Enter Rust Maps API key"
                                />
                                <button className="btn-secondary" onClick={handleTestRustMapsKey}>
                                    Get Key
                                </button>
                            </div>
                            <div className="apiset-help-text">
                                Used to generate and view map previews.
                            </div>
                        </div>

                        {/* uMod login */}
                        <div className="apiset-field">
                            <label>uMod Account</label>
                            <div className="apiset-inline">
                                <button className="btn-primary" onClick={handleUmodLogin}>
                                    {api.umodLoggedIn ? "Re‑Login to uMod" : "Login to uMod"}
                                </button>
                            </div>
                            <div className="apiset-help-text">
                                Used to check for updates and install plugins via uMod, it also allows RSM to check for updates.
                            </div>
                        </div>

                        {/* Codefling API */}
                        <div className="apiset-field">
                            <label>Codefling API Key</label>
                            <div className="apiset-inline-extend">
                                <input
                                    type="text"
                                    value={api.codeflingKey}
                                    onChange={e =>
                                        setApi(a => ({ ...a, codeflingKey: e.target.value }))
                                    }
                                    placeholder="Enter Codefling API key"
                                />
                                <button className="btn-secondary" onClick={handleTestCodeflingKey}>
                                    Get Key
                                </button>
                            </div>
                            <div className="apiset-help-text">
                                Used to check for updates and install plugins via Carbon, it also allows RSM to check for updates.
                            </div>
                        </div>
                    </div>
                </section>


                <section className="apiset-section">
                    <div className="apiset-section-header">
                        Services
                    </div>

                    <div className="apiset-section-body services-grid">
                        <div className="apiset-field">
                            <div className="apiset-section-subtitle">
                                Map Server
                            </div>

                            <label>Listen IP</label>
                            <div className="apiset-box">
                                <input
                                    type="text"
                                    value={mapServer.listenIp}
                                    onChange={e =>
                                        setMapServer(s => ({ ...s, listenIp: e.target.value }))
                                    }
                                    placeholder="0.0.0.0"
                                />
                            </div>
                            <label>Port</label>
                            <div className="apiset-box">
                                <input
                                    type="text"
                                    value={mapServer.port}
                                    onChange={e =>
                                        setMapServer(s => ({ ...s, port: e.target.value }))
                                    }
                                    placeholder="7744"
                                />
                            </div>
                            <label>Map File</label>
                            <div className="apiset-inline-extend">
                                <input
                                    type="text"
                                    value={mapServer.mapFile}
                                    onChange={e =>
                                        setMapServer(s => ({ ...s, mapFile: e.target.value }))
                                    }
                                    placeholder="Select a .map file"
                                    readOnly
                                />
                                <button className="btn-secondary" onClick={handleBrowseMap}>
                                    Browse…
                                </button>
                            </div>
                            <div className="apiset-inline">
                                <button className="btn-primary" onClick={handleStartMapServer}>
                                    Start Map Server
                                </button>
                            </div>

                            <div className="apiset-help-text">
                                You will need to allow RSM through your firewall and also forward the port on your router.
                            </div>

                        </div>



                        {/* RSM API */}
                        <div className="apiset-field">
                            <div className="apiset-section-subtitle" style={{ marginBottom: 8 }}>
                                RSM API
                            </div>


                            <label>
                                <input
                                    type="checkbox"
                                    checked={rsmApi.enabled}
                                    onChange={e =>
                                        setRsmApi(s => ({ ...s, enabled: e.target.checked }))
                                    }
                                />{" "}
                                Enable RSM API
                            </label>

                            <label>Host IP</label>
                            <div className="apiset-box">
                                <input
                                    type="text"
                                    value={rsmApi.listenIp}
                                    onChange={e =>
                                        setRsmApi(s => ({ ...s, listenIp: e.target.value }))
                                    }
                                    placeholder="0.0.0.0"
                                />
                            </div>

                            <label>Port</label>
                            <div className="apiset-box">
                                <input
                                    type="text"
                                    value={rsmApi.port}
                                    onChange={e =>
                                        setRsmApi(s => ({ ...s, port: e.target.value }))
                                    }
                                    placeholder="7744"
                                />
                            </div>

                            <label>API Key</label>
                            <input
                                type="text"
                                value={rsmApi.apiKey}
                                onChange={e =>
                                    setRsmApi(s => ({ ...s, apiKey: e.target.value }))
                                }
                                placeholder="Auto‑generated or custom API key"
                            />

                            <label>
                                <input
                                    type="checkbox"
                                    checked={rsmApi.tlsEnabled}
                                    onChange={e =>
                                        setRsmApi(s => ({ ...s, tlsEnabled: e.target.checked }))
                                    }
                                />{" "}
                                Enable TLS
                            </label>


                            <label>TLS Certificate File (.crt)</label>
                            <input
                                type="text"
                                value={rsmApi.certFile}
                                onChange={e =>
                                    setRsmApi(s => ({ ...s, certFile: e.target.value }))
                                }
                                placeholder="Path to certificate file"
                            />


                            <label>TLS Key File (.key)</label>
                            <input
                                type="text"
                                value={rsmApi.keyFile}
                                onChange={e =>
                                    setRsmApi(s => ({ ...s, keyFile: e.target.value }))
                                }
                                placeholder="Path to key file"
                            />

                            <div className="apiset-inline">
                                <button className="btn-primary" onClick={handleStartRsmApi}>
                                    Start RSM Server
                                </button>
                            </div>

                        </div>
                    </div>
                </section >

                {/* Server Manager Settings */}
                < section className="apiset-section" >
                    <div className="apiset-section-header">
                        Server Manager Settings
                    </div>

                    <div className="apiset-section-body manager-grid">
                        <div className="apiset-field">
                            <div className="apiset-inline">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={manager.trayEnabled}
                                        onChange={e =>
                                            setManager(s => ({ ...s, trayEnabled: e.target.checked }))
                                        }
                                    />{" "}
                                    Enable tray icon (minimize to tray)
                                </label>
                            </div>

                            <div className="apiset-inline">
                                <label>Tray hover title</label>
                            </div>
                            <div className="apiset-inline">
                                <input
                                    type="text"
                                    value={manager.trayTitle}
                                    onChange={e =>
                                        setManager(s => ({ ...s, trayTitle: e.target.value }))
                                    }
                                    placeholder="Rust Server Manager"
                                />
                            </div>

                        </div>
                    </div>
                </section >
                <section className="apiset-footer">
                    <div className="apiset-inline">
                        <button className="btn-primary" onClick={handleSaveManagerSettings}>
                            Save
                        </button>
                    </div>

                </section>
            </div >
        </div>
    );
}
