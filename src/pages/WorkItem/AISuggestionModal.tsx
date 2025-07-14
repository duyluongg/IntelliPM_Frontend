import React from 'react';

interface AISuggestionModalProps {
  isOpen: boolean;
  suggestions: string[];
  selected: string[];
  onSelect: (title: string, checked: boolean) => void;
  onCreate: () => void;
  onClose: () => void;
}

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  isOpen,
  suggestions,
  selected,
  onSelect,
  onCreate,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.icon}>🧠</span>
          <strong style={{ fontSize: '16px' }}>AI Suggested Subtasks</strong>
        </div>

        <div style={styles.list}>
          {suggestions.map((title, idx) => (
            <label key={idx} style={styles.item}>
              <input
                type="checkbox"
                checked={selected.includes(title)}
                onChange={(e) => onSelect(title, e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              {title}
            </label>
          ))}
        </div>

        <div style={styles.footer}>
          <button
            onClick={onCreate}
            disabled={selected.length === 0}
            style={{
              ...styles.createBtn,
              backgroundColor: selected.length ? '#0052cc' : '#ccc',
              cursor: selected.length ? 'pointer' : 'not-allowed',
            }}
          >
            Create Selected
          </button>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '480px',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  icon: {
    marginRight: '8px',
    color: '#d63384',
    fontSize: '18px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    wordBreak: 'break-word',
    fontSize: '14px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  createBtn: {
    padding: '8px 16px',
    borderRadius: '4px',
    color: '#fff',
    border: 'none',
    fontWeight: 500,
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AISuggestionModal;
