import type {
  ReleaseId,
  FieldedUnitId,
  MaintenanceEventId,
  IncidentId,
  RevisionId,
  BaselineId,
  Timestamp,
} from './ids.ts';
import type { ReleaseStatus, FieldedUnitStatus, IncidentSeverity } from './enums.ts';

export interface Release {
  id: ReleaseId;
  revisionId: RevisionId;
  baselineId?: BaselineId;
  version: string;
  name: string;
  description: string;
  status: ReleaseStatus;
  releaseDate?: Timestamp;
  knownIssues: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FieldedUnit {
  id: FieldedUnitId;
  releaseId: ReleaseId;
  serialNumber: string;
  location: string;
  status: FieldedUnitStatus;
  deployedAt: Timestamp;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceEvent {
  id: MaintenanceEventId;
  fieldedUnitId: FieldedUnitId;
  description: string;
  performedBy: string;
  performedAt: Timestamp;
  notes: string;
  createdAt: Timestamp;
}

export interface Incident {
  id: IncidentId;
  fieldedUnitId: FieldedUnitId;
  title: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
  reportedAt: Timestamp;
  resolvedAt?: Timestamp;
  resolution?: string;
  createdAt: Timestamp;
}
