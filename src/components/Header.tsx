import React, { useState } from 'react';
import { getApiBaseUrl } from '../services/api';
import { Zap, RefreshCw, Server } from 'lucide-react';
import { ApiConfigModal } from './ApiConfigModal';

interface HeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  loading,
  onRefresh
}) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="mode-badge live" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>ENTERPRISE M2M</span>
          </div>

          <button
            onClick={() => setConfigModalOpen(true)}
            className="btn btn-secondary"
            title={currentBase ? `API: ${currentBase}` : 'Configure Backend API URL'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Server size={15} color={currentBase ? 'var(--cyber-cyan)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.85rem' }}>
              {currentBase ? 'API URL' : 'Set API'}
            </span>
          </button>

          <button 
            onClick={onRefresh} 
            disabled={loading} 
            className="btn btn-secondary"
            title="Refresh Fleet Data"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh Fleet</span>
          </button>
        </div>
      </header>

      <ApiConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onConfigSaved={onRefresh}
      />
    </>
  );
};
