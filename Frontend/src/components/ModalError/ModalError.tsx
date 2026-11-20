import type { ReactNode } from "react";

import "./modalError.css";

export function ModalError(props: {
    title?: string;
    message: ReactNode;
    onClose: () => void;
    zIndex?: number;
    primaryLabel?: string;
}) {
    const {
        title = "Error",
        message,
        onClose,
        zIndex = 9999,
        primaryLabel = "OK"
    } = props;

    return (
        <div
            className="modal-backdrop"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
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
                <div className="modal-error-header">
                    <h3>{title}</h3>
                    <button className="modal-error-close" onClick={onClose} type="button">
                        ✕
                    </button>
                </div>

                <div className="modal-error-body">{message}</div>

                <div className="modal-error-footer">
                    <button className="primary-btn" onClick={onClose} type="button">
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

