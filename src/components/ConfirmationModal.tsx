import React from 'react';
import { X, ShieldAlert, CheckCircle, Info } from 'lucide-react';

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

  const getCommandDetails = (cmd: string) => {
    switch (cmd.toLowerCase()) {
      case 'flash_lights':
        return {
          title: 'Flash Vehicle Exterior Lights',
          description: 'Flashes headlights and hazard indicators 5 times to visually identify vehicle position in a lot.',
          risk: 'Visual Signal',
          riskColor: 'var(--cyber-cyan)'
        };
      case 'honk_horn':
        return {
          title: 'Sound Horn Alert',
          description: 'Triggers a short audible dual-tone horn burst. Use responsibly in quiet or residential environments.',
          risk: 'Acoustic Alert',
          riskColor: 'var(--amber-orange)'
        };
      case 'door_unlock':
        return {
          title: 'Unlock Vehicle Doors',
          description: 'Releases electronic door latches and grants physical passenger access to the vehicle cabin.',
          risk: 'Physical Access',
          riskColor: 'var(--tesla-red)'
        };
      case 'door_lock':
        return {
          title: 'Lock Vehicle Doors & Arm Alarm',
          description: 'Engages central electronic locks, secures the cabin, and arms perimeter intrusion sensors.',
          risk: 'Security Arming',
          riskColor: 'var(--emerald-green)'
        };
      case 'auto_conditioning_start':
        return {
          title: 'Start Cabin HVAC Climate',
          description: 'Activates thermal heat pump/compressor to precondition the interior to the target comfort setpoint.',
          risk: 'Energy Draw',
          riskColor: 'var(--cyber-cyan)'
        };
      case 'auto_conditioning_stop':
        return {
          title: 'Stop Cabin HVAC Climate',
          description: 'Powers down cabin climate control system to preserve high-voltage battery reserve.',
          risk: 'System Standby',
          riskColor: 'var(--text-muted)'
        };
      default:
        return {
          title: `Execute Command: ${cmd}`,
          description: 'Transmits an authenticated command signal over-the-air to the vehicle CAN bus.',
          risk: 'Vehicle Actuation',
          riskColor: 'var(--cyber-cyan)'
        };
    }
  };

  const details = getCommandDetails(commandName);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div 
        className="glass-panel" 
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '2rem',
          border: '1px solid rgba(232, 33, 39, 0.45)',
          boxShadow: '0 0 35px rgba(232, 33, 39, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              background: 'rgba(232, 33, 39, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(232, 33, 39, 0.3)'
            }}>
              <ShieldAlert size={20} color="var(--tesla-red)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Operator Confirmation Gate</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Safety Policy • Mandatory Explicit Verification</span>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Command Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: '#f1f5f9' }}>{details.title}</span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${details.riskColor}`,
              color: details.riskColor
            }}>
              {details.risk}
            </span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0', lineHeight: '1.5' }}>
            {details.description}
          </p>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            background: 'rgba(0, 0, 0, 0.25)', 
            padding: '0.6rem 0.85rem', 
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Target: <strong style={{ color: '#fff' }}>{vehicleName}</strong></span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>VIN: {vin}</span>
          </div>
        </div>

        {/* Audit Notification */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          lineHeight: '1.45',
          background: 'rgba(0, 240, 255, 0.04)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          padding: '0.75rem',
          borderRadius: '6px'
        }}>
          <Info size={16} color="var(--cyber-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Executing this operation records an encrypted log in the <code>CommandAuditLogs</code> database with your operator ID for regulatory compliance.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={15} />
            <span>Confirm & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
