import React from 'react';
import { TeslaConnectionStatus } from '../types/tesla';
import { ShieldCheck, AlertCircle, Clock, Globe } from 'lucide-react';

interface ConnectionBannerProps {
  status: TeslaConnectionStatus | null;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {status.isConnected ? (
            <ShieldCheck size={24} color="#10b981" />
          ) : (
            <AlertCircle size={24} color="#f59e0b" />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>
              {status.statusMessage}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {status.email ? `Authorized Account: ${status.email}` : 'No Tesla account currently authorized.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Globe size={16} />
            <span>Region: <strong>{status.region}</strong></span>
          </div>

          {status.isConnected && status.expiresInMinutes !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span>Token Expires: <strong>{status.expiresInMinutes}m</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
