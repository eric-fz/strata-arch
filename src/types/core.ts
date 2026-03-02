import type { FamilyId, VariantId, RevisionId, Timestamp } from './ids.ts';
import type { LifecyclePhase } from './enums.ts';

export interface RobotFamily {
  id: FamilyId;
  name: string;
  codeName: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RobotVariant {
  id: VariantId;
  familyId: FamilyId;
  name: string;
  description: string;
  phase: LifecyclePhase;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Revision {
  id: RevisionId;
  variantId: VariantId;
  version: string;
  description: string;
  isHead: boolean;
  createdAt: Timestamp;
}
