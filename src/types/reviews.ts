import type { ReviewId, SignOffId, RevisionId, RequirementId, Timestamp } from './ids.ts';
import type { ReviewType, ReviewStatus, ReviewDecision } from './enums.ts';

export interface DesignReview {
  id: ReviewId;
  revisionId: RevisionId;
  title: string;
  description: string;
  reviewType: ReviewType;
  requirementIds: RequirementId[];
  scheduledDate: Timestamp;
  status: ReviewStatus;
  createdAt: Timestamp;
}

export interface SignOff {
  id: SignOffId;
  reviewId: ReviewId;
  requirementId: RequirementId;
  reviewer: string;
  role: string;
  decision: ReviewDecision;
  comments: string;
  signedAt: Timestamp;
}
