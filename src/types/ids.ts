import { nanoid } from 'nanoid';

// Branded ID types for compile-time safety
export type FamilyId = string & { readonly __brand: 'FamilyId' };
export type VariantId = string & { readonly __brand: 'VariantId' };
export type RevisionId = string & { readonly __brand: 'RevisionId' };
export type RequirementId = string & { readonly __brand: 'RequirementId' };
export type LinkId = string & { readonly __brand: 'LinkId' };
export type ArchElementId = string & { readonly __brand: 'ArchElementId' };
export type ArchInterfaceId = string & { readonly __brand: 'ArchInterfaceId' };
export type ArtifactId = string & { readonly __brand: 'ArtifactId' };
export type TestPlanId = string & { readonly __brand: 'TestPlanId' };
export type TestCaseId = string & { readonly __brand: 'TestCaseId' };
export type TestRunId = string & { readonly __brand: 'TestRunId' };
export type TestResultId = string & { readonly __brand: 'TestResultId' };
export type TestEvidenceId = string & { readonly __brand: 'TestEvidenceId' };
export type BomItemId = string & { readonly __brand: 'BomItemId' };
export type SupplierId = string & { readonly __brand: 'SupplierId' };
export type MilestoneId = string & { readonly __brand: 'MilestoneId' };
export type GatingEventId = string & { readonly __brand: 'GatingEventId' };
export type DependencyId = string & { readonly __brand: 'DependencyId' };
export type ChangeProposalId = string & { readonly __brand: 'ChangeProposalId' };
export type BaselineId = string & { readonly __brand: 'BaselineId' };
export type ReleaseId = string & { readonly __brand: 'ReleaseId' };
export type FieldedUnitId = string & { readonly __brand: 'FieldedUnitId' };
export type MaintenanceEventId = string & { readonly __brand: 'MaintenanceEventId' };
export type IncidentId = string & { readonly __brand: 'IncidentId' };
export type ReviewId = string & { readonly __brand: 'ReviewId' };
export type SignOffId = string & { readonly __brand: 'SignOffId' };

export type Timestamp = string;

export function newId<T extends string>(): T {
  return nanoid() as T;
}
