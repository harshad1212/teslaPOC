import { TeslaConnectionStatus, Vehicle, VehicleData, LoginUrlResponse, TelemetryRecord, SimulatorStatus, CommandAuditLog, VehicleCommandResult } from '../types/tesla';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tesla_api_base_url');
    if (stored) return stored.replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  return (envUrl || '').replace(/\/+$/, '');
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const cleaned = (url || '').trim().replace(/\/+$/, '');
    if (cleaned) {
      localStorage.setItem('tesla_api_base_url', cleaned);
    } else {
      localStorage.removeItem('tesla_api_base_url');
    }
  }
}

function getApiBase(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/tesla` : '/api/tesla';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const currentBase = getApiBaseUrl() || window.location.origin;
    throw new Error(
      `Endpoint returned HTML instead of JSON. Ensure your .NET backend is running and the Backend API URL is configured (${currentBase}).`
    );
  }

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      errorDetail = data.detail || data.error || data.message || errorDetail;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const teslaApi = {
  async getConnectionStatus(): Promise<TeslaConnectionStatus> {
    const res = await fetch(`${getApiBase()}/connection`);
    return handleResponse<TeslaConnectionStatus>(res);
  },

  async getLoginUrl(): Promise<LoginUrlResponse> {
    const res = await fetch(`${getApiBase()}/auth/login`);
    return handleResponse<LoginUrlResponse>(res);
  },

  async simulateMockCallback(state: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/auth/callback?code=mock_code&state=${encodeURIComponent(state)}`);
    if (!res.ok) {
      throw new Error(`Mock authorization failed with status ${res.status}`);
    }
  },

  async disconnect(): Promise<{ message: string }> {
    const res = await fetch(`${getApiBase()}/auth/disconnect`, { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch(`${getApiBase()}/vehicles`);
    return handleResponse<Vehicle[]>(res);
  },

  async getVehicle(idOrVin: string | number): Promise<Vehicle> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}`);
    return handleResponse<Vehicle>(res);
  },

  async getVehicleData(idOrVin: string | number): Promise<VehicleData> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/data`);
    return handleResponse<VehicleData>(res);
  },

  async wakeUpVehicle(idOrVin: string | number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/wake`, { method: 'POST' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getLatestTelemetry(vin: string): Promise<TelemetryRecord[]> {
    const res = await fetch(`${getApiBase()}/telemetry/${vin}/latest`);
    return handleResponse<TelemetryRecord[]>(res);
  },

  async getTelemetryHistory(vin: string, signalName?: string, limit: number = 50): Promise<TelemetryRecord[]> {
    const params = new URLSearchParams();
    if (signalName) params.append('signalName', signalName);
    params.append('limit', limit.toString());
    const res = await fetch(`${getApiBase()}/telemetry/${vin}/history?${params.toString()}`);
    return handleResponse<TelemetryRecord[]>(res);
  },

  async getSimulatorStatus(): Promise<SimulatorStatus> {
    const res = await fetch(`${getApiBase()}/telemetry/simulator/status`);
    return handleResponse<SimulatorStatus>(res);
  },

  async toggleSimulator(enable: boolean, vin?: string, intervalSeconds: number = 3): Promise<SimulatorStatus> {
    const res = await fetch(`${getApiBase()}/telemetry/simulator/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable, vin, intervalSeconds })
    });
    return handleResponse<SimulatorStatus>(res);
  },

  async executeCommand(
    idOrVin: string | number,
    command: string,
    parameters?: Record<string, any>,
    confirmedByUser: boolean = true
  ): Promise<VehicleCommandResult> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, parameters, confirmedByUser })
    });
    return handleResponse<VehicleCommandResult>(res);
  },

  async getVehicleAuditLogs(idOrVin: string | number, limit: number = 50): Promise<CommandAuditLog[]> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/commands/audit-logs?limit=${limit}`);
    return handleResponse<CommandAuditLog[]>(res);
  }
};
