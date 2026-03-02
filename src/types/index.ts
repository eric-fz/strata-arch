export type {
  FamilyId, VariantId, RevisionId, RequirementId, LinkId,
  ArchElementId, ArchInterfaceId, ArtifactId,
  TestPlanId, TestCaseId, TestRunId, TestResultId, TestEvidenceId,
  BomItemId, SupplierId, MilestoneId, GatingEventId, DependencyId,
  ChangeProposalId, BaselineId, ReleaseId, FieldedUnitId,
  MaintenanceEventId, IncidentId, ReviewId, SignOffId, Timestamp,
} from './ids.ts';
export { newId } from './ids.ts';

export type {
  RequirementCategory, RequirementStatus, RequirementPriority, RequirementType,
  VerificationMethod, VerificationStatus, ArchitectureElementType,
  ArtifactType, ArtifactStatus, TestStatus, TestResultOutcome, TestEvidenceType,
  LinkType, BomItemCategory, MilestoneType, MilestoneStatus,
  ChangeProposalStatus, ChangeImpact, ReleaseStatus, FieldedUnitStatus,
  IncidentSeverity, ReviewType, ReviewStatus, ReviewDecision, LifecyclePhase,
} from './enums.ts';

export type { RobotFamily, RobotVariant, Revision } from './core.ts';
export type { Requirement, RequirementLink } from './requirements.ts';
export type { ArchitectureElement, ArchitectureInterface, ArchitecturePort } from './architecture.ts';
export type { Artifact } from './artifacts.ts';
export type { TestPlan, TestCase, TestRun, TestResult, TestEvidence } from './verification.ts';
export type { BomItem, Supplier } from './bom.ts';
export type { Milestone, GatingEvent, TimelineEntry, Dependency } from './planning.ts';
export type { ChangeProposal, Baseline } from './change-control.ts';
export type { Release, FieldedUnit, MaintenanceEvent, Incident } from './releases.ts';
export type { RequirementArchitectureLink, RequirementArtifactLink, RequirementTestCaseLink, ArchitectureArtifactLink } from './links.ts';
export type { DesignReview, SignOff } from './reviews.ts';

export { CATEGORY_META, STATUS_META, PRIORITY_META, PHASE_META } from './display-meta.ts';
