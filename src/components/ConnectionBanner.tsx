import React from 'react';
import { TeslaConnectionStatus } from '../types/tesla';
import { ShieldCheck, AlertCircle, Globe, Cpu } from 'lucide-react';

interface ConnectionBannerProps {
  status: TeslaConnectionStatus | null;
  fleetCount?: number;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status, fleetCount }) => {
  if (!status) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {status.isConnected ? (
            <ShieldCheck size={26} color="#10b981" />
          ) : (
            <AlertCircle size={26} color="#f59e0b" />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f3f4f6' }}>
              {status.statusMessage}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Corporate Fleet Identity: <strong>{status.email || 'Tesla Enterprise Corporate Client'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Globe size={16} color="var(--cyber-cyan)" />
            <span>Region: <strong>{status.region || 'NorthAmerica & APAC'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Cpu size={16} color="#10b981" />
            <span>Auth: <strong>Direct M2M Partner Token</strong></span>
          </div>

          {fleetCount !== undefined && fleetCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
              <span>{fleetCount} Enrolled Vehicles</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
