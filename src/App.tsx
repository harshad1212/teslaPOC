import React, { useState, useEffect, useCallback } from 'react';
import { TeslaConnectionStatus, Vehicle, VehicleData } from './types/tesla';
import { teslaApi, getApiBaseUrl } from './services/api';
import { Header } from './components/Header';
import { ConnectionBanner } from './components/ConnectionBanner';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetail } from './components/VehicleDetail';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { InfoTooltip } from './components/Tooltip';
import { 
  Car, 
  AlertCircle, 
  CheckCircle, 
  Server, 
  Lock, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Key 
} from 'lucide-react';
import './styles/index.css';

export const App: React.FC = () => {
  const [status, setStatus] = useState<TeslaConnectionStatus | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Command modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<string>('');

  // API Config modal state
  const [apiConfigOpen, setApiConfigOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadFleetData = useCallback(async (preserveError: boolean = false) => {
    setLoading(true);
    if (!preserveError) {
      setErrorMessage(null);
    }
    try {
      const connStatus = await teslaApi.getConnectionStatus();
      setStatus(connStatus);

      // Strict security gate: Do not query vehicle data if operator is not authenticated
      if (!connStatus.isConnected) {
        setVehicles([]);
        setSelectedVehicle(null);
        setVehicleData(null);
        setLoading(false);
        return;
      }

      // Load vehicles only for authenticated operator
      const vehicleList = await teslaApi.getVehicles();
      setVehicles(vehicleList);

      if (vehicleList.length > 0) {
        const current = selectedVehicle 
          ? vehicleList.find(v => v.vin === selectedVehicle.vin) || vehicleList[0]
          : vehicleList[0];
        
        setSelectedVehicle(current);
        loadVehicleData(current.vin);
      } else {
        setSelectedVehicle(null);
        setVehicleData(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load Tesla fleet data.');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle]);

  const loadVehicleData = async (vin: string) => {
    setDataLoading(true);
    try {
      const data = await teslaApi.getVehicleData(vin);
      setVehicleData(data);
    } catch (err: any) {
      showToast(`Could not load telemetry for ${vin}: ${err.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const connectedParam = params.get('connected');

    let hasRedirectError = false;
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
      hasRedirectError = true;
    }
    if (connectedParam === 'true') {
      showToast('Tesla operator account authenticated successfully!');
    }

    // Security: Clean URL query parameters so they never persist or mislead on refresh
    if (params.has('connected') || params.has('error')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadFleetData(hasRedirectError);
  }, []);

  const handleConnect = async () => {
    try {
      showToast('Initiating Tesla OAuth authorization...');
      const response = await teslaApi.getLoginUrl();
      if (response && response.authorizeUrl) {
        window.location.href = response.authorizeUrl;
      } else {
        showToast('Failed to retrieve Tesla authorization URL.');
      }
    } catch (err: any) {
      setErrorMessage(`Login initialization error: ${err.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      showToast('Signing out of Tesla account...');
      await teslaApi.disconnect();
      setStatus(null);
      setVehicles([]);
      setSelectedVehicle(null);
      setVehicleData(null);
      showToast('Signed out successfully. Session invalidated.');
      await loadFleetData();
    } catch (err: any) {
      showToast(`Sign out failed: ${err.message}`);
    }
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    loadVehicleData(v.vin);
  };

  const handleWakeVehicle = async (vin: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      showToast(`Sending wake up signal to vehicle ${vin}...`);
      await teslaApi.wakeUpVehicle(vin);
      showToast(`Wake up signal acknowledged! Refreshing fleet...`);
      await loadFleetData();
    } catch (err: any) {
      showToast(`Wake up failed: ${err.message}`);
    }
  };

  const handleCommandPreview = (commandName: string) => {
    setPendingCommand(commandName);
    setModalOpen(true);
  };

  const handleConfirmCommand = async () => {
    if (!selectedVehicle || !pendingCommand) {
      setModalOpen(false);
      return;
    }

    try {
      showToast(`Authorizing and executing "${pendingCommand}" on ${selectedVehicle.displayName}...`);
      const result = await teslaApi.executeCommand(selectedVehicle.vin, pendingCommand, {}, true);
      if (result.success) {
        const logSnippet = result.auditLogId ? ` [Audit ID: ${result.auditLogId.slice(0, 8)}]` : '';
        showToast(`Executed: ${result.message}${logSnippet}`);
        await loadVehicleData(selectedVehicle.vin);
      } else {
        showToast(`Command failed: ${result.reason || result.message}`);
      }
    } catch (err: any) {
      showToast(`Command error: ${err.message}`);
    } finally {
      setModalOpen(false);
    }
  };

  // 1. Initial Loading Screen
  if (loading && !status) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '3px solid rgba(232, 33, 39, 0.2)',
          borderTopColor: 'var(--tesla-red)',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.05em' }}>
          VERIFYING TESLA FLEET CREDENTIALS...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Operator Gateway (Access Locked)
  if (!loading && !status?.isConnected) {
    return (
      <div>
        <Header
          status={status}
          loading={loading}
          onRefresh={loadFleetData}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        <main className="app-container" style={{ maxWidth: 860, margin: '2rem auto' }}>
          {errorMessage && (
            <div style={{
              background: 'rgba(232, 33, 39, 0.15)',
              border: '1px solid var(--tesla-red)',
              color: '#fca5a5',
              padding: '1.1rem 1.35rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem'
            }}>
              <AlertCircle size={22} color="var(--tesla-red)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: '#fff', marginBottom: '0.25rem', fontSize: '1rem' }}>
                  Authorization Denied
                </strong>
                <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '320px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(232, 33, 39, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              width: 76,
              height: 76,
              borderRadius: '22px',
              background: 'rgba(232, 33, 39, 0.12)',
              border: '1px solid rgba(232, 33, 39, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 0 35px rgba(232, 33, 39, 0.25)'
            }}>
              <Lock size={38} color="var(--tesla-red)" />
            </div>

            <div className="mode-badge" style={{ display: 'inline-flex', marginBottom: '1.25rem', background: 'rgba(232, 33, 39, 0.12)', borderColor: 'rgba(232, 33, 39, 0.4)' }}>
              <span className="pulse-dot" style={{ backgroundColor: 'var(--tesla-red)' }} />
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>OPERATOR AUTHENTICATION REQUIRED</span>
            </div>

            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
              Tesla Fleet Operations Gateway
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 2.5rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Access to live vehicle CAN bus telemetry, GPS locations, battery diagnostics, and remote controls is restricted. You must authenticate using the authorized Tesla account linked to this fleet developer application.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: 440, margin: '0 auto' }}>
              <button
                onClick={handleConnect}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem 1.75rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 25px rgba(232, 33, 39, 0.45)'
                }}
              >
                <Zap size={22} />
                <span>Sign In with Tesla</span>
                <ArrowRight size={18} />
              </button>

              {status?.isMockMode && (
                <button
                  onClick={async () => {
                    try {
                      showToast('Simulating mock authorization callback...');
                      await teslaApi.simulateMockCallback('mock-state');
                      await loadFleetData();
                    } catch (err: any) {
                      showToast(`Mock sign in failed: ${err.message}`);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.95rem' }}
                >
                  <span>Connect Simulated Mock Account</span>
                </button>
              )}

              <button
                onClick={() => setApiConfigOpen(true)}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}
              >
                <Server size={15} color="var(--cyber-cyan)" />
                <span>Backend Gateway: {getApiBaseUrl() || 'Direct Origin'}</span>
              </button>
            </div>

            {/* Security Assurance Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              marginTop: '3.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={20} color="#10b981" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f3f4f6' }}>Identity Verified</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cryptographically gated to authorized fleet developer credentials</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Key size={20} color="var(--cyber-cyan)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f3f4f6' }}>AES-256 Token Vault</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tokens encrypted at rest via ASP.NET Data Protection</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CheckCircle size={20} color="#818cf8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f3f4f6' }}>Complete Audit Trail</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All telemetry queries and commands logged with operator identity</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ApiConfigModal
          isOpen={apiConfigOpen}
          onClose={() => setApiConfigOpen(false)}
          onConfigSaved={loadFleetData}
        />
      </div>
    );
  }

  // 3. Authenticated Operator View (Fleet & Telemetry Unlocked)
  return (
    <div>
      <Header
        status={status}
        loading={loading}
        onRefresh={loadFleetData}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="app-container">
        {toastMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid var(--emerald-green)',
            color: '#a7f3d0',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'rgba(232, 33, 39, 0.15)',
            border: '1px solid var(--tesla-red)',
            color: '#fca5a5',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: 500 }}>{errorMessage}</span>
            </div>
            
            {(errorMessage.includes('HTML') || errorMessage.includes('JSON') || errorMessage.includes('Backend')) && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(232, 33, 39, 0.3)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#fecaca' }}>
                  The frontend is not connected to your .NET backend API. Click below to enter your deployed App Service URL.
                </span>
                <button 
                  onClick={() => setApiConfigOpen(true)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <Server size={15} color="var(--cyber-cyan)" />
                  <span>Configure Backend API URL</span>
                </button>
              </div>
            )}

          </div>
        )}

        <ConnectionBanner status={status} fleetCount={vehicles.length} />

        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={22} color="var(--cyber-cyan)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Connected Vehicle Fleet ({vehicles.length})</h2>
              <InfoTooltip
                title="Corporate Fleet Registry"
                content="Real-time list of all company vehicles provisioned under your Tesla Fleet developer credentials. Click any vehicle to load live telemetry or execute safety-gated commands."
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any vehicle to view real-time CAN bus telemetry
            </span>
          </div>

          {vehicles.length === 0 && !loading && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                {errorMessage ? 'Unable to load fleet until backend API is connected.' : 'No vehicles found in this Tesla account.'}
              </p>
              {errorMessage && (
                <button 
                  onClick={() => setApiConfigOpen(true)}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Server size={16} />
                  <span>Connect Backend API ({getApiBaseUrl() || 'Not Set'})</span>
                </button>
              )}
            </div>
          )}

          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.vin}
                vehicle={v}
                isSelected={selectedVehicle?.vin === v.vin}
                onSelect={handleSelectVehicle}
                onWake={handleWakeVehicle}
              />
            ))}
          </div>
        </section>

        {selectedVehicle && (
          <VehicleDetail
            data={vehicleData}
            loading={dataLoading}
            onRefresh={() => loadVehicleData(selectedVehicle.vin)}
            onExecuteCommandPreview={handleCommandPreview}
          />
        )}
      </main>

      <ConfirmationModal
        isOpen={modalOpen}
        commandName={pendingCommand}
        vehicleName={selectedVehicle?.displayName || ''}
        vin={selectedVehicle?.vin || ''}
        onConfirm={handleConfirmCommand}
        onCancel={() => setModalOpen(false)}
      />

      <ApiConfigModal
        isOpen={apiConfigOpen}
        onClose={() => setApiConfigOpen(false)}
        onConfigSaved={loadFleetData}
      />
    </div>
  );
};

export default App;
