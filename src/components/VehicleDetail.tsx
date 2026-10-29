import React, { useState, useEffect } from 'react';
import { VehicleData, TelemetryRecord, SimulatorStatus, CommandAuditLog } from '../types/tesla';
import { teslaApi } from '../services/api';
import { Tooltip, InfoTooltip } from './Tooltip';
import { 
  Battery, 
  BatteryCharging, 
  Thermometer, 
  Lock, 
  Unlock, 
  Gauge, 
  MapPin, 
  Wind, 
  Clock, 
  RefreshCw,
  Play,
  Square,
  Activity,
  Database,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Sun
} from 'lucide-react';

interface VehicleDetailProps {
  data: VehicleData | null;
  loading: boolean;
  onRefresh: () => void;
  onExecuteCommandPreview: (commandName: string) => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({
  data,
  loading,
  onRefresh,
  onExecuteCommandPreview
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charging' | 'climate' | 'location' | 'telemetry' | 'audit'>('overview');
  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus | null>(null);
  const [telemetryRecords, setTelemetryRecords] = useState<TelemetryRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<CommandAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [isTogglingSimulator, setIsTogglingSimulator] = useState(false);

  // Poll simulator status and latest telemetry
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const status = await teslaApi.getSimulatorStatus();
        if (isMounted) setSimulatorStatus(status);
      } catch (err) {
        console.error('Failed to get simulator status:', err);
      }
    };

    checkStatus();

    // If simulator is running, poll telemetry every 2.5s
    const interval = setInterval(async () => {
      if (!data) return;
      try {
        const status = await teslaApi.getSimulatorStatus();
        if (isMounted) setSimulatorStatus(status);

        if (status.isRunning) {
          const records = await teslaApi.getLatestTelemetry(data.vin);
          if (isMounted && records.length > 0) {
            setTelemetryRecords(records);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [data?.vin]);

  // Load telemetry records on tab switch or vehicle change
  useEffect(() => {
    if (!data) return;

    if (activeTab === 'telemetry') {
      const loadTelemetry = async () => {
        try {
          const records = await teslaApi.getLatestTelemetry(data.vin);
          setTelemetryRecords(records);
        } catch (err) {
          console.error('Error fetching initial telemetry records:', err);
        }
      };
      loadTelemetry();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [data?.vin, activeTab]);

  const loadAuditLogs = async () => {
    if (!data) return;
    setAuditLoading(true);
    try {
      const logs = await teslaApi.getVehicleAuditLogs(data.vin);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading command audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a vehicle from the fleet to view real-time telemetry.</p>
      </div>
    );
  }

  const handleToggleSimulator = async () => {
    if (!data) return;
    setIsTogglingSimulator(true);
    try {
      const nextEnable = !simulatorStatus?.isRunning;
      const updated = await teslaApi.toggleSimulator(nextEnable, data.vin, 3);
      setSimulatorStatus(updated);
      if (nextEnable) {
        // Immediate fetch
        const records = await teslaApi.getLatestTelemetry(data.vin);
        setTelemetryRecords(records);
      }
    } catch (err) {
      console.error('Toggle simulation error:', err);
    } finally {
      setIsTogglingSimulator(false);
    }
  };

  const getBatteryClass = (lvl: number) => {
    if (lvl > 50) return 'high';
    if (lvl > 20) return 'medium';
    return 'low';
  };

  const kmRange = (data.batteryRangeMiles * 1.60934).toFixed(1);

  return (
    <div className="glass-panel telemetry-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.8rem' }}>{data.displayName}</h2>
            <span className={`status-tag ${data.state.toLowerCase()}`}>{data.state}</span>
            {simulatorStatus?.isRunning && (
              <span className="mode-badge live" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulse-indicator active"></span>
                Live Telemetry Stream
              </span>
            )}
            {data.isMockData && !simulatorStatus?.isRunning && (
              <span className="mode-badge mock" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                Simulated Telemetry
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            VIN: {data.vin}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} />
            <span>Updated: {new Date(data.timestampUtc).toLocaleTimeString()}</span>
          </div>

          <button onClick={onRefresh} disabled={loading} className="btn btn-secondary">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Battery
        </button>
        <button 
          className={`tab-btn ${activeTab === 'charging' ? 'active' : ''}`}
          onClick={() => setActiveTab('charging')}
        >
          Charging & Energy
        </button>
        <button 
          className={`tab-btn ${activeTab === 'climate' ? 'active' : ''}`}
          onClick={() => setActiveTab('climate')}
        >
          Climate & Interior
        </button>
        <button 
          className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Location & Drive
        </button>
        <button 
          className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Activity size={15} color={simulatorStatus?.isRunning ? 'var(--emerald-green)' : 'inherit'} />
          <span>Fleet Telemetry Stream</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileText size={15} color={activeTab === 'audit' ? 'var(--cyber-cyan)' : 'inherit'} />
          <span>Command Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div>
          <div className="metric-row">
            <div className="metric-item">
              <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
                <span>Battery Level</span>
                <InfoTooltip 
                  title="High-Voltage State of Charge (SOC)"
                  content="Percentage of usable energy remaining in the vehicle traction battery pack."
                />
              </span>
              <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Battery size={22} color="var(--emerald-green)" />
                <span>{data.batteryLevel}%</span>
              </div>
            </div>

            <div className="metric-item">
              <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
                <span>Rated Range</span>
                <InfoTooltip 
                  title="Estimated Driving Range"
                  content="Estimated remaining travel distance based on current pack energy and EPA/WLTP consumption models."
                />
              </span>
              <div className="metric-value">
                {data.batteryRangeMiles.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>mi</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({kmRange} km)</span>
              </div>
            </div>

            <div className="metric-item">
              <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
                <span>Vehicle Speed</span>
                <InfoTooltip 
                  title="Ground Speed Telemetry"
                  content="Live velocity reported by vehicle wheel speed sensors via CAN bus."
                />
              </span>
              <div className="metric-value">
                {data.speedMph ?? 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>mph</span>
              </div>
            </div>

            <div className="metric-item">
              <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
                <span>Security & Locks</span>
                <InfoTooltip 
                  title="Electronic Door Latches"
                  content="Central lock state. Locked status secures cabin and arms perimeter surveillance."
                />
              </span>
              <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {data.isLocked ? <Lock size={20} color="var(--emerald-green)" /> : <Unlock size={20} color="var(--tesla-red)" />}
                <span>{data.isLocked ? 'Locked' : 'Unlocked'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <span>Battery State of Charge</span>
                <InfoTooltip 
                  title="Charge Limit Guard"
                  content={`Configured charge ceiling (${data.chargeLimitSoc}%). Keeping daily charge at 80% maximizes lithium cell longevity.`}
                />
              </span>
              <span style={{ color: 'var(--cyber-cyan)', fontWeight: 600 }}>{data.batteryLevel}% (Limit: {data.chargeLimitSoc}%)</span>
            </div>
            <div className="battery-bar-container">
              <div 
                className={`battery-bar-fill ${getBatteryClass(data.batteryLevel)}`} 
                style={{ width: `${data.batteryLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Safety Command Execution Section */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <ShieldCheck size={18} color="var(--cyber-cyan)" />
                <span>Safety-Gated Vehicle Operations</span>
                <InfoTooltip 
                  title="Safety Policy Enforced"
                  content="All commands are protected by explicit operator confirmation and logged to SQL Server for regulatory audit trails."
                />
              </h4>

              <button 
                onClick={() => setActiveTab('audit')} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                View Audit Trail &rarr;
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Every remote vehicle operation requires mandatory explicit operator confirmation and generates an immutable record in the SQL Server <code>CommandAuditLogs</code> table.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Tooltip
                title="Remote Visual Identification"
                content="Sends a signal to flash exterior headlights and hazard lights 5 times."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('flash_lights')}
                >
                  <Sun size={15} color="var(--cyber-cyan)" />
                  <span>Flash Lights</span>
                </button>
              </Tooltip>

              <Tooltip
                title="Acoustic Security Pulse"
                content="Sounds dual-tone horn twice for fleet locating or operator alert."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('honk_horn')}
                >
                  <Volume2 size={15} color="var(--amber-orange)" />
                  <span>Honk Horn</span>
                </button>
              </Tooltip>

              <Tooltip
                title="Physical Access Unlock"
                content="Unlocks passenger doors and electronic trunk latches. Requires operator confirmation."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('door_unlock')}
                >
                  <Unlock size={15} color="var(--tesla-red)" />
                  <span>Door Unlock</span>
                </button>
              </Tooltip>

              <Tooltip
                title="Perimeter Security Lock"
                content="Engages central electronic door locks and arms perimeter alarm sensors."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('door_lock')}
                >
                  <Lock size={15} color="var(--emerald-green)" />
                  <span>Door Lock</span>
                </button>
              </Tooltip>

              <Tooltip
                title="HVAC Cabin Preconditioning"
                content="Powers on heat pump / compressor to precondition cabin temperature to setpoint."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('auto_conditioning_start')}
                >
                  <Wind size={15} color="var(--cyber-cyan)" />
                  <span>Start HVAC Climate</span>
                </button>
              </Tooltip>

              <Tooltip
                title="HVAC Thermal Shutdown"
                content="Powers off active cabin climate system to preserve high-voltage battery reserve."
              >
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => onExecuteCommandPreview('auto_conditioning_stop')}
                >
                  <Wind size={15} color="var(--text-muted)" />
                  <span>Stop HVAC Climate</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Charging */}
      {activeTab === 'charging' && (
        <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Charging State</span>
              <InfoTooltip 
                title="Vehicle Charge Status"
                content="Current charging session status: Disconnected, Charging, Complete, or Stopped."
              />
            </span>
            <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BatteryCharging size={20} color="var(--cyber-cyan)" />
              <span>{data.chargingState}</span>
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Target Charge Limit</span>
              <InfoTooltip 
                title="Configured Charge Ceiling"
                content="Configured maximum charge percentage. Setting to 80% maximizes lithium cell longevity."
              />
            </span>
            <div className="metric-value">{data.chargeLimitSoc}%</div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Time to Full Charge</span>
              <InfoTooltip 
                title="Estimated Charging Duration"
                content="Estimated remaining time to reach the configured charge limit based on current charging rate."
              />
            </span>
            <div className="metric-value">
              {data.timeToFullChargeHours !== null ? `${data.timeToFullChargeHours} hrs` : 'Complete / Disconnected'}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Climate */}
      {activeTab === 'climate' && (
        <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Inside Cabin Temp</span>
              <InfoTooltip 
                title="Cabin Thermal Sensor"
                content="Current temperature measured by the vehicle's interior cabin thermistor."
              />
            </span>
            <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Thermometer size={20} color="var(--cyber-cyan)" />
              <span>{data.insideTempC !== null ? `${data.insideTempC}°C` : 'N/A'}</span>
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Outside Ambient Temp</span>
              <InfoTooltip 
                title="Exterior Weather Sensor"
                content="Outdoor ambient air temperature reported by the vehicle exterior mirror sensor."
              />
            </span>
            <div className="metric-value">
              {data.outsideTempC !== null ? `${data.outsideTempC}°C` : 'N/A'}
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>HVAC Climate System</span>
              <InfoTooltip 
                title="Thermal Management System"
                content="High-efficiency heat pump / AC compressor status used for passenger comfort."
              />
            </span>
            <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wind size={20} color={data.isClimateOn ? 'var(--emerald-green)' : 'var(--text-muted)'} />
              <span>{data.isClimateOn ? 'Active' : 'Off'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Location & Drive */}
      {activeTab === 'location' && (
        <div className="metric-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Odometer</span>
              <InfoTooltip 
                title="Lifetime Vehicle Distance"
                content="Total accumulated road mileage recorded in the vehicle's tamper-proof memory."
              />
            </span>
            <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Gauge size={20} color="var(--cyber-cyan)" />
              <span>{data.odometerMiles.toLocaleString()} mi</span>
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>Speed & Gear</span>
              <InfoTooltip 
                title="Powertrain Transmission"
                content="Current drive shift selector position (Park, Drive, Neutral, Reverse) and velocity."
              />
            </span>
            <div className="metric-value">
              {data.speedMph ?? 0} mph ({data.shiftState || 'Parked'})
            </div>
          </div>

          <div className="metric-item">
            <span className="metric-label" style={{ display: 'flex', alignItems: 'center' }}>
              <span>GNSS Coordinates</span>
              <InfoTooltip 
                title="Satellite GPS Coordinates"
                content="Vehicle geographic latitude and longitude reported by onboard GNSS receiver."
              />
            </span>
            <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
              <MapPin size={18} color="var(--tesla-red)" />
              <span>{data.latitude ?? '37.7749'}, {data.longitude ?? '-122.4194'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Real-Time Fleet Telemetry Stream */}
      {activeTab === 'telemetry' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Vehicle Telemetry Streamer</h3>
                <span className={`status-tag ${simulatorStatus?.isRunning ? 'online' : 'offline'}`}>
                  {simulatorStatus?.isRunning ? 'Streaming Active' : 'Standby'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Emits telemetry signals every 3 seconds to SQL Server and broadcasts live updates via SignalR.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                <div>Packets Ingested: <strong style={{ color: 'var(--cyber-cyan)' }}>{simulatorStatus?.packetsEmitted ?? 0}</strong></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interval: {simulatorStatus?.intervalSeconds ?? 3}s</div>
              </div>

              <button 
                className={`btn ${simulatorStatus?.isRunning ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleToggleSimulator}
                disabled={isTogglingSimulator}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '160px', justifyContent: 'center' }}
              >
                {simulatorStatus?.isRunning ? (
                  <>
                    <Square size={14} />
                    <span>Stop Stream</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Start Live Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Signals Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={15} />
              <span>Latest Persisted Vehicle Signals (SQL Server)</span>
            </h4>

            {telemetryRecords.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No telemetry packets ingested yet. Click "Start Live Stream" above to stream vehicle data into SQL Server.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                {telemetryRecords.map((record) => (
                  <div key={record.id || record.signalName} className="metric-item" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <span className="metric-label">{record.signalName}</span>
                    <div className="metric-value" style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
                      {record.signalValue}
                      {record.unit && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
                          {record.unit}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                      {new Date(record.timestampUtc).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Command Audit Logs */}
      {activeTab === 'audit' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--emerald-green)" />
                <span>Command Execution Audit Trail (SQL Server)</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Immutable security logs recorded in the <code>CommandAuditLogs</code> table for compliance and safety verification.
              </p>
            </div>

            <button 
              onClick={loadAuditLogs} 
              disabled={auditLoading}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RefreshCw size={14} className={auditLoading ? 'spin' : ''} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No commands executed for this vehicle yet. Use the operations buttons on the Overview tab to test safety-gated execution.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Timestamp</span>
                        <InfoTooltip title="Event Timestamp" content="Timestamp recorded in SQL Server when the command was requested." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Command</span>
                        <InfoTooltip title="Action Signal" content="Target Tesla remote vehicle action (e.g. door lock, honk horn)." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Initiated By</span>
                        <InfoTooltip title="Operator Identity" content="The operator account or web session that authorized the action." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Safety Gate</span>
                        <InfoTooltip title="Two-Step Confirmation" content="Safety gate check ensuring the operator clicked confirm before execution." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Status</span>
                        <InfoTooltip title="Vehicle Acknowledgment" content="Real-time acknowledgment status returned by the Tesla vehicle." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Details</span>
                        <InfoTooltip title="Diagnostic Payload" content="Response message or diagnostic error details from Tesla Fleet API." />
                      </span>
                    </th>
                    <th style={{ padding: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span>Audit ID</span>
                        <InfoTooltip title="Immutable Log ID" content="Unique UUID primary key in the SQL Server CommandAuditLogs table." />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {new Date(log.createdAtUtc).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--cyber-cyan)' }}>
                          {log.commandName}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.initiatedBy}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--emerald-green)', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={13} />
                          Confirmed
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {log.success ? (
                          <span className="status-tag online" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            Success
                          </span>
                        ) : (
                          <span className="status-tag offline" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            Failed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.responsePayload || log.errorReason || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
