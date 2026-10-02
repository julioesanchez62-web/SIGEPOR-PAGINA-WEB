import React from 'react';

export const Alert = ({ type = 'success', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
