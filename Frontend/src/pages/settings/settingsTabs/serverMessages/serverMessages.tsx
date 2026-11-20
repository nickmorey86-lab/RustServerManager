import "./serverMessages.css";
import {
    loadChatMessages,
    saveChatMessages
} from "../../../../utils/serverMessagesAPI";
import { useEffect, useRef, useState } from "react";
import { ModalError } from "../../../../components/ModalError/ModalError";



export interface ChatMessages {
    id: string;
    enable: boolean;
    sayWhat: string;
    everyMins: number;
}
export interface MessagesList {

    enable: boolean;
    sayWhat: string;
    everyMins: number;
}

export function ServerMessages() {

    const [settings, setSettings] = useState<MessagesList>({
        enable: true,
        sayWhat: "",
        everyMins: 0,
    });

    const [saveError, setSaveError] = useState<string | null>(null);
    const [MessageTableRows, setMessageTableRows] = useState<ChatMessages[]>([]);

    useEffect(() => {
        void (async () => {
            const loaded = await loadChatMessages();
            // Store enabled/sayWhat/everyMins in the form inputs
            // and also derive the table rows from that single config.
            if (loaded) {
                const normalized = {
                    ...loaded,
                    enable: Boolean((loaded as any).enable ?? true),
                    sayWhat: String((loaded as any).sayWhat ?? ""),
                    everyMins: Number((loaded as any).everyMins ?? 0),
                };

                setSettings(normalized);

                // For server messages we support multiple rows in the table.
                // If the backend only provides a single config, we normalize it into one row.
                const hasAny = normalized.everyMins > 0 || normalized.sayWhat.trim();
                const rows: ChatMessages[] = hasAny
                    ? [
                        {
                            id: crypto.randomUUID(),
                            enable: normalized.enable,
                            sayWhat: normalized.sayWhat,
                            everyMins: normalized.everyMins,
                        },
                    ]
                    : [];
                setMessageTableRows(rows);
            }
        })();
    }, []);

    const update = (updates: Partial<MessagesList>) => {
        setSettings((s) => ({ ...s, ...updates }));
    };

    const addMessagesToTable = () => {
        // This page is a single-config API, so the table should only contain complete rows.
        if (!settings.enable) {
            setMessageTableRows([]);
            return;
        }

        if (!settings.sayWhat.trim()) {
            setSaveError("Cannot add: Server message text (sayWhat) is required.");
            return;
        }

        if (!Number.isFinite(settings.everyMins) || settings.everyMins <= 0) {
            setSaveError("Cannot add: Frequency (everyMins) must be greater than 0.");
            return;
        }


        const newRow: ChatMessages = {
            id: crypto.randomUUID(),
            enable: settings.enable,
            sayWhat: settings.sayWhat,
            everyMins: settings.everyMins,
        };
        setMessageTableRows((rows) => [...rows, newRow]);

        // Clear input fields after adding.
        setSettings((s) => ({ ...s, sayWhat: "", everyMins: 0 }));
    };
    const removeMessageFromTable = (idToRemove: string) => {
        setMessageTableRows(MessageTableRows.filter(row => row.id !== idToRemove));
        // also update form inputs to match table empty state
        setSettings((s) => ({ ...s, enable: false, sayWhat: "", everyMins: 0 }));
    };

    const newMessageInputRef = useRef<HTMLInputElement | null>(null);

    const handleSave = () => {
        setSaveError(null);
        setSuccessMessage(null);

        // Validate: table must contain complete rows.
        if (MessageTableRows.length === 0) {
            setSaveError("Cannot save: add at least one server message line to the table.");
            return;
        }

        for (const row of MessageTableRows) {
            if (!row.sayWhat.trim()) {
                setSaveError("Cannot save: each server message row must have message text (sayWhat). ");
                return;
            }
            if (!Number.isFinite(row.everyMins) || row.everyMins <= 0) {
                setSaveError("Cannot save: each server message row must have frequency (everyMins) > 0.");
                return;
            }
        }


        void (async () => {
            // Backend API expects a single ChatMessages payload (enable/sayWhat/everyMins).
            // For now we persist the first row.
            // If backend supports multiple, adjust serverMessagesAPI + preload accordingly.
            const first = MessageTableRows[0];
            const payload = {
                enable: first.enable,
                sayWhat: first.sayWhat,
                everyMins: first.everyMins,
            };

            try {
                const res = await saveChatMessages(payload);

                if (res?.success) {
                    setSaveError(null);
                    setSuccessMessage("Settings saved successfully!");
                    return;
                }

                console.error("Failed to save MessagesList settings:", res?.error);
                setSuccessMessage(null);
                setSaveError(res?.error ?? "Failed to save MessagesList settings");




            } catch (err) {
                console.error("Exception while saving ChatMessages settings:", err);
                setSaveError(err instanceof Error ? err.message : String(err));


            }
        })();
    };


    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    return (
        <div className="servermessages-settings">
            {saveError && <ModalError message={saveError} onClose={() => setSaveError(null)} />}
            {successMessage && (
                <ModalError
                    title="Saved"
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                    primaryLabel="OK"
                />
            )}
            <section className="servermessages-section">
                <div className="servermessages-header">Add/Remove server messages</div>
                <div className="servermessages-field">

                    <div className="servermessages-inline">
                        <label>Enable</label>
                        <input
                            type="checkbox"
                            checked={settings.enable}
                            onChange={(e) => update({ enable: e.target.checked })}
                        />
                    </div>
                    <div className="servermessages-inline">
                        <label>Server message to add</label>
                        <input
                            type="text"
                            value={settings.sayWhat}
                            onChange={(e) => update({ sayWhat: e.target.value })}
                            style={{ width: "100%" }} />

                    </div>
                    <div className="servermessages-inline-numb">
                        <label>Frequency of message (in minutes)</label>
                        <input
                            type="number"
                            value={settings.everyMins}
                            onChange={(e) => update({ everyMins: Number(e.target.value) })} />
                    </div>
                </div>
                <div className="servermessages-inline">
                    <button className="btn-primary" type="button" onClick={addMessagesToTable} style={{ marginLeft: "0px" }}>
                        Add to List
                    </button>
                </div>
            </section>

            <section className="servermessages-section">
                <div className="servermessages-section-grid">
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: "10px" }}>Admin Changes Table</h3>
                        <table border={1} style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: "8px" }}>Enabled</th>
                                    <th style={{ padding: "8px" }}>Message</th>
                                    <th style={{ padding: "8px" }}>Every (mins)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MessageTableRows.map((row) => (
                                    <tr key={row.id}>
                                        <td style={{ padding: "8px" }}>{row.enable ? "Yes" : "No"}</td>
                                        <td style={{ padding: "8px" }}>{row.sayWhat}</td>
                                        <td style={{ padding: "8px" }}>{row.everyMins}</td>
                                        <td style={{ padding: "8px" }}>
                                            <button type="button" onClick={() => removeMessageFromTable(row.id)}>❌</button>
                                        </td>
                                    </tr>
                                ))}
                                {MessageTableRows.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: "12px", textAlign: "center", color: "#888" }}>
                                            No messages added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            <section className="adminwhitelist-section">
                <div className="adminwhitelist-inline" style={{ justifyContent: "flex-start" }}>
                    <button className="btn-primary" onClick={handleSave}>
                        Save
                    </button>
                </div>

                {saveError && (
                    <div style={{ marginTop: 10, color: "#ff4d4d", fontSize: "0.9rem" }}>
                        {saveError}
                    </div>
                )}
            </section>

        </div>
    )
};
