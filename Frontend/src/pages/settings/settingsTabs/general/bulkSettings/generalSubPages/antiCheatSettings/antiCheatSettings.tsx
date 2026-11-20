import "./antiCheatSettings.css"
import { useState, useEffect } from "react";
import {
    loadAntiCheatSettings,
    saveAntiCheatSettings
} from "../../../../../../../utils/antiCheatSettingsAPI";
import { ModalError } from "../../../../../../../components/ModalError/ModalError";





interface AntiCheatSettings {

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


}

export function AntiCheatSettings() {
    const [settings, setSettings] = useState<AntiCheatSettings>({
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

    })

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const closeError = () => setErrorMessage(null);

    useEffect(() => {
        void (async () => {
            const loaded = await loadAntiCheatSettings();
            setSettings(loaded);
        })();
    }, []);

    const update = (updates: Partial<AntiCheatSettings>) => {
        setSettings((s) => ({ ...s, ...updates }));
    };

    const handleSave = () => {
        void (async () => {
            const res = await saveAntiCheatSettings(settings);
            if (res?.success) {
                setErrorMessage(null);
                return;
            }

            console.error("Failed to save anti cheat settings:", res?.error);

            const errorText =
                typeof res?.error === "string" && res.error.trim().length > 0
                    ? res.error
                    : "Failed to save anticheat settings";

            setErrorMessage(errorText);
        })();
    };


    return (
        <div className="anticheat-settings">
            {errorMessage && (
                <ModalError message={errorMessage} onClose={closeError} />
            )}

            <section className="anticheat-section">
                <div className="anticheat-header">Anti-Cheat Settings</div>

                <div className="anticheat-section-body">
                    <div className="anticheat-field">
                        <div className="anticheat-inline">
                            <label>Auto kick players with no steam ID</label>
                            <input
                                type="checkbox"
                                checked={settings.autoKick}
                                onChange={(e) => update({ autoKick: e.target.checked })} />
                        </div>
                        <div className="anticheat-inline">
                            <label>
                                Autoban players who kill at invalid range based on their used weapon
                            </label>
                            <input
                                type="checkbox"
                                checked={settings.autoBan}
                                onChange={(e) => update({ autoBan: e.target.checked })} />
                        </div>
                        <div className="anticheat-inline">
                            <label>
                                Ban IP of player for
                            </label>
                            <input
                                type="number"
                                value={settings.banHours}
                                onChange={(e) => update({ banHours: Number(e.target.value) })} />
                            <label>when they are banned from the server</label>
                            <input
                                type="checkbox"
                                checked={settings.banIP}
                                onChange={(e) => update({ banIP: e.target.checked })} />
                        </div>

                        <div className="anticheat-inline">
                            <label>Auto ban players with more than</label>
                            <input
                                type="number"
                                value={settings.banVioNo}
                                onChange={(e) => update({ banVioNo: Number(e.target.value) })}
                            />
                            <label>violations</label>
                            <input
                                type="checkbox"
                                checked={settings.banVoilations}
                                onChange={(e) => update({ banVoilations: e.target.checked })} />
                        </div>
                        <div className="anticheat-inline">
                            <label>Auto ban players with</label>
                            <input
                                type="number"
                                value={settings.xBansHours}
                                onChange={(e) => update({ xBansHours: Number(e.target.value) })}
                            />
                            <label>bans (VAC and Game bans)</label>
                            <input
                                type="checkbox"
                                checked={settings.banXbans}
                                onChange={(e) => update({ banXbans: e.target.checked })}
                            />
                        </div>
                        <div className="anticheat-inline">
                            <label>Auto ban players with</label>
                            <input
                                type="number"
                                value={settings.vacBans}
                                onChange={(e) => update({ vacBans: Number(e.target.value) })}
                            />
                            <label>VAC bans</label>
                            <input
                                type="checkbox"
                                checked={settings.banVAC}
                                onChange={(e) => update({ banVAC: e.target.checked })}
                            />
                        </div>
                        <div className="anticheat-inline">
                            <label>Auto ban players with</label>
                            <input
                                type="number"
                                value={settings.gamBanHours}
                                onChange={(e) => update({ gamBanHours: Number(e.target.value) })}
                            />
                            <label>game bans</label>
                            <input
                                type="checkbox"
                                checked={settings.banGame}
                                onChange={(e) => update({ banGame: e.target.checked })}
                            />
                        </div>
                        <div className="anticheat-inline">
                            <label>Auto ban players with</label>
                            <input
                                type="number"
                                value={settings.lastBanHours}
                                onChange={(e) => update({ lastBanHours: Number(e.target.value) })}
                            />
                            <label>game bans</label>
                            <input
                                type="checkbox"
                                checked={settings.daysSinceLast}
                                onChange={(e) => update({ daysSinceLast: e.target.checked })}
                            />
                        </div>
                    </div>
                </div>

            </section >
            <section className="langfil-section">

                <div className="langfil-inline" style={{ justifyContent: "flex-start" }}>
                    <button className="btn-primary" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </section>
        </div >
    );
}