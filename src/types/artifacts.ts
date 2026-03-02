import type { ArtifactId, RevisionId, Timestamp } from './ids.ts';
import type { ArtifactType, ArtifactStatus } from './enums.ts';

export interface Artifact {
  id: ArtifactId;
  revisionId: RevisionId;
  name: string;
  description: string;
  artifactType: ArtifactType;
  status: ArtifactStatus;
  version: string;
  url?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
