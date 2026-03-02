import type {
  ChangeProposalId,
  BaselineId,
  RevisionId,
  RequirementId,
  ArchElementId,
  BomItemId,
  Timestamp,
} from './ids.ts';
import type { ChangeProposalStatus, ChangeImpact } from './enums.ts';

export interface ChangeProposal {
  id: ChangeProposalId;
  revisionId: RevisionId;
  title: string;
  description: string;
  rationale: string;
  status: ChangeProposalStatus;
  impact: ChangeImpact;
  impactedRequirementIds: RequirementId[];
  impactedElementIds: ArchElementId[];
  impactedBomItemIds: BomItemId[];
  proposedBy: string;
  approvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Baseline {
  id: BaselineId;
  revisionId: RevisionId;
  name: string;
  description: string;
  snapshot: string; // JSON-serialized snapshot of state at baseline time
  createdBy: string;
  createdAt: Timestamp;
}
