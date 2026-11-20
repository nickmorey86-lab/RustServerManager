import "./otherStuff.css"
import {
    loadOtherStuff,
    saveOtherStuff
} from "../../../../../../../utils/otherStuffAPI";
import { useState, useEffect } from "react";

interface OtherStuff {
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
}

export function OtherStuff() {
    const [settings, setSettings] = useState<OtherStuff>({
        enableHP: false,
        chatWarn: false,
        pingMax: 0,
        warnNo: 0,
        chatRegEx: "^\\[CHAT\\]\\s(?<sender>.+?)\\[([0-9]*?\\/)?(?<steamid>[0-9]{17})\\]\\s:\\s(?<message>.+)",
        regExForm: [
            "^\\[Carbon\\]\\s[0-9]{1,2}:[0-9]{1,2}\\s((A|P)M\\s)?\\[.*?\\]\\s\\[Better\\sChat\\]\\s\\[.*?\\]\\s(?<sender>.*?):\\s(?<message>.*) ^\\[Carbon\\]\\s[0-9]{2}:[0-9]{2}\\s\\[Info\\]\\s\\[Better\\sChat\\]\\s(?<sender>.*?):\\s(?<message>.*)"
        ],
        invalCharName: false,
        invalNameReas: "",
        whenWipe: false,
        wipeInfo: "",
    });

    useEffect(() => {
        void (async () => {
            const loaded = await loadOtherStuff();
            setSettings(loaded);
        })();
    }, []);

    const update = (updates: Partial<OtherStuff>) => {
        setSettings((s) => ({ ...s, ...updates }));
    };

    const handleSave = () => {
        void (async () => {
            const res = await saveOtherStuff(settings);
            if (res?.success) {
                alert("Settings saved successfully!");
            } else {
                console.error("Failed to save OtherStuff settings:", res?.error);
                alert(res?.error ?? "Failed to save OtherStuff settings");
            }
        })();
    };

    return (
        <div className="otherstuff-settings">
            <section className="otherstuff-section">
                <div className="otherstuff-section-header">
                    Other Stuff
                </div>

                <div className="otherstuff-section-grid">
                    {/* High Ping Subsection */}
                    <div className="otherstuff-field">
                        <div className="otherstuff-section-subtitle">High ping</div>

                        <div className="otherstuff-inline">
                            <label>Enable</label>
                            <input
                                type="checkbox"
                                checked={settings.enableHP}
                                onChange={(e) => update({ enableHP: e.target.checked })} />
                        </div>
                        <div className="otherstuff-inline">
                            <label>Show ping warning in chat</label>
                            <input
                                type="checkbox"
                                checked={settings.chatWarn}
                                onChange={(e) => update({ chatWarn: e.target.checked })} />
                        </div>
                        <div className="otherstuff-inline-numb">
                            <label>Ping limit</label>
                            <input
                                type="number"
                                value={settings.pingMax}
                                /* FIXED: Changed e.target.checked to e.target.value */
                                onChange={(e) => update({ pingMax: Number(e.target.value) })} />
                        </div>

                        <div className="otherstuff-inline-numb">
                            <label>Amount to warnings before kick</label>
                            <input
                                type="number"
                                value={settings.warnNo}
                                /* FIXED: Changed e.target.checked to e.target.value */
                                onChange={(e) => update({ warnNo: Number(e.target.value) })} />
                        </div>
                    </div>

                    {/* Invalid Character Subsection */}
                    <div className="otherstuff-field">
                        <div className="otherstuff-section-subtitle">Invalid characters in name</div>
                        <div className="otherstuff-inline">
                            <label>Auto kick players with an invalid character in their name.</label>
                            <input
                                type="checkbox"
                                checked={settings.invalCharName}
                                onChange={(e) => update({ invalCharName: e.target.checked })} />
                        </div>
                        <label> Reason for kick:</label>
                        <input
                            type="text"
                            value={settings.invalNameReas}
                            onChange={(e) => update({ invalNameReas: e.target.value })} />
                    </div>
                </div>
            </section>



            {/* Chat Regex Section */}
            <section className="otherstuff-section">

                <div className="otherstuff-field">
                    <div className="otherstuff-section-subtitle">Chat regex</div>

                    <label>Use this to set regex ONLY if you know what you're doing</label>
                    <div className="otherstuff-inline">
                        <textarea
                            className="otherstuff-textarea"
                            value={settings.chatRegEx}
                            onChange={(e) => update({ chatRegEx: e.target.value })}
                        />
                    </div>

                    <label>Better chat regex</label>
                    <div className="otherstuff-inline">
                        <textarea
                            className="otherstuff-textarea"

                            value={settings.regExForm?.[0] ?? ""}

                            onChange={(e) => update({ regExForm: [e.target.value] })}
                        />
                    </div>
                </div>

            </section>


            <section className="otherstuff-section">
                <div className="otherstuff-field">
                    <div className="otherstuff-section-subtitle">Wipe Information</div>
                    <div className="otherstuff-inline">
                        <label>Auto response to 'when is wipe?'</label>
                        <input
                            type="checkbox"
                            checked={settings.whenWipe}
                            onChange={(e) => update({ whenWipe: e.target.checked })} />
                    </div>
                    <label>response:</label>
                    <input
                        type="text"
                        value={settings.wipeInfo}
                        onChange={(e) => update({ wipeInfo: e.target.value })} />
                </div>
            </section>


            <section className="langfil-section">
                <div className="langfil-inline" style={{ justifyContent: "flex-start" }}>
                    <button className="btn-primary" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}
