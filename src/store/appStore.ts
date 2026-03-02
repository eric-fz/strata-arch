import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { now } from '../lib/date.ts';
import { idbPutMany, idbClearAll } from '../lib/idb.ts';
import { CATEGORY_META } from '../types/display-meta.ts';
import type {
  FamilyId, VariantId, RevisionId, RequirementId,
  ArchElementId, ArchInterfaceId, ArtifactId,
  TestPlanId, TestCaseId, TestRunId, TestResultId, TestEvidenceId,
  BomItemId, SupplierId, MilestoneId, GatingEventId, DependencyId,
  ChangeProposalId, BaselineId, ReleaseId, FieldedUnitId,
  MaintenanceEventId, IncidentId, ReviewId, SignOffId,
  RequirementStatus,
} from '../types/index.ts';
import type { RobotFamily, RobotVariant, Revision } from '../types/core.ts';
import type { Requirement, RequirementLink } from '../types/requirements.ts';
import type { ArchitectureElement, ArchitectureInterface } from '../types/architecture.ts';
import type { Artifact } from '../types/artifacts.ts';
import type { TestPlan, TestCase, TestRun, TestResult, TestEvidence } from '../types/verification.ts';
import type { BomItem, Supplier } from '../types/bom.ts';
import type { Milestone, GatingEvent, Dependency } from '../types/planning.ts';
import type { ChangeProposal, Baseline } from '../types/change-control.ts';
import type { Release, FieldedUnit, MaintenanceEvent, Incident } from '../types/releases.ts';
import type { RequirementArchitectureLink, RequirementArtifactLink, RequirementTestCaseLink, ArchitectureArtifactLink } from '../types/links.ts';
import type { DesignReview, SignOff } from '../types/reviews.ts';
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
import { idbGetAll } from '../lib/idb.ts';

// ─── Status transitions ───────────────────────────────────
const STATUS_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  draft: ['in_review'],
  in_review: ['approved', 'draft'],
  approved: ['baselined', 'deprecated'],
  baselined: ['deprecated'],
  deprecated: [],
};

// ─── State shape ──────────────────────────────────────────
interface AppState {
  // Hydration
  _hydrated: boolean;

  // Context
  activeFamilyId: FamilyId | null;
  activeVariantId: VariantId | null;
  activeRevisionId: RevisionId | null;

  // Data
  families: RobotFamily[];
  variants: RobotVariant[];
  revisions: Revision[];
  requirements: Requirement[];
  requirementLinks: RequirementLink[];
  architectureElements: ArchitectureElement[];
  architectureInterfaces: ArchitectureInterface[];
  artifacts: Artifact[];
  testPlans: TestPlan[];
  testCases: TestCase[];
  testRuns: TestRun[];
  testResults: TestResult[];
  testEvidence: TestEvidence[];
  bomItems: BomItem[];
  suppliers: Supplier[];
  milestones: Milestone[];
  gatingEvents: GatingEvent[];
  dependencies: Dependency[];
  changeProposals: ChangeProposal[];
  baselines: Baseline[];
  releases: Release[];
  fieldedUnits: FieldedUnit[];
  maintenanceEvents: MaintenanceEvent[];
  incidents: Incident[];
  reviews: DesignReview[];
  signOffs: SignOff[];
  reqArchLinks: RequirementArchitectureLink[];
  reqArtifactLinks: RequirementArtifactLink[];
  reqTestCaseLinks: RequirementTestCaseLink[];
  archArtifactLinks: ArchitectureArtifactLink[];

  // UI (not persisted)
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toasts: Toast[];
}

// ─── Actions ──────────────────────────────────────────────
interface AppActions {
  // Hydration
  hydrate: () => Promise<void>;

  // Context
  setActiveFamily: (id: FamilyId | null) => void;
  setActiveVariant: (id: VariantId | null) => void;
  setActiveRevision: (id: RevisionId | null) => void;

  // Families
  createFamily: (data: Omit<RobotFamily, 'id' | 'createdAt' | 'updatedAt'>) => RobotFamily;
  updateFamily: (id: FamilyId, data: Partial<RobotFamily>) => void;
  deleteFamily: (id: FamilyId) => void;

  // Variants
  createVariant: (data: Omit<RobotVariant, 'id' | 'createdAt' | 'updatedAt'>) => RobotVariant;
  updateVariant: (id: VariantId, data: Partial<RobotVariant>) => void;
  deleteVariant: (id: VariantId) => void;

  // Revisions
  createRevision: (data: Omit<Revision, 'id' | 'createdAt'>) => Revision;
  deleteRevision: (id: RevisionId) => void;

  // Requirements
  createRequirement: (data: Omit<Requirement, 'id' | 'identifier' | 'version' | 'createdAt' | 'updatedAt'>) => Requirement;
  updateRequirement: (id: RequirementId, data: Partial<Requirement>) => void;
  deleteRequirement: (id: RequirementId) => void;
  canTransition: (currentStatus: RequirementStatus, newStatus: RequirementStatus) => boolean;
  transitionStatus: (id: RequirementId, newStatus: RequirementStatus) => boolean;

  // Requirement links
  createRequirementLink: (data: Omit<RequirementLink, 'id' | 'createdAt'>) => RequirementLink;
  deleteRequirementLink: (id: string) => void;

  // Architecture
  createArchElement: (data: Omit<ArchitectureElement, 'id' | 'createdAt' | 'updatedAt'>) => ArchitectureElement;
  updateArchElement: (id: ArchElementId, data: Partial<ArchitectureElement>) => void;
  deleteArchElement: (id: ArchElementId) => void;
  createArchInterface: (data: Omit<ArchitectureInterface, 'id' | 'createdAt'>) => ArchitectureInterface;
  deleteArchInterface: (id: ArchInterfaceId) => void;

  // Artifacts
  createArtifact: (data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => Artifact;
  updateArtifact: (id: ArtifactId, data: Partial<Artifact>) => void;
  deleteArtifact: (id: ArtifactId) => void;

  // Verification
  createTestPlan: (data: Omit<TestPlan, 'id' | 'createdAt' | 'updatedAt'>) => TestPlan;
  updateTestPlan: (id: TestPlanId, data: Partial<TestPlan>) => void;
  deleteTestPlan: (id: TestPlanId) => void;
  createTestCase: (data: Omit<TestCase, 'id' | 'createdAt'>) => TestCase;
  updateTestCase: (id: TestCaseId, data: Partial<TestCase>) => void;
  deleteTestCase: (id: TestCaseId) => void;
  createTestRun: (data: Omit<TestRun, 'id'>) => TestRun;
  updateTestRun: (id: TestRunId, data: Partial<TestRun>) => void;
  createTestResult: (data: Omit<TestResult, 'id'>) => TestResult;
  createTestEvidence: (data: Omit<TestEvidence, 'id' | 'createdAt'>) => TestEvidence;

  // BOM
  createBomItem: (data: Omit<BomItem, 'id' | 'createdAt' | 'updatedAt'>) => BomItem;
  updateBomItem: (id: BomItemId, data: Partial<BomItem>) => void;
  deleteBomItem: (id: BomItemId) => void;
  createSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: SupplierId, data: Partial<Supplier>) => void;
  deleteSupplier: (id: SupplierId) => void;

  // Planning
  createMilestone: (data: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => Milestone;
  updateMilestone: (id: MilestoneId, data: Partial<Milestone>) => void;
  deleteMilestone: (id: MilestoneId) => void;
  createGatingEvent: (data: Omit<GatingEvent, 'id' | 'createdAt'>) => GatingEvent;
  updateGatingEvent: (id: GatingEventId, data: Partial<GatingEvent>) => void;
  createDependency: (data: Omit<Dependency, 'id' | 'createdAt'>) => Dependency;
  deleteDependency: (id: DependencyId) => void;

  // Change Control
  createChangeProposal: (data: Omit<ChangeProposal, 'id' | 'createdAt' | 'updatedAt'>) => ChangeProposal;
  updateChangeProposal: (id: ChangeProposalId, data: Partial<ChangeProposal>) => void;
  deleteChangeProposal: (id: ChangeProposalId) => void;
  createBaseline: (data: Omit<Baseline, 'id' | 'createdAt'>) => Baseline;

  // Releases
  createRelease: (data: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>) => Release;
  updateRelease: (id: ReleaseId, data: Partial<Release>) => void;
  deleteRelease: (id: ReleaseId) => void;
  createFieldedUnit: (data: Omit<FieldedUnit, 'id' | 'createdAt' | 'updatedAt'>) => FieldedUnit;
  updateFieldedUnit: (id: FieldedUnitId, data: Partial<FieldedUnit>) => void;
  createMaintenanceEvent: (data: Omit<MaintenanceEvent, 'id' | 'createdAt'>) => MaintenanceEvent;
  createIncident: (data: Omit<Incident, 'id' | 'createdAt'>) => Incident;
  updateIncident: (id: IncidentId, data: Partial<Incident>) => void;

  // Reviews
  createReview: (data: Omit<DesignReview, 'id' | 'createdAt'>) => DesignReview;
  updateReview: (id: ReviewId, data: Partial<DesignReview>) => void;
  deleteReview: (id: ReviewId) => void;
  addSignOff: (data: Omit<SignOff, 'id' | 'signedAt'>) => SignOff;

  // Cross-reference links
  addReqArchLink: (requirementId: RequirementId, elementId: ArchElementId) => void;
  removeReqArchLink: (id: string) => void;
  addReqArtifactLink: (requirementId: RequirementId, artifactId: ArtifactId) => void;
  removeReqArtifactLink: (id: string) => void;
  addReqTestCaseLink: (requirementId: RequirementId, testCaseId: TestCaseId) => void;
  removeReqTestCaseLink: (id: string) => void;

  // UI
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Data management
  loadSeedData: (data: SeedDataPayload) => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

export type AppStore = AppState & AppActions;

export interface SeedDataPayload {
  families: RobotFamily[];
  variants: RobotVariant[];
  revisions: Revision[];
  requirements: Requirement[];
  requirementLinks: RequirementLink[];
  architectureElements: ArchitectureElement[];
  architectureInterfaces: ArchitectureInterface[];
  artifacts: Artifact[];
  testPlans: TestPlan[];
  testCases: TestCase[];
  testRuns: TestRun[];
  testResults: TestResult[];
  testEvidence: TestEvidence[];
  bomItems: BomItem[];
  suppliers: Supplier[];
  milestones: Milestone[];
  gatingEvents: GatingEvent[];
  dependencies: Dependency[];
  changeProposals: ChangeProposal[];
  baselines: Baseline[];
  releases: Release[];
  fieldedUnits: FieldedUnit[];
  maintenanceEvents: MaintenanceEvent[];
  incidents: Incident[];
  reviews: DesignReview[];
  signOffs: SignOff[];
  reqArchLinks: RequirementArchitectureLink[];
  reqArtifactLinks: RequirementArtifactLink[];
  reqTestCaseLinks: RequirementTestCaseLink[];
  archArtifactLinks: ArchitectureArtifactLink[];
}

const emptyArrays: Omit<AppState, '_hydrated' | 'activeFamilyId' | 'activeVariantId' | 'activeRevisionId' | 'sidebarCollapsed' | 'commandPaletteOpen' | 'toasts'> = {
  families: [],
  variants: [],
  revisions: [],
  requirements: [],
  requirementLinks: [],
  architectureElements: [],
  architectureInterfaces: [],
  artifacts: [],
  testPlans: [],
  testCases: [],
  testRuns: [],
  testResults: [],
  testEvidence: [],
  bomItems: [],
  suppliers: [],
  milestones: [],
  gatingEvents: [],
  dependencies: [],
  changeProposals: [],
  baselines: [],
  releases: [],
  fieldedUnits: [],
  maintenanceEvents: [],
  incidents: [],
  reviews: [],
  signOffs: [],
  reqArchLinks: [],
  reqArtifactLinks: [],
  reqTestCaseLinks: [],
  archArtifactLinks: [],
};

let toastSeq = 0;

// Generate structured identifier
function generateIdentifier(category: Requirement['category'], existing: Requirement[], revisionId: string): string {
  const prefix = CATEGORY_META[category].prefix;
  const revReqs = existing.filter(r => r.revisionId === revisionId && r.category === category);
  const maxNum = revReqs.reduce((max, r) => {
    const match = r.identifier.match(/-(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
}

// ─── Debounced IDB write ──────────────────────────────────
let writeTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleIdbWrite(state: AppState) {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const pairs: [string, Array<{ id: string }>][] = [
      ['families', state.families],
      ['variants', state.variants],
      ['revisions', state.revisions],
      ['requirements', state.requirements],
      ['links', state.requirementLinks],
      ['architectureElements', state.architectureElements],
      ['architectureInterfaces', state.architectureInterfaces],
      ['artifacts', state.artifacts],
      ['testPlans', state.testPlans],
      ['testCases', state.testCases],
      ['testRuns', state.testRuns],
      ['testResults', state.testResults],
      ['testEvidence', state.testEvidence],
      ['bomItems', state.bomItems],
      ['suppliers', state.suppliers],
      ['milestones', state.milestones],
      ['gatingEvents', state.gatingEvents],
      ['dependencies', state.dependencies],
      ['changeProposals', state.changeProposals],
      ['baselines', state.baselines],
      ['releases', state.releases],
      ['fieldedUnits', state.fieldedUnits],
      ['maintenanceEvents', state.maintenanceEvents],
      ['incidents', state.incidents],
      ['reviews', state.reviews],
      ['signOffs', state.signOffs],
      ['reqArchLinks', state.reqArchLinks],
      ['reqArtifactLinks', state.reqArtifactLinks],
      ['reqTestCaseLinks', state.reqTestCaseLinks],
      ['archArtifactLinks', state.archArtifactLinks],
    ];
    for (const [store, items] of pairs) {
      idbPutMany(store as Parameters<typeof idbPutMany>[0], items).catch(() => {});
    }
  }, 300);
}

export const useAppStore = create<AppStore>()(
  immer((set, get) => {

    function persist() {
      scheduleIdbWrite(get());
    }

    return {
      // Initial state
      _hydrated: false,
      activeFamilyId: null,
      activeVariantId: null,
      activeRevisionId: null,
      ...emptyArrays,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      toasts: [],

      // ─── Hydration ────────────────────────────────────
      hydrate: async () => {
        const storeMappings: Array<{ stateKey: string; storeName: Parameters<typeof idbGetAll>[0] }> = [
          { stateKey: 'families', storeName: 'families' },
          { stateKey: 'variants', storeName: 'variants' },
          { stateKey: 'revisions', storeName: 'revisions' },
          { stateKey: 'requirements', storeName: 'requirements' },
          { stateKey: 'requirementLinks', storeName: 'links' },
          { stateKey: 'architectureElements', storeName: 'architectureElements' },
          { stateKey: 'architectureInterfaces', storeName: 'architectureInterfaces' },
          { stateKey: 'artifacts', storeName: 'artifacts' },
          { stateKey: 'testPlans', storeName: 'testPlans' },
          { stateKey: 'testCases', storeName: 'testCases' },
          { stateKey: 'testRuns', storeName: 'testRuns' },
          { stateKey: 'testResults', storeName: 'testResults' },
          { stateKey: 'testEvidence', storeName: 'testEvidence' },
          { stateKey: 'bomItems', storeName: 'bomItems' },
          { stateKey: 'suppliers', storeName: 'suppliers' },
          { stateKey: 'milestones', storeName: 'milestones' },
          { stateKey: 'gatingEvents', storeName: 'gatingEvents' },
          { stateKey: 'dependencies', storeName: 'dependencies' },
          { stateKey: 'changeProposals', storeName: 'changeProposals' },
          { stateKey: 'baselines', storeName: 'baselines' },
          { stateKey: 'releases', storeName: 'releases' },
          { stateKey: 'fieldedUnits', storeName: 'fieldedUnits' },
          { stateKey: 'maintenanceEvents', storeName: 'maintenanceEvents' },
          { stateKey: 'incidents', storeName: 'incidents' },
          { stateKey: 'reviews', storeName: 'reviews' },
          { stateKey: 'signOffs', storeName: 'signOffs' },
          { stateKey: 'reqArchLinks', storeName: 'reqArchLinks' },
          { stateKey: 'reqArtifactLinks', storeName: 'reqArtifactLinks' },
          { stateKey: 'reqTestCaseLinks', storeName: 'reqTestCaseLinks' },
          { stateKey: 'archArtifactLinks', storeName: 'archArtifactLinks' },
        ];
        const partial: Record<string, unknown[]> = {};
        for (const m of storeMappings) {
          partial[m.stateKey] = await idbGetAll(m.storeName);
        }
        set((s) => {
          Object.assign(s, partial);
          s._hydrated = true;
          if (s.families.length > 0 && !s.activeFamilyId) {
            s.activeFamilyId = s.families[0].id;
            const v = s.variants.find(v => v.familyId === s.activeFamilyId);
            if (v) {
              s.activeVariantId = v.id;
              const r = s.revisions.find(r => r.variantId === v.id && r.isHead);
              if (r) s.activeRevisionId = r.id;
            }
          }
        });
      },

      // ─── Context ──────────────────────────────────────
      setActiveFamily: (id) => set((s) => {
        s.activeFamilyId = id;
        s.activeVariantId = null;
        s.activeRevisionId = null;
        if (id) {
          const v = s.variants.find(v => v.familyId === id);
          if (v) {
            s.activeVariantId = v.id;
            const r = s.revisions.find(r => r.variantId === v.id && r.isHead);
            if (r) s.activeRevisionId = r.id;
          }
        }
      }),
      setActiveVariant: (id) => set((s) => {
        s.activeVariantId = id;
        s.activeRevisionId = null;
        if (id) {
          const r = s.revisions.find(r => r.variantId === id && r.isHead);
          if (r) s.activeRevisionId = r.id;
        }
      }),
      setActiveRevision: (id) => set((s) => { s.activeRevisionId = id; }),

      // ─── Families ─────────────────────────────────────
      createFamily: (data) => {
        const f: RobotFamily = { ...data, id: nanoid() as FamilyId, createdAt: now(), updatedAt: now() };
        set((s) => { s.families.push(f); });
        persist();
        return f;
      },
      updateFamily: (id, data) => {
        set((s) => {
          const f = s.families.find(f => f.id === id);
          if (f) Object.assign(f, data, { updatedAt: now() });
        });
        persist();
      },
      deleteFamily: (id) => {
        set((s) => {
          s.families = s.families.filter(f => f.id !== id);
          const vids = s.variants.filter(v => v.familyId === id).map(v => v.id);
          s.variants = s.variants.filter(v => v.familyId !== id);
          s.revisions = s.revisions.filter(r => !vids.includes(r.variantId));
          if (s.activeFamilyId === id) {
            s.activeFamilyId = s.families[0]?.id ?? null;
            s.activeVariantId = null;
            s.activeRevisionId = null;
          }
        });
        persist();
      },

      // ─── Variants ─────────────────────────────────────
      createVariant: (data) => {
        const v: RobotVariant = { ...data, id: nanoid() as VariantId, createdAt: now(), updatedAt: now() };
        set((s) => { s.variants.push(v); });
        persist();
        return v;
      },
      updateVariant: (id, data) => {
        set((s) => {
          const v = s.variants.find(v => v.id === id);
          if (v) Object.assign(v, data, { updatedAt: now() });
        });
        persist();
      },
      deleteVariant: (id) => {
        set((s) => {
          s.variants = s.variants.filter(v => v.id !== id);
          s.revisions = s.revisions.filter(r => r.variantId !== id);
          if (s.activeVariantId === id) {
            s.activeVariantId = null;
            s.activeRevisionId = null;
          }
        });
        persist();
      },

      // ─── Revisions ────────────────────────────────────
      createRevision: (data) => {
        const r: Revision = { ...data, id: nanoid() as RevisionId, createdAt: now() };
        set((s) => {
          // Un-head siblings
          for (const sib of s.revisions) {
            if (sib.variantId === data.variantId) sib.isHead = false;
          }
          s.revisions.push(r);
        });
        persist();
        return r;
      },
      deleteRevision: (id) => {
        set((s) => {
          s.revisions = s.revisions.filter(r => r.id !== id);
          if (s.activeRevisionId === id) s.activeRevisionId = null;
        });
        persist();
      },

      // ─── Requirements ─────────────────────────────────
      createRequirement: (data) => {
        const state = get();
        const req: Requirement = {
          ...data,
          id: nanoid() as RequirementId,
          identifier: generateIdentifier(data.category, state.requirements, data.revisionId),
          version: 1,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => { s.requirements.push(req); });
        persist();
        return req;
      },
      updateRequirement: (id, data) => {
        set((s) => {
          const r = s.requirements.find(r => r.id === id);
          if (r) Object.assign(r, data, { updatedAt: now() });
        });
        persist();
      },
      deleteRequirement: (id) => {
        set((s) => {
          s.requirements = s.requirements.filter(r => r.id !== id);
          s.requirementLinks = s.requirementLinks.filter(l => l.sourceId !== id && l.targetId !== id);
          s.reqArchLinks = s.reqArchLinks.filter(l => l.requirementId !== id);
          s.reqArtifactLinks = s.reqArtifactLinks.filter(l => l.requirementId !== id);
          s.reqTestCaseLinks = s.reqTestCaseLinks.filter(l => l.requirementId !== id);
        });
        persist();
      },
      canTransition: (current, next) => STATUS_TRANSITIONS[current]?.includes(next) ?? false,
      transitionStatus: (id, newStatus) => {
        const req = get().requirements.find(r => r.id === id);
        if (!req || !STATUS_TRANSITIONS[req.status]?.includes(newStatus)) return false;
        set((s) => {
          const r = s.requirements.find(r => r.id === id);
          if (r) { r.status = newStatus; r.updatedAt = now(); }
        });
        persist();
        return true;
      },

      // ─── Requirement Links ────────────────────────────
      createRequirementLink: (data) => {
        const link: RequirementLink = { ...data, id: nanoid(), createdAt: now() };
        set((s) => { s.requirementLinks.push(link); });
        persist();
        return link;
      },
      deleteRequirementLink: (id) => {
        set((s) => { s.requirementLinks = s.requirementLinks.filter(l => l.id !== id); });
        persist();
      },

      // ─── Architecture ─────────────────────────────────
      createArchElement: (data) => {
        const e: ArchitectureElement = { ...data, id: nanoid() as ArchElementId, createdAt: now(), updatedAt: now() };
        set((s) => { s.architectureElements.push(e); });
        persist();
        return e;
      },
      updateArchElement: (id, data) => {
        set((s) => {
          const e = s.architectureElements.find(e => e.id === id);
          if (e) Object.assign(e, data, { updatedAt: now() });
        });
        persist();
      },
      deleteArchElement: (id) => {
        set((s) => {
          s.architectureElements = s.architectureElements.filter(e => e.id !== id);
          s.architectureInterfaces = s.architectureInterfaces.filter(i => i.sourceElementId !== id && i.targetElementId !== id);
          s.reqArchLinks = s.reqArchLinks.filter(l => l.elementId !== id);
        });
        persist();
      },
      createArchInterface: (data) => {
        const i: ArchitectureInterface = { ...data, id: nanoid() as ArchInterfaceId, createdAt: now() };
        set((s) => { s.architectureInterfaces.push(i); });
        persist();
        return i;
      },
      deleteArchInterface: (id) => {
        set((s) => { s.architectureInterfaces = s.architectureInterfaces.filter(i => i.id !== id); });
        persist();
      },

      // ─── Artifacts ────────────────────────────────────
      createArtifact: (data) => {
        const a: Artifact = { ...data, id: nanoid() as ArtifactId, createdAt: now(), updatedAt: now() };
        set((s) => { s.artifacts.push(a); });
        persist();
        return a;
      },
      updateArtifact: (id, data) => {
        set((s) => {
          const a = s.artifacts.find(a => a.id === id);
          if (a) Object.assign(a, data, { updatedAt: now() });
        });
        persist();
      },
      deleteArtifact: (id) => {
        set((s) => {
          s.artifacts = s.artifacts.filter(a => a.id !== id);
          s.reqArtifactLinks = s.reqArtifactLinks.filter(l => l.artifactId !== id);
          s.archArtifactLinks = s.archArtifactLinks.filter(l => l.artifactId !== id);
        });
        persist();
      },

      // ─── Verification ────────────────────────────────
      createTestPlan: (data) => {
        const p: TestPlan = { ...data, id: nanoid() as TestPlanId, createdAt: now(), updatedAt: now() };
        set((s) => { s.testPlans.push(p); });
        persist();
        return p;
      },
      updateTestPlan: (id, data) => {
        set((s) => {
          const p = s.testPlans.find(p => p.id === id);
          if (p) Object.assign(p, data, { updatedAt: now() });
        });
        persist();
      },
      deleteTestPlan: (id) => {
        set((s) => {
          s.testPlans = s.testPlans.filter(p => p.id !== id);
          const cids = s.testCases.filter(c => c.testPlanId === id).map(c => c.id);
          s.testCases = s.testCases.filter(c => c.testPlanId !== id);
          s.reqTestCaseLinks = s.reqTestCaseLinks.filter(l => !cids.includes(l.testCaseId));
        });
        persist();
      },
      createTestCase: (data) => {
        const c: TestCase = { ...data, id: nanoid() as TestCaseId, createdAt: now() };
        set((s) => { s.testCases.push(c); });
        persist();
        return c;
      },
      updateTestCase: (id, data) => {
        set((s) => {
          const c = s.testCases.find(c => c.id === id);
          if (c) Object.assign(c, data);
        });
        persist();
      },
      deleteTestCase: (id) => {
        set((s) => {
          s.testCases = s.testCases.filter(c => c.id !== id);
          s.reqTestCaseLinks = s.reqTestCaseLinks.filter(l => l.testCaseId !== id);
        });
        persist();
      },
      createTestRun: (data) => {
        const r: TestRun = { ...data, id: nanoid() as TestRunId };
        set((s) => { s.testRuns.push(r); });
        persist();
        return r;
      },
      updateTestRun: (id, data) => {
        set((s) => {
          const r = s.testRuns.find(r => r.id === id);
          if (r) Object.assign(r, data);
        });
        persist();
      },
      createTestResult: (data) => {
        const r: TestResult = { ...data, id: nanoid() as TestResultId };
        set((s) => { s.testResults.push(r); });
        persist();
        return r;
      },
      createTestEvidence: (data) => {
        const e: TestEvidence = { ...data, id: nanoid() as TestEvidenceId, createdAt: now() };
        set((s) => { s.testEvidence.push(e); });
        persist();
        return e;
      },

      // ─── BOM ──────────────────────────────────────────
      createBomItem: (data) => {
        const b: BomItem = { ...data, id: nanoid() as BomItemId, createdAt: now(), updatedAt: now() };
        set((s) => { s.bomItems.push(b); });
        persist();
        return b;
      },
      updateBomItem: (id, data) => {
        set((s) => {
          const b = s.bomItems.find(b => b.id === id);
          if (b) Object.assign(b, data, { updatedAt: now() });
        });
        persist();
      },
      deleteBomItem: (id) => {
        set((s) => {
          // Also delete children
          const deleteIds = new Set<string>([id]);
          let changed = true;
          while (changed) {
            changed = false;
            for (const b of s.bomItems) {
              if (b.parentItemId && deleteIds.has(b.parentItemId) && !deleteIds.has(b.id)) {
                deleteIds.add(b.id);
                changed = true;
              }
            }
          }
          s.bomItems = s.bomItems.filter(b => !deleteIds.has(b.id));
        });
        persist();
      },
      createSupplier: (data) => {
        const sup: Supplier = { ...data, id: nanoid() as SupplierId, createdAt: now() };
        set((s) => { s.suppliers.push(sup); });
        persist();
        return sup;
      },
      updateSupplier: (id, data) => {
        set((s) => {
          const sup = s.suppliers.find(s => s.id === id);
          if (sup) Object.assign(sup, data);
        });
        persist();
      },
      deleteSupplier: (id) => {
        set((s) => { s.suppliers = s.suppliers.filter(s => s.id !== id); });
        persist();
      },

      // ─── Planning ─────────────────────────────────────
      createMilestone: (data) => {
        const m: Milestone = { ...data, id: nanoid() as MilestoneId, createdAt: now(), updatedAt: now() };
        set((s) => { s.milestones.push(m); });
        persist();
        return m;
      },
      updateMilestone: (id, data) => {
        set((s) => {
          const m = s.milestones.find(m => m.id === id);
          if (m) Object.assign(m, data, { updatedAt: now() });
        });
        persist();
      },
      deleteMilestone: (id) => {
        set((s) => {
          s.milestones = s.milestones.filter(m => m.id !== id);
          s.gatingEvents = s.gatingEvents.filter(g => g.milestoneId !== id);
          s.dependencies = s.dependencies.filter(d => d.fromMilestoneId !== id && d.toMilestoneId !== id);
        });
        persist();
      },
      createGatingEvent: (data) => {
        const g: GatingEvent = { ...data, id: nanoid() as GatingEventId, createdAt: now() };
        set((s) => { s.gatingEvents.push(g); });
        persist();
        return g;
      },
      updateGatingEvent: (id, data) => {
        set((s) => {
          const g = s.gatingEvents.find(g => g.id === id);
          if (g) Object.assign(g, data);
        });
        persist();
      },
      createDependency: (data) => {
        const d: Dependency = { ...data, id: nanoid() as DependencyId, createdAt: now() };
        set((s) => { s.dependencies.push(d); });
        persist();
        return d;
      },
      deleteDependency: (id) => {
        set((s) => { s.dependencies = s.dependencies.filter(d => d.id !== id); });
        persist();
      },

      // ─── Change Control ───────────────────────────────
      createChangeProposal: (data) => {
        const cp: ChangeProposal = { ...data, id: nanoid() as ChangeProposalId, createdAt: now(), updatedAt: now() };
        set((s) => { s.changeProposals.push(cp); });
        persist();
        return cp;
      },
      updateChangeProposal: (id, data) => {
        set((s) => {
          const cp = s.changeProposals.find(c => c.id === id);
          if (cp) Object.assign(cp, data, { updatedAt: now() });
        });
        persist();
      },
      deleteChangeProposal: (id) => {
        set((s) => { s.changeProposals = s.changeProposals.filter(c => c.id !== id); });
        persist();
      },
      createBaseline: (data) => {
        const b: Baseline = { ...data, id: nanoid() as BaselineId, createdAt: now() };
        set((s) => { s.baselines.push(b); });
        persist();
        return b;
      },

      // ─── Releases ─────────────────────────────────────
      createRelease: (data) => {
        const r: Release = { ...data, id: nanoid() as ReleaseId, createdAt: now(), updatedAt: now() };
        set((s) => { s.releases.push(r); });
        persist();
        return r;
      },
      updateRelease: (id, data) => {
        set((s) => {
          const r = s.releases.find(r => r.id === id);
          if (r) Object.assign(r, data, { updatedAt: now() });
        });
        persist();
      },
      deleteRelease: (id) => {
        set((s) => { s.releases = s.releases.filter(r => r.id !== id); });
        persist();
      },
      createFieldedUnit: (data) => {
        const fu: FieldedUnit = { ...data, id: nanoid() as FieldedUnitId, createdAt: now(), updatedAt: now() };
        set((s) => { s.fieldedUnits.push(fu); });
        persist();
        return fu;
      },
      updateFieldedUnit: (id, data) => {
        set((s) => {
          const fu = s.fieldedUnits.find(f => f.id === id);
          if (fu) Object.assign(fu, data, { updatedAt: now() });
        });
        persist();
      },
      createMaintenanceEvent: (data) => {
        const me: MaintenanceEvent = { ...data, id: nanoid() as MaintenanceEventId, createdAt: now() };
        set((s) => { s.maintenanceEvents.push(me); });
        persist();
        return me;
      },
      createIncident: (data) => {
        const i: Incident = { ...data, id: nanoid() as IncidentId, createdAt: now() };
        set((s) => { s.incidents.push(i); });
        persist();
        return i;
      },
      updateIncident: (id, data) => {
        set((s) => {
          const i = s.incidents.find(i => i.id === id);
          if (i) Object.assign(i, data);
        });
        persist();
      },

      // ─── Reviews ──────────────────────────────────────
      createReview: (data) => {
        const r: DesignReview = { ...data, id: nanoid() as ReviewId, createdAt: now() };
        set((s) => { s.reviews.push(r); });
        persist();
        return r;
      },
      updateReview: (id, data) => {
        set((s) => {
          const r = s.reviews.find(r => r.id === id);
          if (r) Object.assign(r, data);
        });
        persist();
      },
      deleteReview: (id) => {
        set((s) => {
          s.reviews = s.reviews.filter(r => r.id !== id);
          s.signOffs = s.signOffs.filter(so => so.reviewId !== id);
        });
        persist();
      },
      addSignOff: (data) => {
        const so: SignOff = { ...data, id: nanoid() as SignOffId, signedAt: now() };
        set((s) => { s.signOffs.push(so); });
        persist();
        return so;
      },

      // ─── Cross-reference links ────────────────────────
      addReqArchLink: (requirementId, elementId) => {
        set((s) => { s.reqArchLinks.push({ id: nanoid(), requirementId, elementId, createdAt: now() }); });
        persist();
      },
      removeReqArchLink: (id) => {
        set((s) => { s.reqArchLinks = s.reqArchLinks.filter(l => l.id !== id); });
        persist();
      },
      addReqArtifactLink: (requirementId, artifactId) => {
        set((s) => { s.reqArtifactLinks.push({ id: nanoid(), requirementId, artifactId, createdAt: now() }); });
        persist();
      },
      removeReqArtifactLink: (id) => {
        set((s) => { s.reqArtifactLinks = s.reqArtifactLinks.filter(l => l.id !== id); });
        persist();
      },
      addReqTestCaseLink: (requirementId, testCaseId) => {
        set((s) => { s.reqTestCaseLinks.push({ id: nanoid(), requirementId, testCaseId, createdAt: now() }); });
        persist();
      },
      removeReqTestCaseLink: (id) => {
        set((s) => { s.reqTestCaseLinks = s.reqTestCaseLinks.filter(l => l.id !== id); });
        persist();
      },

      // ─── UI ───────────────────────────────────────────
      toggleSidebar: () => set((s) => { s.sidebarCollapsed = !s.sidebarCollapsed; }),
      setCommandPaletteOpen: (open) => set((s) => { s.commandPaletteOpen = open; }),
      addToast: (message, type = 'info') => {
        const id = `toast_${++toastSeq}`;
        set((s) => { s.toasts.push({ id, message, type }); });
        setTimeout(() => {
          set((s) => { s.toasts = s.toasts.filter(t => t.id !== id); });
        }, 4000);
      },
      removeToast: (id) => set((s) => { s.toasts = s.toasts.filter(t => t.id !== id); }),

      // ─── Data Management ──────────────────────────────
      loadSeedData: (data) => {
        set((s) => {
          Object.assign(s, data);
          s.activeFamilyId = data.families[0]?.id ?? null;
          const v = data.variants.find(v => v.familyId === s.activeFamilyId);
          s.activeVariantId = v?.id ?? null;
          const r = v ? data.revisions.find(r => r.variantId === v.id && r.isHead) : null;
          s.activeRevisionId = r?.id ?? null;
        });
        // Write all to IDB immediately
        const state = get();
        scheduleIdbWrite(state);
      },
      clearAllData: () => {
        set((s) => {
          Object.assign(s, emptyArrays);
          s.activeFamilyId = null;
          s.activeVariantId = null;
          s.activeRevisionId = null;
        });
        idbClearAll().catch(() => {});
      },
      exportData: () => {
        const s = get();
        const data: Record<string, unknown> = {};
        for (const key of Object.keys(emptyArrays)) {
          data[key] = (s as unknown as Record<string, unknown>)[key];
        }
        return JSON.stringify(data, null, 2);
      },
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set((s) => {
            for (const key of Object.keys(emptyArrays)) {
              if (Array.isArray(data[key])) {
                (s as unknown as Record<string, unknown>)[key] = data[key];
              }
            }
            s.activeFamilyId = s.families[0]?.id ?? null;
          });
          persist();
          return true;
        } catch {
          return false;
        }
      },
    };
  })
);
