import React from 'react';
import { Vehicle } from '../types/tesla';
import { Moon, Radio, Car } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
  onWake: (vin: string, e: React.MouseEvent) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isSelected,
  onSelect,
  onWake
}) => {
  const isOnline = vehicle.state.toLowerCase() === 'online';
  const isAsleep = vehicle.state.toLowerCase() === 'asleep';

  return (
    <div 
      className={`glass-panel vehicle-card ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect(vehicle)}
      style={{
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}
    >
      <div>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', color: isSelected ? 'var(--cyber-cyan)' : '#f1f5f9' }}>
              {vehicle.displayName}
            </h3>
            <Tooltip
              title="Vehicle Identification Number (VIN)"
              content="Unique 17-character global manufacturer identifier assigned to this vehicle."
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', cursor: 'help' }}>
                {vehicle.vin}
              </span>
            </Tooltip>
          </div>

          <Tooltip
            title={`Vehicle State: ${vehicle.state.toUpperCase()}`}
            content={
              isOnline
                ? 'Gateway active: Modem and CAN bus sensors are online and ready for telemetry queries.'
                : isAsleep
                ? 'Power save sleep: High-voltage contactors open to prevent standby battery drain. Wake up required.'
                : 'Vehicle is currently offline or unreachable via cellular telemetry gateway.'
            }
          >
            <span className={`status-tag ${vehicle.state.toLowerCase()}`} style={{ cursor: 'help' }}>
              {vehicle.state}
            </span>
          </Tooltip>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <Car size={16} />
          <span>Color: {vehicle.color || 'Pearl White'}</span>
          <span>•</span>
          <Tooltip
            title="Tesla Firmware Protocol"
            content="Onboard gateway API protocol version negotiated with the Tesla Fleet cloud service."
          >
            <span style={{ cursor: 'help' }}>Protocol v{vehicle.apiVersion}</span>
          </Tooltip>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isOnline ? 'Real-time telemetry streaming' : 'Standby sleep mode'}
        </span>

        {isAsleep && (
          <Tooltip
            title="Cellular Gateway Wake Up"
            content="Sends an authorized cellular ping to bring the vehicle online within 5–15 seconds."
          >
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={(e) => onWake(vehicle.vin, e)}
            >
              <Moon size={14} color="var(--amber-orange)" />
              <span>Wake Up</span>
            </button>
          </Tooltip>
        )}

        {isOnline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-green)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Radio size={14} className="spin" />
            <span>Telemetry Online</span>
          </div>
        )}
      </div>
    </div>
  );
};
