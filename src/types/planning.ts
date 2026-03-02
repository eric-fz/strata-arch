import type { MilestoneId, GatingEventId, DependencyId, RevisionId, Timestamp } from './ids.ts';
import type { MilestoneType, MilestoneStatus } from './enums.ts';

export interface Milestone {
  id: MilestoneId;
  revisionId: RevisionId;
  parentMilestoneId?: MilestoneId;  // parent phase grouping
  name: string;
  description: string;
  milestoneType: MilestoneType;
  status: MilestoneStatus;
  startDate?: Timestamp;   // bar left edge; if absent treated as point milestone
  targetDate: Timestamp;   // bar right edge / milestone date
  actualDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GatingEvent {
  id: GatingEventId;
  milestoneId: MilestoneId;
  name: string;
  description: string;
  isMet: boolean;
  createdAt: Timestamp;
}

export interface TimelineEntry {
  id: string;
  revisionId: RevisionId;
  label: string;
  startDate: Timestamp;
  endDate: Timestamp;
  milestoneId?: MilestoneId;
  color?: string;
}

export interface Dependency {
  id: DependencyId;
  revisionId: RevisionId;
  fromMilestoneId: MilestoneId;
  toMilestoneId: MilestoneId;
  lagDays?: number;        // finish-to-start lag in days (default 0)
  description: string;
  createdAt: Timestamp;
}
