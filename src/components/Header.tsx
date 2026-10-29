import React, { useState } from 'react';
import { getApiBaseUrl } from '../services/api';
import { Zap, RefreshCw, Server, HelpCircle } from 'lucide-react';
import { ApiConfigModal } from './ApiConfigModal';
import { OperatorGuideModal } from './OperatorGuideModal';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  loading,
  onRefresh
}) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const currentBase = getApiBaseUrl();

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
          <Tooltip 
            position="bottom"
            title="Enterprise Partner Auth (M2M)"
            content="Direct backend-to-backend authentication using OAuth 2.0 client_credentials against fleet-auth.prd.vn.cloud.tesla.com. Interactive logins are bypassed for company-owned fleets."
          >
            <div className="mode-badge live" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', cursor: 'help' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10b981' }} />
              <span style={{ color: '#10b981', fontWeight: 600 }}>ENTERPRISE M2M</span>
            </div>
          </Tooltip>

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
            title="Backend API Gateway"
            content={`Active: ${currentBase || 'Direct Origin'}. Click to test latency or configure custom Azure App Service URL.`}
          >
            <button
              onClick={() => setConfigModalOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <Server size={15} color={currentBase ? 'var(--cyber-cyan)' : 'var(--text-muted)'} />
              <span>{currentBase ? 'API URL' : 'Set API'}</span>
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
        </div>
      </header>

      <ApiConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onConfigSaved={onRefresh}
      />

      <OperatorGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
};
