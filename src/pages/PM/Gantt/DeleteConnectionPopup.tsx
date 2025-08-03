import React from 'react';

interface DeleteConnectionPopupProps {
  connection: any;
  onClose: () => void;
  onDelete: (connectionId: any) => void;
}

const DeleteConnectionPopup: React.FC<DeleteConnectionPopupProps> = ({
  connection,
  onClose,
  onDelete,
}) => {
  if (!connection) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '20px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
          Delete Dependency
        </h2>

        <p style={{ marginBottom: '1.5rem' }}>
          Are you sure you want to delete this dependency from{' '}
          <strong>{connection.source}</strong> to <strong>{connection.target}</strong>?
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(connection)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e53935',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConnectionPopup;
