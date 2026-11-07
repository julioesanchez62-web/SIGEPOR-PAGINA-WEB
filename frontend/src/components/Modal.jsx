import React from 'react';

// ✅ LÓGICA INTACTA: isOpen, onClose, title, children sin modificaciones
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '1rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
