import "./modal.css";

interface AddServerModalProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function AddServerModal({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onCancel,
  onSave,
}: AddServerModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add New Server</h2>

        <input
          className="modal-input"
          placeholder="Server Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />

        <input
          className="modal-input"
          placeholder="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-btn" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}