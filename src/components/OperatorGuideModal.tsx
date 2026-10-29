import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Battery, 
  Radio, 
  Database, 
  Zap
} from 'lucide-react';

interface OperatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorGuideModal: React.FC<OperatorGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-panel operator-guide-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="guide-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="guide-icon-badge">
              <Zap size={22} color="var(--tesla-red)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, letterSpacing: '-0.02em' }}>
                Tesla Fleet Telemetry & Operations Guide
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                Reference manual for enterprise fleet elements, telemetry metrics, and safety policies.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary close-btn"
            title="Close Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="guide-body">
          {/* Section 1: Authentication */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Cpu size={18} color="var(--emerald-green)" />
              <h4>1. Enterprise M2M Partner Authentication</h4>
            </div>
            <p>
              Your system connects directly to Tesla's Partner Auth server using <strong>OAuth 2.0 Client Credentials</strong>.
              Because your corporate organization leases/owns these 7 vehicles under your Tesla Developer Application,
              no interactive consumer Tesla logins or browser redirections are required. Tokens are cryptographically acquired
              and securely refreshed by the .NET backend.
            </p>
            <div className="guide-pills">
              <span className="pill">Grant: client_credentials</span>
              <span className="pill">Audience: fleet-api.prd.na.vn.cloud.tesla.com</span>
              <span className="pill">No Password Prompts</span>
            </div>
          </div>

          {/* Section 2: Vehicle States */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Radio size={18} color="var(--cyber-cyan)" />
              <h4>2. Vehicle Status: Online vs. Asleep</h4>
            </div>
            <p>
              Tesla vehicles prioritize battery preservation. When parked, the onboard gateway enters a deep sleep mode
              to prevent <em>vampire drain</em>:
            </p>
            <ul className="guide-list">
              <li>
                <strong>ONLINE:</strong> The cellular modem and telemetry CAN bus are energized. Live battery, temperature,
                speed, and coordinates are continuously streamable.
              </li>
              <li>
                <strong>ASLEEP:</strong> High-voltage contactors are open to save energy. Click <strong>"Wake Up"</strong>
                to send an encrypted cellular pulse to bring the vehicle online within 5–15 seconds.
              </li>
              <li>
                <strong>OFFLINE:</strong> Vehicle has no cellular signal (underground parking, tunnel) or is in deep service mode.
              </li>
            </ul>
          </div>

          {/* Section 3: Telemetry Metrics */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Battery size={18} color="var(--amber-orange)" />
              <h4>3. Telemetry Signals Explained</h4>
            </div>
            <div className="guide-grid-2">
              <div className="guide-subcard">
                <strong>Battery SOC (State of Charge):</strong>
                <span>Percentage of usable energy remaining in the battery pack. Daily operational recommendation is 20%–80%.</span>
              </div>
              <div className="guide-subcard">
                <strong>Rated Driving Range:</strong>
                <span>Estimated mileage calculated from current pack capacity and standard EPA consumption models.</span>
              </div>
              <div className="guide-subcard">
                <strong>Charge Limit SOC:</strong>
                <span>Maximum charge cutoff set in the vehicle (e.g. 80% to preserve cell health vs 100% for long-distance trips).</span>
              </div>
              <div className="guide-subcard">
                <strong>HVAC Climate:</strong>
                <span>Remote cabin thermal conditioning status. Allows preheating in winter or precooling in summer before dispatch.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Safety-Gated Commands */}
          <div className="guide-card">
            <div className="guide-card-header">
              <ShieldCheck size={18} color="var(--tesla-red)" />
              <h4>4. Safety-Gated Remote Actuation</h4>
            </div>
            <p>
              Remote vehicle commands (honking the horn, flashing headlights, locking/unlocking doors, toggling HVAC)
              physically interact with real vehicles in the real world. To prevent unintended actuation:
            </p>
            <ul className="guide-list">
              <li>
                <strong>Mandatory Confirmation Modal:</strong> Every command presents a safety dialogue showing vehicle name,
                VIN, and action intent before execution.
              </li>
              <li>
                <strong>Immutable Audit Logging:</strong> Every request is timestamped, tagged with operator identity,
                and permanently recorded in the SQL Server <code>CommandAuditLogs</code> database table.
              </li>
            </ul>
          </div>

          {/* Section 5: Telemetry Pipeline */}
          <div className="guide-card">
            <div className="guide-card-header">
              <Database size={18} color="var(--slate-purple)" />
              <h4>5. High-Frequency Telemetry Streamer</h4>
            </div>
            <p>
              The <strong>Telemetry Streamer</strong> simulates high-frequency CAN bus ingestion. When enabled,
              it generates realistic vehicle telemetry packets every 3 seconds, stores them into SQL Server,
              and broadcasts updates to connected operator dashboards via SignalR WebSockets.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="guide-footer">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tesla Fleet Telemetry POC • Enterprise M2M Fleet Architecture
          </span>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
