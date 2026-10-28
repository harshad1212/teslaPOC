import React from 'react';
import { TeslaConnectionStatus } from '../types/tesla';
import { Zap, LogIn, LogOut, RefreshCw } from 'lucide-react';

interface HeaderProps {
  status: TeslaConnectionStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  loading,
  onRefresh,
  onConnect,
  onDisconnect
}) => {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <Zap size={28} className="text-tesla" />
          <span>TESLA</span>
        </div>
        <span className="brand-badge">Fleet API POC</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {status && (
          <div className={`mode-badge ${status.isMockMode ? 'mock' : 'live'}`}>
            <span className="pulse-dot" />
            <span>{status.isMockMode ? 'MOCK MODE' : 'LIVE API'}</span>
          </div>
        )}

        <button 
          onClick={onRefresh} 
          disabled={loading} 
          className="btn btn-secondary"
          title="Refresh Fleet Data"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        {status?.isConnected ? (
          <button onClick={onDisconnect} className="btn btn-danger">
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        ) : (
          <button onClick={onConnect} className="btn btn-primary">
            <LogIn size={16} />
            <span>Connect Tesla</span>
          </button>
        )}
      </div>
    </header>
  );
};
