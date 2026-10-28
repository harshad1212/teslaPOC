import React, { useState } from 'react';
import { getApiBaseUrl, setApiBaseUrl, teslaApi } from '../services/api';
import { Server, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [url, setUrl] = useState<string>(getApiBaseUrl() || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setApiBaseUrl(url);
      const status = await teslaApi.getConnectionStatus();
      setTestResult({
        success: true,
        message: `Successfully connected! (${status.isMockMode ? 'Mock Mode' : 'Live API'})`
      });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to reach API endpoint at this URL.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    setApiBaseUrl('');
    setUrl('');
    setTestResult(null);
    onConfigSaved();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-panel" 
        style={{
          maxWidth: '540px',
          width: '90%',
          padding: '2rem',
          border: '1px solid var(--border-glow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Server size={22} color="var(--cyber-cyan)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Backend API Configuration</h3>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ padding: '0.25rem 0.5rem', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Specify your deployed .NET Backend API URL (e.g. your Azure App Service URL or local tunnel). 
          This connects your live frontend to the backend service.
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Backend API Base URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.azurewebsites.net"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Examples:</span>
            <button
              type="button"
              onClick={() => setUrl('http://localhost:5000')}
              style={{ background: 'transparent', border: 'none', color: 'var(--cyber-cyan)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
            >
              http://localhost:5000
            </button>
          </div>
        </div>

        {testResult && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(232, 33, 39, 0.15)',
            border: `1px solid ${testResult.success ? 'var(--emerald-green)' : 'var(--tesla-red)'}`,
            color: testResult.success ? '#a7f3d0' : '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {testResult.success ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Reset
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSaveAndTest}
              disabled={testing}
              className="btn btn-primary"
            >
              {testing ? <RefreshCw size={16} className="spin" /> : <Check size={16} />}
              <span>{testing ? 'Testing...' : 'Save & Connect'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
