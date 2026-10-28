import React from 'react';
import { Vehicle } from '../types/tesla';
import { Moon, Radio, Car } from 'lucide-react';

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
    >
      <div>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{vehicle.displayName}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {vehicle.vin}
            </span>
          </div>

          <span className={`status-tag ${vehicle.state.toLowerCase()}`}>
            {vehicle.state}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <Car size={16} />
          <span>Color: {vehicle.color || 'Standard'}</span>
          <span>•</span>
          <span>v{vehicle.apiVersion}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isOnline ? 'Real-time telemetry available' : 'Vehicle is in sleep mode'}
        </span>

        {isAsleep && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            onClick={(e) => onWake(vehicle.vin, e)}
          >
            <Moon size={14} />
            <span>Wake Up</span>
          </button>
        )}

        {isOnline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--emerald-green)', fontSize: '0.8rem' }}>
            <Radio size={14} className="spin" />
            <span>Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
