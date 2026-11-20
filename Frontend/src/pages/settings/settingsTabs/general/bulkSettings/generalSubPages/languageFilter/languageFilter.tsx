import "./languageFilter.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    loadLanguageFilterSettings,
    saveLanguageFilterSettings
} from "../../../../../../../utils/languageFilterAPI";
import { ModalError } from "../../../../../../../components/ModalError/ModalError";

interface LanguageFilterSettings {

    enable: boolean;
    wordList: string[];
    kickReason: string;
    numWarnings: number;
}

export function LanguageFilter() {
    const [settings, setSettings] = useState<LanguageFilterSettings>({
        enable: true,
        wordList: [],
        kickReason: "",
        numWarnings: 0
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const closeError = () => setErrorMessage(null);

    // For a friendlier textarea UX.
    const wordListText = useMemo(() => settings.wordList.join("\n"), [settings.wordList]);

    // Guard against async load races during mount/unmount churn (tab animations).
    const didLoadRef = useRef(false);

    useEffect(() => {
        if (didLoadRef.current) return;
        didLoadRef.current = true;

        void (async () => {
            const loaded = await loadLanguageFilterSettings();
            setSettings((prev) => {
                // Avoid redundant state updates.
                if (JSON.stringify(prev) === JSON.stringify(loaded)) return prev;
                return loaded;
            });
        })();
    }, []);


    const update = (updates: Partial<LanguageFilterSettings>) => {
        setSettings((s) => ({ ...s, ...updates }));
    };

    const parseWordListFromText = (text: string) => {
        return text
            .split(/\r?\n/g)
            .map((l) => l.trim())
            .filter(Boolean);
    };

    const handleSave = () => {
        const missing: string[] = [];

        if (settings.enable) {
            if (settings.wordList.length === 0) missing.push("Word list");
            if (!settings.kickReason.trim()) missing.push("Kick reason");
            if (!Number.isFinite(settings.numWarnings) || settings.numWarnings <= 0)
                missing.push("Number of warnings (must be > 0)");
        }

        if (missing.length > 0) {
            setErrorMessage(
                `Cannot save language filter settings:\n- ${missing.join("\n- ")}`
            );
            return;
        }

        void (async () => {
            const res = await saveLanguageFilterSettings(settings);

            if (res?.success) {
                setErrorMessage(null);
                return;
            }

            console.error("Failed to save language filter settings:", res?.error);

            const errorText =
                typeof res?.error === "string" && res.error.trim().length > 0
                    ? res.error
                    : "Failed to save language filter settings";

            setErrorMessage(errorText);
        })();
    };

    return (
        <div className="langfil-settings">
            {errorMessage && (
                <ModalError message={errorMessage} onClose={closeError} />
            )}

            <section className="langfil-section">
                <div className="langfil-section-header">
                    Language Filter
                </div>


                <div className="langfil-field">

                    <div className="langfil-inline">
                        <label>Enabled</label>
                        <input
                            type="checkbox"
                            checked={settings.enable}
                            onChange={(e) => update({ enable: e.target.checked })}
                        />
                    </div>
                </div>




                <div className="langfil-field">
                    <label>Word List (one per line)</label>
                    <textarea
                        className="langfil-textarea"
                        value={wordListText}
                        onChange={(e) =>
                            update({ wordList: parseWordListFromText(e.target.value) })
                        }
                        placeholder="badword1\nbadword2"
                        disabled={!settings.enable}
                    />
                    <div className="langfil-help-text">
                        Add words/phrases that should trigger the language filter.
                    </div>
                </div>
            </section>
            <section className="langfil-section">

                {/* kickReason + numWarnings together */}
                <div className="langfil-section-grid" style={{ marginTop: 12 }}>
                    <div className="langfil-field">
                        <label>Kick Reason</label>
                        <div className="langfil-inline-text">
                            <input
                                type="text"
                                value={settings.kickReason}
                                onChange={(e) => update({ kickReason: e.target.value })}
                                placeholder="Reason shown when the player is kicked"
                                disabled={!settings.enable}
                            />
                        </div>
                    </div>

                    <div className="langfil-field">
                        <label>Number of Warnings:</label>

                        <div className="langfil-inline-numb">
                            <input
                                type="number"
                                value={settings.numWarnings}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const n = raw === "" ? 0 : Number(raw);
                                    update({ numWarnings: n });
                                }}

                                disabled={!settings.enable}
                            />
                        </div>
                    </div>
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

