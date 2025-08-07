import React from 'react';
import './DeleteConnectionPopup.css';

interface DeleteConnectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromId: string;
  toId: string;
  type: string;
  fromLabel?: string;
  toLabel?: string;
}

const DeleteConnectionPopup: React.FC<DeleteConnectionPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromId,
  toId,
  type,
  fromLabel = fromId,
  toLabel = toId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-connection-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Delete Connection</h3>
        <p>
          Do you want to delete the connection from <strong>{fromLabel}</strong> to{' '}
          <strong>{toLabel}</strong> ({type})?
        </p>
        <div className="button-group">
          <button onClick={onConfirm} className="btn-confirm">
            Yes, Delete
          </button>
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConnectionPopup;