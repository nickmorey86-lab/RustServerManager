import "./adminWhitelist.css";

import {
    loadCombinedAdminWhitelist,
    saveCombinedAdminWhitelist
} from "../../../../utils/adminWhitelistAPI";
import { useEffect, useRef, useState } from "react";
import { ModalError } from "../../../../components/ModalError/ModalError";



// Blueprint for a single Admin table row
export interface AdminItem {
    id: string;
    steamID: number;
    action: string;
}

// Blueprint for a single Whitelist table row
export interface WhitelistItem {
    id: string;
    steamID: number;
    action: string;
}


export interface AdminList {
    // UI-friendly type: allows "" while the user is editing the input
    newAdminID: string;
    addRemoveAdmin: string;
}




export interface Whitelist {
    enable: boolean;
    // UI-friendly type: allows "" while the user is editing the input
    steamID: string;
    addRemoveList: string;
    kickReason: string;
}
export type CombinedAdminWhitelist = AdminList & Whitelist;



// NOTE: This component is rendered directly by `SettingsTabs` as <AdminWhitelist />.
// The previously-declared Props were unused and required, but not provided.
// Keeping the component self-contained avoids runtime inconsistencies.
export function AdminWhitelist() {

    // Form input tracker
    const [settings, setSettings] = useState<CombinedAdminWhitelist>({
        newAdminID: "",
        addRemoveAdmin: "add",
        enable: true,
        steamID: "",
        addRemoveList: "add",
        kickReason: "",
    });


    const [saveError, setSaveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);





    // These arrays hold the rows for your two tables
    const [adminTableRows, setAdminTableRows] = useState<AdminItem[]>([]);
    const [whitelistTableRows, setWhitelistTableRows] = useState<WhitelistItem[]>([]);

    useEffect(() => {
        void (async () => {
            const loaded = await loadCombinedAdminWhitelist();
            if (loaded) {
                // loaded.newAdminID / loaded.steamID are numbers (API contract)
                // settings.newAdminID / settings.steamID are strings (UI controlled inputs)
                setSettings({
                    ...loaded,
                    newAdminID: String(loaded.newAdminID ?? ""),
                    steamID: String(loaded.steamID ?? ""),
                });
            }
        })();
    }, []);

    const update = (updates: Partial<CombinedAdminWhitelist>) => {
        setSettings((s) => ({ ...s, ...updates }));
    };

    const isValidSteamId = (val: string) => /^\d{17}$/.test(val);

    // Click helper to validate and add Admin rows
    const addAdminToTable = () => {
        const trimmed = settings.newAdminID.trim();
        if (!isValidSteamId(trimmed)) {
            setSaveError("Admin Steam ID must be exactly 17 digits.");
            setSuccessMessage(null);
            return;
        }

        const steamIdNum = Number(trimmed);
        if (!steamIdNum || steamIdNum <= 0) {
            setSaveError("Admin Steam ID cannot be 0.");
            setSuccessMessage(null);
            return;
        }

        const newRow: AdminItem = {
            id: crypto.randomUUID(),
            steamID: steamIdNum,
            action: settings.addRemoveAdmin,
        };
        setAdminTableRows([...adminTableRows, newRow]);
        setSaveError(null);
        update({ newAdminID: "" });
    };

    // Click helper to validate and add Whitelist rows
    const addWhitelistToTable = () => {
        const trimmed = settings.steamID.trim();
        if (!isValidSteamId(trimmed)) {
            setSaveError("Whitelist Steam ID must be exactly 17 digits.");
            setSuccessMessage(null);
            return;
        }

        const steamIdNum = Number(trimmed);
        if (!steamIdNum || steamIdNum <= 0) {
            setSaveError("Whitelist Steam ID cannot be 0.");
            setSuccessMessage(null);
            return;
        }

        const newRow: WhitelistItem = {
            id: crypto.randomUUID(),
            steamID: steamIdNum,
            action: settings.addRemoveList,
        };

        setWhitelistTableRows([...whitelistTableRows, newRow]);
        setSaveError(null);
        setSuccessMessage(null);
        update({ steamID: "" });
    };


    const removeAdminFromTable = (idToRemove: string) => {
        setAdminTableRows(adminTableRows.filter(row => row.id !== idToRemove));
    };

    const removeWhitelistFromTable = (idToRemove: string) => {
        setWhitelistTableRows(whitelistTableRows.filter(row => row.id !== idToRemove));
    };

    const newAdminIdInputRef = useRef<HTMLInputElement | null>(null);
    const whitelistSteamIdInputRef = useRef<HTMLInputElement | null>(null);

    const handleSave = () => {
        setSaveError(null);
        setSuccessMessage(null);

        // Validation: if both tables are empty, do not save.
        if (adminTableRows.length === 0 && whitelistTableRows.length === 0) {
            setSaveError("Cannot save: add at least one admin or whitelist entry.");
            return;
        }

        // Validation: when whitelist has data, kickReason must be provided.
        if (whitelistTableRows.length > 0 && !settings.kickReason.trim()) {
            setSaveError("Kick reason is required when whitelist entries exist.");
            return;
        }

        void (async () => {
            const payload = {
                ...settings,
                newAdminID: settings.newAdminID === "" ? 0 : Number(settings.newAdminID),
                steamID: settings.steamID === "" ? 0 : Number(settings.steamID),
            };


            try {
                const res = await saveCombinedAdminWhitelist(payload);

                if (res?.success) {
                    setSaveError(null);
                    setSuccessMessage("Settings saved successfully!");
                    // If save succeeded, clear inputs to avoid confusion.
                    setSettings((s) => ({ ...s, newAdminID: "", steamID: "" }));
                    return;
                }



                console.error("Failed to save CombinedAdminWhitelist settings:", res?.error);
                setSaveError(res?.error ?? "Failed to save CombinedAdminWhitelist settings");

                // On failure, focus the most relevant Steam ID box.
                requestAnimationFrame(() => {
                    const shouldFocusNewAdmin = settings.newAdminID.trim() !== "";
                    const target = shouldFocusNewAdmin ? newAdminIdInputRef.current : whitelistSteamIdInputRef.current;
                    target?.focus();
                });


            } catch (err) {
                console.error("Exception while saving CombinedAdminWhitelist settings:", err);
                setSaveError(err instanceof Error ? err.message : String(err));

                // Still try to restore focus.
                requestAnimationFrame(() => {
                    const target = newAdminIdInputRef.current ?? whitelistSteamIdInputRef.current;
                    target?.focus();
                });
            }
        })();
    };



    return (
        <div className="adminwhitelist-settings">
            {saveError && <ModalError message={saveError} onClose={() => setSaveError(null)} />}
            {successMessage && (
                <ModalError
                    title="Saved"
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                    primaryLabel="OK"
                />
            )}
            <section className="adminwhitelist-section">
                <div className="adminwhitelist-section-header">Add/Remove Admins</div>
                <div className="adminwhitelist-field">
                    <div className="adminwhitelist-inline">
                        <label>Add or remove</label>
                        <select
                            value={settings.addRemoveAdmin}
                            onChange={(e) => update({ addRemoveAdmin: e.target.value })} >
                            <option value="add">Add</option>
                            <option value="remove">Remove</option>
                        </select>
                    </div>
                    <div className="adminwhitelist-inline">
                        <label>Steam ID:</label>
                        <input
                            ref={newAdminIdInputRef}
                            type="text"
                            inputMode="numeric"
                            value={settings.newAdminID}
                            onChange={(e) => update({ newAdminID: e.target.value })} />

                    </div>
                    <div className="adminwhitelist-inline">
                        <button className="btn-primary" type="button" onClick={addAdminToTable} style={{ marginLeft: "0px" }}>
                            Add to List
                        </button>
                    </div>
                </div>
            </section>

            <section className="adminwhitelist-section">
                <div className="adminwhitelist-section-header">Whitelist</div>
                <div className="adminwhitelist-field">
                    <div className="adminwhitelist-inline">
                        <label>Enable</label>
                        <input
                            type="checkbox"
                            checked={settings.enable}
                            onChange={(e) => update({ enable: e.target.checked })} />
                    </div>
                    <div className="adminwhitelist-inline">
                        <label>Add or remove</label>
                        <select
                            value={settings.addRemoveList}
                            onChange={(e) => update({ addRemoveList: e.target.value })} >
                            <option value="add">Add</option>
                            <option value="remove">Remove</option>
                        </select>
                    </div>
                    <div className="adminwhitelist-inline">
                        <label>Steam ID:</label>
                        <input
                            ref={whitelistSteamIdInputRef}
                            type="text"
                            inputMode="numeric"
                            value={settings.steamID}
                            onChange={(e) => update({ steamID: e.target.value })} />
                    </div>

                    <div className="adminwhitelist-inline" style={{ alignItems: "flex-start" }}>
                        <label style={{ marginTop: 6 }}>Kick reason:</label>
                        <div className="adminwhitelist-inline-sec" style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={settings.kickReason}
                                onChange={(e) => update({ kickReason: e.target.value })}
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>
                    <div className="adminwhitelist-inline">
                        <button className="btn-primary" type="button" onClick={addWhitelistToTable} style={{ marginLeft: "0px" }}>
                            Add to List
                        </button>
                    </div>


                    <div className="adminwhitelist-inline" style={{ marginTop: 8, alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Kick reason (applies to whitelist):</div>
                            <div style={{ fontSize: 0.9, color: "var(--textMuted)" }}>
                                {settings.kickReason?.trim() ? settings.kickReason : "(not set)"}
                            </div>
                        </div>
                    </div>
                </div>
            </section >
            {/* TABLES DISPLAY SECTION */}
            <section className="adminwhitelist-section">
                <section className="adminwhitelist-section-grid" style={{ display: "flex", gap: "20px" }}>


                    {/* Admin Table */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: "10px" }}>Admin Changes Table</h3>
                        <table border={1} style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: "8px" }}>Action</th>
                                    <th style={{ padding: "8px" }}>Steam ID</th>
                                    <th style={{ padding: "8px" }}>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminTableRows.map((row) => (
                                    <tr key={row.id}>
                                        <td style={{ padding: "8px", textTransform: "capitalize" }}>{row.action}</td>
                                        <td style={{ padding: "8px" }}>{row.steamID}</td>
                                        <td style={{ padding: "8px" }}>
                                            <button type="button" onClick={() => removeAdminFromTable(row.id)}>❌</button>
                                        </td>
                                    </tr>
                                ))}
                                {adminTableRows.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: "12px", textAlign: "center", color: "#888" }}>
                                            No admin data added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Whitelist Table */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: "10px" }}>Whitelist Changes Table</h3>
                        <table border={1} style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: "8px" }}>Action</th>
                                    <th style={{ padding: "8px" }}>Steam ID</th>
                                    <th style={{ padding: "8px" }}>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {whitelistTableRows.map((row) => (
                                    <tr key={row.id}>
                                        <td style={{ padding: "8px", textTransform: "capitalize" }}>{row.action}</td>
                                        <td style={{ padding: "8px" }}>{row.steamID}</td>
                                        <td style={{ padding: "8px" }}>
                                            <button type="button" onClick={() => removeWhitelistFromTable(row.id)}>❌</button>
                                        </td>
                                    </tr>
                                ))}
                                {whitelistTableRows.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: "12px", textAlign: "center", color: "#888" }}>

                                            No whitelist data added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </section>
            </section>

            {/* SAVE BUTTON SECTION */}
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
    );
}

