// ─── Requirement Enums ─────────────────────────────────────

export type RequirementCategory =
  | 'system'
  | 'subsystem'
  | 'interface'
  | 'safety'
  | 'regulatory'
  | 'manufacturing'
  | 'service'
  | 'performance';

export type RequirementStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'baselined'
  | 'deprecated';

export type RequirementPriority = 'critical' | 'high' | 'medium' | 'low';

export type RequirementType =
  | 'functional'
  | 'performance'
  | 'interface'
  | 'physical'
  | 'safety'
  | 'operational';

export type VerificationMethod =
  | 'analysis'
  | 'test'
  | 'inspection'
  | 'demonstration'
  | 'similarity';

export type VerificationStatus =
  | 'not_started'
  | 'in_progress'
  | 'passed'
  | 'failed'
  | 'waived';

// ─── Architecture Enums ────────────────────────────────────

export type ArchitectureElementType =
  | 'mechanical'
  | 'electrical'
  | 'compute'
  | 'networking'
  | 'autonomy_dataflow'
  | 'safety_interlock';

// ─── Artifact Enums ────────────────────────────────────────

export type ArtifactType =
  | 'cad_model'
  | 'drawing'
  | 'schematic'
  | 'firmware'
  | 'software'
  | 'datasheet'
  | 'spec_sheet'
  | 'test_report'
  | 'analysis_report'
  | 'manual'
  | 'other';

export type ArtifactStatus = 'draft' | 'released' | 'obsolete';

// ─── Verification / Test Enums ─────────────────────────────

export type TestStatus =
  | 'draft'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'blocked';

export type TestResultOutcome = 'pass' | 'fail' | 'skip' | 'blocked';

export type TestEvidenceType =
  | 'log'
  | 'plot'
  | 'photo'
  | 'video'
  | 'field_report';

// ─── Link Enums ────────────────────────────────────────────

export type LinkType =
  | 'parent_child'
  | 'derived_from'
  | 'conflicts_with'
  | 'satisfies'
  | 'verified_by';

// ─── BOM Enums ─────────────────────────────────────────────

export type BomItemCategory =
  | 'mechanical'
  | 'electrical'
  | 'pcb'
  | 'fastener'
  | 'cable'
  | 'sensor'
  | 'actuator'
  | 'compute'
  | 'enclosure'
  | 'consumable'
  | 'other';

// ─── Planning Enums ────────────────────────────────────────

export type MilestoneType =
  | 'pdr'
  | 'cdr'
  | 'fai'
  | 'dvt'
  | 'pvt'
  | 'production_release'
  | 'custom';

export type MilestoneStatus = 'upcoming' | 'in_progress' | 'completed' | 'missed';

// ─── Change Control Enums ──────────────────────────────────

export type ChangeProposalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'closed';

export type ChangeImpact = 'low' | 'medium' | 'high' | 'critical';

// ─── Release Enums ─────────────────────────────────────────

export type ReleaseStatus =
  | 'planning'
  | 'candidate'
  | 'released'
  | 'recalled'
  | 'end_of_life';

export type FieldedUnitStatus =
  | 'active'
  | 'maintenance'
  | 'decommissioned'
  | 'recalled';

export type IncidentSeverity = 'minor' | 'major' | 'critical' | 'safety';

// ─── Review Enums ──────────────────────────────────────────

export type ReviewType = 'PDR' | 'CDR' | 'FAI' | 'QT' | 'other';
export type ReviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ReviewDecision = 'approved' | 'rejected' | 'needs_changes';

// ─── Lifecycle Enums ───────────────────────────────────────

export type LifecyclePhase =
  | 'concept'
  | 'alpha'
  | 'beta'
  | 'dvt'
  | 'pvt'
  | 'production';
