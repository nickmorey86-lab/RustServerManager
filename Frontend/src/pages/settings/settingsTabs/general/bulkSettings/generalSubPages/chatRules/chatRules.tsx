import "./chatRules.css";
import { useState, useEffect } from "react";
import { AntiChatSpamRule } from "./antiChatSpamRules/ruleTypes";
import { AntiChatSpamRules } from "./antiChatSpamRules/antiChatSpamRules";
import { loadAntiChatSpamRules, saveAntiChatSpamRule } from "../../../../../../../utils/rulesAPI";
import { ModalError } from "../../../../../../../components/ModalError/ModalError";


export function ChatRules() {
    const [rules, setRules] = useState<AntiChatSpamRule[]>([]);
    const [showRuleCreator, setShowRuleCreator] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const closeError = () => setErrorMessage(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        index: number;
        ruleName: string;
    } | null>(null);


    const openAddRule = () => {
        setEditingIndex(null);
        setShowRuleCreator(true);
    };

    const openEditRule = (index: number) => {
        setEditingIndex(index);
        setShowRuleCreator(true);
    };

    const saveRule = (rule: AntiChatSpamRule) => {
        if (editingIndex === null) {
            setRules([...rules, rule]);
        } else {
            const updated = [...rules];
            updated[editingIndex] = rule;
            setRules(updated);
        }

        setShowRuleCreator(false);
        void saveAntiChatSpamRule(rule).catch((e) => {
            console.error("Failed to save rule:", e);
            setErrorMessage("Failed to save rule.");
        });
    };

    useEffect(() => {
        void (async () => {
            const initialRules = await loadAntiChatSpamRules();
            setRules(initialRules);
        })();
    }, []);


    function getRuleSummary(rule: AntiChatSpamRule) {
        const status = rule.enabled ? "enabled" : "disabled";

        return (
            <div className="rule-summary-list">
                <ul>
                    <li>Your "{rule.ruleName}" rule is {status}.</li>
                    <li>It will check the amount of messages a player has sent over the last {rule.AmountLastMins} minutes.</li>
                    <li>
                        It will check if {rule.ViolationRateExceeds} or more messages are sent in that time, or the same message has been sent more than {rule.SameMessageMoreThan} times
                    </li>
                    <li>
                        It will {rule.Action.toLowerCase()} the player with the message "{rule.Message}" after {rule.MaxViolationsBeforeAction} violations have occurred.
                    </li>
                </ul>
            </div>
        );
    }

    return (
        <div className="general-settings">

            <div className="general-section">
                <div className="general-section-header">
                    Anti chat spam rules
                </div>
                <div className="general-inline">
                    <button className="btn-primary" onClick={openAddRule}>
                        Add Rule
                    </button>
                </div>
            </div>

            {/* RULE LIST */}
            {rules.map((rule, index) => (
                <div key={index} className="general-section">
                    <div className="general-section-header">
                        <div>{`Rule ${index + 1}`}: {rule.ruleName}
                        </div>
                    </div>

                    <div className="general-section-body rule-body">
                        <div style={{ flex: 1 }}>{getRuleSummary(rule)}</div>
                        <div className="general-inline" style={{ flexDirection: "column", alignItems: "stretch" }}>
                            <button
                                className="btn-alt"
                                onClick={() => openEditRule(index)}
                            >
                                Edit
                            </button>

                            <button
                                className="btn-del"
                                onClick={() => {
                                    const ruleObj: any = rule as any;
                                    const ruleName = ruleObj?.ruleName
                                        ? String(ruleObj.ruleName)
                                        : `Rule ${index + 1}`;

                                    setConfirmDelete({ index, ruleName });
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* POPUP MODAL */}
            {showRuleCreator && (
                <AntiChatSpamRules
                    initialRule={editingIndex !== null ? rules[editingIndex] : null}
                    onSave={saveRule}
                    onClose={() => setShowRuleCreator(false)}
                />
            )}

            {/* ERROR MODAL (non-blocking) */}
            {errorMessage && (
                <ModalError message={errorMessage} onClose={closeError} />
            )}


            {/* CONFIRM DELETE MODAL (non-blocking) */}
            {confirmDelete && (
                <div
                    className="modal-backdrop"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9998
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setConfirmDelete(null);
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="modal"
                        style={{
                            background: "var(--colorPanelBg, #1a1a1a)",
                            border: "1px solid var(--colorPanelBorder, rgba(255,255,255,0.15))",
                            borderRadius: 12,
                            padding: 16,
                            width: "min(520px, calc(100vw - 32px))",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
                        }}
                    >
                        <h3 style={{ margin: 0 }}>Delete Rule</h3>
                        <p style={{ marginTop: 10 }}>
                            Are you sure you want to delete this rule "{confirmDelete.ruleName}"?
                        </p>

                        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button
                                className="secondary-btn"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="danger-btn"
                                onClick={async () => {
                                    const idx = confirmDelete.index;
                                    const ruleObj: any = rules[idx] as any;
                                    const fileName: string | null = ruleObj?.fileName ?? null;

                                    setConfirmDelete(null);

                                    if (fileName && (window as any).rules?.delete) {
                                        try {
                                            await (window as any).rules.delete(String(fileName));
                                            const initialRules = await loadAntiChatSpamRules();
                                            setRules(initialRules);
                                        } catch (err) {
                                            console.error("Failed to delete rule:", err);
                                            setErrorMessage("Failed to delete rule.");
                                        }
                                        return;
                                    }

                                    setErrorMessage(
                                        "There was an issue deleting this rule. Locate it in users/youruser/appdata/roaming/electron/rules and manually remove it."
                                    );
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

