import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  commandName: string;
  vehicleName: string;
  vin: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  commandName,
  vehicleName,
  vin,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2rem',
        border: '1px solid var(--tesla-red)',
        boxShadow: '0 0 30px rgba(232, 33, 39, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--tesla-red)' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.25rem' }}>Command Confirmation Required</h3>
          </div>
          <button 
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          You are about to execute the remote vehicle command <strong>"{commandName}"</strong> on:
        </p>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <div><strong>Vehicle:</strong> {vehicleName}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            <strong>VIN:</strong> {vin}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary">
            Confirm & Execute
          </button>
        </div>
      </div>
    </div>
  );
};
