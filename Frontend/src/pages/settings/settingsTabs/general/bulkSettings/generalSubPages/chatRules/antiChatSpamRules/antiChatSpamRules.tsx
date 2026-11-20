import "./antiChatSpamRules.css";
import { AntiChatSpamRule } from "./ruleTypes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";


interface Props {
    initialRule: AntiChatSpamRule | null;
    onSave: (rule: AntiChatSpamRule) => void;
    onClose: () => void;
}

export function AntiChatSpamRules({ initialRule, onSave, onClose }: Props) {

    const [rule, setRule] = useState<AntiChatSpamRule>(
        initialRule || {
            ruleName: "",
            enabled: true,
            AmountLastMins: "",
            ViolationRateExceeds: "",
            SameMessageMoreThan: "",
            MaxViolationsBeforeAction: "",
            Action: "Warn",
            Message: ""
        }
    );

    // Keep local form in sync if the parent changes which rule is being edited
    // (important so validations/missing prompts behave correctly)
    useEffect(() => {
        if (!initialRule) return;
        setRule(initialRule);
    }, [initialRule]);



    const update = (updates: Partial<AntiChatSpamRule>) => {
        setRule({ ...rule, ...updates });
    };

    const getMissingFields = () => {

        const missing: string[] = [];

        if (!rule.ruleName.trim()) missing.push("Rule name");
        if (!rule.AmountLastMins || rule.AmountLastMins.trim() === "") missing.push("Amount last mins");
        if (!rule.ViolationRateExceeds || rule.ViolationRateExceeds.trim() === "") missing.push("Violation rate exceeds");
        if (!rule.SameMessageMoreThan || rule.SameMessageMoreThan.trim() === "") missing.push("Same message more than");
        if (!rule.MaxViolationsBeforeAction || rule.MaxViolationsBeforeAction.trim() === "") missing.push("Max violations before action");
        if (!rule.Message.trim()) missing.push("Message");

        return missing;
    };

    const isFormValid = () => getMissingFields().length === 0;


    return createPortal(
        <div className="modal-overlay">

            <div className="modal-section">
                <div className="modal-section-header">
                    {initialRule ? "Edit Rule" : "Add Rule"}
                </div>

                <div className="modal-section-body modal-grid">

                    <div className="modal-field">
                        <label>Enabled</label>
                        <div className="modal-inline">
                            <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={(e) => update({ enabled: e.target.checked })}
                                placeholder="yes"
                            />
                        </div>

                        <label>Rule Name</label>
                        <div className="modal-inline">
                            <input
                                type="text"
                                value={rule.ruleName}
                                onChange={(e) => update({ ruleName: e.target.value })}
                                placeholder="Enter a rule name"
                            />
                        </div>



                        <label>Check the amount of messages sent by a player in last X minutes</label>
                        <div className="modal-inline">
                            <input
                                type="number"
                                value={rule.AmountLastMins}
                                onChange={(e) => update({ AmountLastMins: e.target.value })}
                            />
                        </div>

                        <label>Chat violation if rate exceeds X messages/min</label>
                        <div className="modal-inline">
                            <input
                                type="number"
                                value={rule.ViolationRateExceeds}
                                onChange={(e) => update({ ViolationRateExceeds: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="modal-field">

                        <label>Violation if same message sent more than X times</label>
                        <div className="modal-inline">
                            <input
                                type="number"
                                value={rule.SameMessageMoreThan}
                                onChange={(e) => update({ SameMessageMoreThan: e.target.value })}
                            />
                        </div>

                        <label>Max violations before action</label>
                        <div className="modal-inline">
                            <input
                                type="number"
                                value={rule.MaxViolationsBeforeAction}
                                onChange={(e) => update({ MaxViolationsBeforeAction: e.target.value })}
                            />
                        </div>

                        <label>Action</label>
                        <div className="modal-inline">
                            <select
                                value={rule.Action}
                                onChange={(e) => update({ Action: e.target.value as any })}
                            >
                                <option value="Warn">Warn</option>
                                <option value="Mute">Mute</option>
                                <option value="Kick">Kick</option>
                                <option value="Ban">Ban</option>

                            </select>
                        </div>
                        <label>Message to player</label>
                        <div className="modal-inline">
                            <input
                                type="text"
                                value={rule.Message}
                                onChange={(e) => update({ Message: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="btn-primary"
                        onClick={() => {
                            const missing = getMissingFields();
                            if (missing.length > 0) {
                                alert(`Cannot save rule. Missing required fields:\n- ${missing.join("\n- ")}`);
                                return;
                            }
                            onSave(rule);
                        }}
                    /* keep disabled behavior off so click always validates and shows prompt */
                    // disabled={!isFormValid()}

                    >
                        Save Rule
                    </button>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                </div>


            </div>

        </div>,
        document.body
    );
}
