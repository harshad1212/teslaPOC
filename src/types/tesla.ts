export interface TeslaConnectionStatus {
  isConnected: boolean;
  email: string | null;
  scopes: string | null;
  tokenExpiresAtUtc: string | null;
  expiresInMinutes: number | null;
  isMockMode: boolean;
  region: string;
  statusMessage: string;
}

export interface Vehicle {
  id: number;
  vin: string;
  displayName: string;
  state: string; // online, asleep, offline
  inService: boolean;
  apiVersion: number;
  color: string | null;
  lastSeenAtUtc: string | null;
}

export interface VehicleData {
  vin: string;
  displayName: string;
  state: string;
  batteryLevel: number;
  batteryRangeMiles: number;
  chargingState: string;
  chargeLimitSoc: number;
  timeToFullChargeHours: number | null;
  insideTempC: number | null;
  outsideTempC: number | null;
  isClimateOn: boolean;
  isLocked: boolean;
  odometerMiles: number;
  latitude: number | null;
  longitude: number | null;
  speedMph: number | null;
  shiftState: string | null;
  timestampUtc: string;
  isMockData: boolean;
}


export interface TelemetryRecord {
  id: string;
  vin: string;
  timestampUtc: string;
  signalName: string;
  signalValue: string;
  unit: string | null;
}

export interface SimulatorStatus {
  isRunning: boolean;
  activeVin: string | null;
  intervalSeconds: number;
  packetsEmitted: number;
  startedAtUtc: string | null;
}

export interface CommandAuditLog {
  id: string;
  vehicleVin: string;
  commandName: string;
  parametersJson: string | null;
  initiatedBy: string;
  confirmationConfirmed: boolean;
  success: boolean;
  responsePayload: string | null;
  errorReason: string | null;
  createdAtUtc: string;
}

export interface VehicleCommandResult {
  command: string;
  success: boolean;
  message: string;
  reason: string | null;
  auditLogId: string | null;
  executedAtUtc: string;
}
