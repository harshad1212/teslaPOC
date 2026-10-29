import React, { useState } from 'react';
import { TeslaConnectionStatus } from '../types/tesla';
import { Zap, RefreshCw, HelpCircle, LogOut, LogIn } from 'lucide-react';
import { OperatorGuideModal } from './OperatorGuideModal';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  status: TeslaConnectionStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  loading,
  onRefresh,
  onConnect,
  onDisconnect
}) => {
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="brand-container">
          <div className="brand-logo">
            <Zap size={28} className="text-tesla" />
            <span>TESLA</span>
          </div>
          <span className="brand-badge">Enterprise Fleet Operations</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {status?.isConnected ? (
            <Tooltip 
              position="bottom"
              title="Authenticated Operator Identity"
              content={`Verified Tesla session for ${status.email || 'authorized operator'}. All commands and telemetry queries are cryptographically attributed to this account.`}
            >
              <div className="mode-badge live" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', cursor: 'help' }}>
                <span className="pulse-dot" style={{ backgroundColor: '#10b981' }} />
                <span style={{ color: '#10b981', fontWeight: 600 }}>
                  {status.email ? status.email : 'OPERATOR ACTIVE'}
                </span>
              </div>
            </Tooltip>
          ) : (
            <div className="mode-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#f59e0b' }} />
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>AUTH REQUIRED</span>
            </div>
          )}

          <Tooltip
            position="bottom"
            title="Interactive Operations Guide"
            content="Click to open the complete reference guide explaining fleet telemetry metrics, vehicle sleep vs online states, safety gates, and audit logs."
          >
            <button
              onClick={() => setGuideModalOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <HelpCircle size={15} color="var(--cyber-cyan)" />
              <span>Fleet Guide</span>
            </button>
          </Tooltip>

          <Tooltip
            position="bottom"
            title="Sync Fleet Status"
            content="Fetches fresh vehicle status, wake states, and telemetry snapshots directly from the Tesla Fleet API."
          >
            <button 
              onClick={onRefresh} 
              disabled={loading} 
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              <span>Refresh Fleet</span>
            </button>
          </Tooltip>

          {status?.isConnected ? (
            <Tooltip
              position="bottom"
              title="Sign Out / Disconnect"
              content="Invalidates the active Tesla session, clearing cached tokens and securing the fleet dashboard."
            >
              <button
                onClick={onDisconnect}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontSize: '0.85rem',
                  borderColor: 'rgba(232, 33, 39, 0.4)',
                  color: '#fca5a5'
                }}
              >
                <LogOut size={15} color="var(--tesla-red)" />
                <span>Sign Out</span>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={onConnect}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <OperatorGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
};
