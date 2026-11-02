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

export function getSessionToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tesla_session_token');
  }
  return null;
}

export function setSessionToken(token: string | null): void {
  if (typeof window !== 'undefined') {
    if (token && token.trim()) {
      localStorage.setItem('tesla_session_token', token.trim());
    } else {
      localStorage.removeItem('tesla_session_token');
    }
  }
}

function getApiBase(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/tesla` : '/api/tesla';
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getSessionToken();
  if (token) {
    headers['X-Session-Token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'Service returned unexpected HTML response. The backend service may be temporarily unavailable or restarting.'
    );
  }

  if (!res.ok) {
    if (res.status === 401) {
      setSessionToken(null);
    }
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
    const res = await fetch(`${getApiBase()}/connection`, {
      headers: getAuthHeaders()
    });
    return handleResponse<TeslaConnectionStatus>(res);
  },

  async getLoginUrl(): Promise<LoginUrlResponse> {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      headers: getAuthHeaders()
    });
    return handleResponse<LoginUrlResponse>(res);
  },

  async simulateMockCallback(state: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/auth/callback?code=mock_code&state=${encodeURIComponent(state)}`, {
      headers: getAuthHeaders({ 'Accept': 'application/json' })
    });
    if (!res.ok) {
      throw new Error(`Mock authorization failed with status ${res.status}`);
    }
    const data = await res.json().catch(() => null);
    if (data?.sessionToken) {
      setSessionToken(data.sessionToken);
    }
  },

  async disconnect(): Promise<{ message: string }> {
    const res = await fetch(`${getApiBase()}/auth/disconnect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch(`${getApiBase()}/vehicles`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Vehicle[]>(res);
  },

  async getVehicle(idOrVin: string | number): Promise<Vehicle> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Vehicle>(res);
  },

  async getVehicleData(idOrVin: string | number): Promise<VehicleData> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/data`, {
      headers: getAuthHeaders()
    });
    return handleResponse<VehicleData>(res);
  },

  async wakeUpVehicle(idOrVin: string | number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/wake`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getLatestTelemetry(vin: string): Promise<TelemetryRecord[]> {
    const res = await fetch(`${getApiBase()}/telemetry/${vin}/latest`, {
      headers: getAuthHeaders()
    });
    return handleResponse<TelemetryRecord[]>(res);
  },

  async getTelemetryHistory(vin: string, signalName?: string, limit: number = 50): Promise<TelemetryRecord[]> {
    const params = new URLSearchParams();
    if (signalName) params.append('signalName', signalName);
    params.append('limit', limit.toString());
    const res = await fetch(`${getApiBase()}/telemetry/${vin}/history?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<TelemetryRecord[]>(res);
  },

  async getSimulatorStatus(): Promise<SimulatorStatus> {
    const res = await fetch(`${getApiBase()}/telemetry/simulator/status`, {
      headers: getAuthHeaders()
    });
    return handleResponse<SimulatorStatus>(res);
  },

  async toggleSimulator(enable: boolean, vin?: string, intervalSeconds: number = 3): Promise<SimulatorStatus> {
    const res = await fetch(`${getApiBase()}/telemetry/simulator/toggle`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ command, parameters, confirmedByUser })
    });
    return handleResponse<VehicleCommandResult>(res);
  },

  async getVehicleAuditLogs(idOrVin: string | number, limit: number = 50): Promise<CommandAuditLog[]> {
    const res = await fetch(`${getApiBase()}/vehicles/${idOrVin}/commands/audit-logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<CommandAuditLog[]>(res);
  },
};
