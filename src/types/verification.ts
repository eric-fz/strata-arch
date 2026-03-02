import type {
  TestPlanId,
  TestCaseId,
  TestRunId,
  TestResultId,
  TestEvidenceId,
  RevisionId,
  RequirementId,
  Timestamp,
} from './ids.ts';
import type {
  TestStatus,
  TestResultOutcome,
  TestEvidenceType,
  VerificationMethod,
} from './enums.ts';

export interface TestPlan {
  id: TestPlanId;
  revisionId: RevisionId;
  name: string;
  description: string;
  status: TestStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TestCase {
  id: TestCaseId;
  testPlanId: TestPlanId;
  revisionId: RevisionId;
  requirementId: RequirementId;
  title: string;
  description: string;
  method: VerificationMethod;
  preconditions: string;
  steps: string;
  expectedResult: string;
  createdAt: Timestamp;
}

export interface TestRun {
  id: TestRunId;
  testPlanId: TestPlanId;
  revisionId: RevisionId;
  name: string;
  executor: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  status: TestStatus;
  notes: string;
}

export interface TestResult {
  id: TestResultId;
  testRunId: TestRunId;
  testCaseId: TestCaseId;
  outcome: TestResultOutcome;
  measuredValue?: number;
  notes: string;
  executedAt: Timestamp;
}

export interface TestEvidence {
  id: TestEvidenceId;
  testResultId: TestResultId;
  evidenceType: TestEvidenceType;
  name: string;
  description: string;
  url: string;
  createdAt: Timestamp;
}
