import type { ArchElementId, ArchInterfaceId, RevisionId, Timestamp } from './ids.ts';
import type { ArchitectureElementType } from './enums.ts';

export interface ArchitecturePort {
  id: string;
  label: string;
  side: 'top' | 'right' | 'bottom' | 'left';
}

export interface ArchitectureElement {
  id: ArchElementId;
  revisionId: RevisionId;
  name: string;
  description: string;
  domainType: ArchitectureElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  ports: ArchitecturePort[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ArchitectureInterface {
  id: ArchInterfaceId;
  revisionId: RevisionId;
  sourceElementId: ArchElementId;
  sourcePortId: string;
  targetElementId: ArchElementId;
  targetPortId: string;
  label: string;
  description: string;
  createdAt: Timestamp;
}
