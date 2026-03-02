import type {
  RequirementId,
  ArchElementId,
  ArtifactId,
  TestCaseId,
  Timestamp,
} from './ids.ts';

export interface RequirementArchitectureLink {
  id: string;
  requirementId: RequirementId;
  elementId: ArchElementId;
  createdAt: Timestamp;
}

export interface RequirementArtifactLink {
  id: string;
  requirementId: RequirementId;
  artifactId: ArtifactId;
  createdAt: Timestamp;
}

export interface RequirementTestCaseLink {
  id: string;
  requirementId: RequirementId;
  testCaseId: TestCaseId;
  createdAt: Timestamp;
}

export interface ArchitectureArtifactLink {
  id: string;
  elementId: ArchElementId;
  artifactId: ArtifactId;
  createdAt: Timestamp;
}
