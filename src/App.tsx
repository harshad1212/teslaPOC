import React, { useState, useEffect, useCallback } from 'react';
import { TeslaConnectionStatus, Vehicle, VehicleData } from './types/tesla';
import { teslaApi, getApiBaseUrl } from './services/api';
import { Header } from './components/Header';
import { ConnectionBanner } from './components/ConnectionBanner';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetail } from './components/VehicleDetail';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { Car, AlertCircle, CheckCircle, Server, ShieldCheck } from 'lucide-react';
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
  const [registeringPartner, setRegisteringPartner] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadFleetData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const connStatus = await teslaApi.getConnectionStatus();
      setStatus(connStatus);

      // Load vehicles
      const vehicleList = await teslaApi.getVehicles();
      setVehicles(vehicleList);

      if (vehicleList.length > 0) {
        // Select first vehicle by default if none selected
        const current = selectedVehicle 
          ? vehicleList.find(v => v.vin === selectedVehicle.vin) || vehicleList[0]
          : vehicleList[0];
        
        setSelectedVehicle(current);
        loadVehicleData(current.vin);
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
    loadFleetData();
  }, []);

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

  const handleConnect = async () => {
    try {
      const login = await teslaApi.getLoginUrl();
      if (status?.isMockMode) {
        // In mock mode, simulate authorization code callback
        showToast('Simulating Tesla OAuth authorization in Mock Mode...');
        await teslaApi.simulateMockCallback(login.state);
        showToast('Tesla account connected successfully in Mock Mode!');
        await loadFleetData();
      } else {
        // In live mode, redirect to Tesla OAuth
        window.location.href = login.authorizeUrl;
      }
    } catch (err: any) {
      setErrorMessage(`Login error: ${err.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await teslaApi.disconnect();
      showToast('Tesla account disconnected.');
      await loadFleetData();
    } catch (err: any) {
      setErrorMessage(`Disconnect error: ${err.message}`);
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

  const handleRegisterPartner = async () => {
    setRegisteringPartner(true);
    try {
      const currentDomain = window.location.hostname || 'lively-desert-0c5185b00.1.azurestaticapps.net';
      const result = await teslaApi.registerPartner(currentDomain);
      if (result.success) {
        showToast(`Tesla partner registered successfully for domain ${result.domain}! Refreshing fleet...`);
        setErrorMessage(null);
        await loadFleetData();
      } else {
        setErrorMessage(`Tesla Partner Registration failed: ${result.message}`);
      }
    } catch (err: any) {
      setErrorMessage(`Registration error: ${err.message}`);
    } finally {
      setRegisteringPartner(false);
    }
  };

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

            {(errorMessage.includes('412') || errorMessage.includes('Precondition') || errorMessage.includes('Partner')) && (
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
                  Tesla requires 1-time partner account registration and public key verification for your application domain.
                </span>
                <button 
                  onClick={handleRegisterPartner}
                  disabled={registeringPartner}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', backgroundColor: 'var(--tesla-red)' }}
                >
                  <ShieldCheck size={16} />
                  <span>{registeringPartner ? 'Registering with Tesla...' : 'Register Partner Account with Tesla'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <ConnectionBanner status={status} />

        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={22} color="var(--cyber-cyan)" />
              <h2 style={{ fontSize: '1.5rem' }}>Connected Vehicle Fleet ({vehicles.length})</h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click a vehicle card to view detailed telemetry
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
