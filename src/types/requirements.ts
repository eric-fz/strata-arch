import type { RequirementId, RevisionId, Timestamp } from './ids.ts';
import type {
  RequirementCategory,
  RequirementStatus,
  RequirementPriority,
  RequirementType,
  VerificationMethod,
} from './enums.ts';

export interface Requirement {
  id: RequirementId;
  revisionId: RevisionId;
  identifier: string;
  title: string;
  description: string;
  rationale: string;
  category: RequirementCategory;
  reqType: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  owner: string;
  parentRequirementId?: RequirementId;
  nominalValue?: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  verificationMethod: VerificationMethod;
  acceptanceCriteria: string;
  applicableStandards?: string[];
  version: number;
  previousVersionId?: RequirementId;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RequirementLink {
  id: string;
  sourceId: RequirementId;
  targetId: RequirementId;
  linkType: 'parent_child' | 'derived_from' | 'conflicts_with' | 'satisfies' | 'verified_by';
  description?: string;
  createdAt: Timestamp;
}
