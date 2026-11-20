import "./modal.css";

interface DeleteServerModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteServerModal({ onCancel, onConfirm }: DeleteServerModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Delete Server</h2>
        <p>Are you sure you want to delete this server?</p>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="danger-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}