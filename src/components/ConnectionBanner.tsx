import React from 'react';
import { TeslaConnectionStatus } from '../types/tesla';
import { ShieldCheck, AlertCircle, Globe, Cpu, Car } from 'lucide-react';
import { Tooltip, InfoTooltip } from './Tooltip';

interface ConnectionBannerProps {
  status: TeslaConnectionStatus | null;
  fleetCount?: number;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ status, fleetCount }) => {
  if (!status) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            background: status.isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${status.isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}>
            {status.isConnected ? (
              <ShieldCheck size={24} color="#10b981" />
            ) : (
              <AlertCircle size={24} color="#f59e0b" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#f3f4f6', display: 'flex', alignItems: 'center' }}>
              <span>{status.statusMessage}</span>
              <InfoTooltip 
                title="Fleet Operational Status"
                content="Indicates that your backend has authenticated with Tesla's Partner Fleet API and can query vehicle telemetry."
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Corporate Identity: <strong style={{ color: 'var(--text-secondary)' }}>{status.email || 'Tesla Enterprise Corporate Client'}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.85rem', flexWrap: 'wrap' }}>
          <Tooltip
            position="top"
            title="Tesla Regional Gateway"
            content="Tesla Fleet API routes vehicles by region. NorthAmerica & APAC vehicles are served by https://fleet-api.prd.na.vn.cloud.tesla.com."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', cursor: 'help' }}>
              <Globe size={16} color="var(--cyber-cyan)" />
              <span>Region: <strong style={{ color: '#f1f5f9' }}>{status.region || 'NorthAmerica & APAC'}</strong></span>
            </div>
          </Tooltip>

          <Tooltip
            position="top"
            title="M2M Machine-to-Machine Security"
            content="Direct client_credentials OAuth token issued to your Tesla Developer Application. Bypasses consumer password prompts for owned vehicles."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', cursor: 'help' }}>
              <Cpu size={16} color="#10b981" />
              <span>Auth: <strong style={{ color: '#10b981' }}>Enterprise M2M Token</strong></span>
            </div>
          </Tooltip>

          {fleetCount !== undefined && fleetCount > 0 && (
            <Tooltip
              position="top"
              title="Authorized Corporate Vehicles"
              content="Total Tesla vehicles provisioned and registered under your developer account in the Tesla Fleet Console."
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                color: '#10b981', 
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                cursor: 'help'
              }}>
                <Car size={15} />
                <span>{fleetCount} Enrolled Vehicles</span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
