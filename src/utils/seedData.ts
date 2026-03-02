import type { SeedDataPayload } from '../store/appStore.ts';
import type { FamilyId, VariantId, RevisionId, RequirementId, ArchElementId, ArchInterfaceId, ArtifactId, TestPlanId, TestCaseId, TestRunId, TestResultId, BomItemId, SupplierId, MilestoneId, GatingEventId, ChangeProposalId, ReleaseId, FieldedUnitId, ReviewId, SignOffId } from '../types/ids.ts';

const past = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const future = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

// IDs
const fam1 = 'fam_atlas' as FamilyId;
const fam2 = 'fam_scout' as FamilyId;
const var1 = 'var_atlas_v3' as VariantId;
const var2 = 'var_scout_v2' as VariantId;
const rev1 = 'rev_atlas_v3_head' as RevisionId;
const rev2 = 'rev_scout_v2_head' as RevisionId;

// Requirement IDs
const rSys001 = 'req_sys_001' as RequirementId;
const rSys002 = 'req_sys_002' as RequirementId;
const rSys003 = 'req_sys_003' as RequirementId;
const rSys004 = 'req_sys_004' as RequirementId;
const rSaf001 = 'req_saf_001' as RequirementId;
const rSaf002 = 'req_saf_002' as RequirementId;
const rSaf003 = 'req_saf_003' as RequirementId;
const rPrf001 = 'req_prf_001' as RequirementId;
const rPrf002 = 'req_prf_002' as RequirementId;
const rPrf003 = 'req_prf_003' as RequirementId;
const rSub001 = 'req_sub_001' as RequirementId;
const rSub002 = 'req_sub_002' as RequirementId;
const rIfc001 = 'req_ifc_001' as RequirementId;
const rIfc002 = 'req_ifc_002' as RequirementId;
const rReg001 = 'req_reg_001' as RequirementId;
const rMfg001 = 'req_mfg_001' as RequirementId;

// Architecture IDs
const arch1 = 'arch_main_compute' as ArchElementId;
const arch2 = 'arch_actuator_ctrl' as ArchElementId;
const arch3 = 'arch_safety_plc' as ArchElementId;
const arch4 = 'arch_power_dist' as ArchElementId;
const arch5 = 'arch_perception' as ArchElementId;
const arch6 = 'arch_chassis' as ArchElementId;
const archI1 = 'archi_compute_actuator' as ArchInterfaceId;
const archI2 = 'archi_compute_safety' as ArchInterfaceId;
const archI3 = 'archi_power_actuator' as ArchInterfaceId;

// Verification IDs
const tp1 = 'tp_structural' as TestPlanId;
const tp2 = 'tp_safety' as TestPlanId;
const tc1 = 'tc_payload' as TestCaseId;
const tc2 = 'tc_estop' as TestCaseId;
const tc3 = 'tc_fos' as TestCaseId;
const tc4 = 'tc_contact_force' as TestCaseId;
const tr1 = 'tr_run1' as TestRunId;
const tres1 = 'tres_payload' as TestResultId;
const tres2 = 'tres_estop' as TestResultId;
const tres3 = 'tres_fos' as TestResultId;

// BOM IDs
const bom1 = 'bom_hip_motor' as BomItemId;
const bom2 = 'bom_harmonic' as BomItemId;
const bom3 = 'bom_battery' as BomItemId;
const bom4 = 'bom_compute_module' as BomItemId;
const bom5 = 'bom_frame_assy' as BomItemId;
const bom6 = 'bom_encoder' as BomItemId;
const sup1 = 'sup_teknic' as SupplierId;
const sup2 = 'sup_harmonic_drive' as SupplierId;
const sup3 = 'sup_nvidia' as SupplierId;

// Planning
const ms1 = 'ms_pdr' as MilestoneId;
const ms2 = 'ms_cdr' as MilestoneId;
const ms3 = 'ms_dvt' as MilestoneId;
const ms4 = 'ms_pvt' as MilestoneId;
const ge1 = 'ge_reqs_frozen' as GatingEventId;

// Change control
const cp1 = 'cp_mass_budget' as ChangeProposalId;

// Releases
const rel1 = 'rel_scout_v2_1' as ReleaseId;
const fu1 = 'fu_scout_001' as FieldedUnitId;

// Reviews
const rev_r1 = 'review_pdr1' as ReviewId;
const rev_r2 = 'review_pdr2' as ReviewId;
const so1 = 'so_01' as SignOffId;
const so2 = 'so_02' as SignOffId;
const so3 = 'so_03' as SignOffId;

export function createSeedData(): SeedDataPayload {
  return {
    families: [
      {
        id: fam1, name: 'Atlas', codeName: 'ATLAS',
        description: 'Bipedal humanoid research platform for warehouse logistics. 6-DOF arms and legs, integrated perception.',
        createdAt: past(180), updatedAt: past(2),
      },
      {
        id: fam2, name: 'Scout Mini', codeName: 'SCOUT',
        description: 'Compact 4-wheeled mobile robot for indoor inspection and delivery. Omnidirectional drive.',
        createdAt: past(400), updatedAt: past(15),
      },
    ],
    variants: [
      {
        id: var1, familyId: fam1, name: 'v3', description: 'Third generation with improved actuators and perception stack.',
        phase: 'beta', createdAt: past(120), updatedAt: past(2),
      },
      {
        id: var2, familyId: fam2, name: 'v2', description: 'Production variant with modular payload bay.',
        phase: 'production', createdAt: past(365), updatedAt: past(15),
      },
    ],
    revisions: [
      { id: rev1, variantId: var1, version: '0.9.0', description: 'Beta candidate revision', isHead: true, createdAt: past(30) },
      { id: rev2, variantId: var2, version: '1.2.0', description: 'Production release', isHead: true, createdAt: past(60) },
    ],
    requirements: [
      // System-level
      {
        id: rSys001, revisionId: rev1, identifier: 'SYS-001', title: 'Payload Capacity',
        description: 'The robot shall carry a payload of 5.0 kg minimum at the end-effector at any pose within the rated workspace.',
        rationale: 'Customer requirement for warehouse pick-and-place operations.',
        category: 'system', reqType: 'performance', status: 'approved', priority: 'critical',
        owner: 'M. Chen', nominalValue: 5.0, minValue: 5.0, unit: 'kg',
        verificationMethod: 'test', acceptanceCriteria: 'Robot holds 5 kg at full arm extension for 30 seconds.',
        applicableStandards: ['ISO 10218-1:2011'], version: 1, createdBy: 'M. Chen', createdAt: past(90), updatedAt: past(30),
      },
      {
        id: rSys002, revisionId: rev1, identifier: 'SYS-002', title: 'Static Safety Factor',
        description: 'All structural members shall maintain a minimum static safety factor of 2.5 against yield.',
        rationale: 'Standard engineering practice for robotic systems with dynamic loading.',
        category: 'system', reqType: 'performance', status: 'approved', priority: 'critical',
        owner: 'J. Park', minValue: 2.5, unit: '-',
        verificationMethod: 'analysis', acceptanceCriteria: 'FEA results show minimum FOS >= 2.5.',
        version: 1, createdBy: 'J. Park', createdAt: past(88), updatedAt: past(45),
      },
      {
        id: rSys003, revisionId: rev1, identifier: 'SYS-003', title: 'System Mass Budget',
        description: 'Total system mass shall not exceed 85 kg.',
        rationale: 'Mass budget driven by actuator sizing and floor load requirements.',
        category: 'system', reqType: 'physical', status: 'in_review', priority: 'high',
        owner: 'M. Chen', maxValue: 85, unit: 'kg',
        verificationMethod: 'inspection', acceptanceCriteria: 'Weigh complete robot. Result <= 85 kg.',
        version: 2, createdBy: 'M. Chen', createdAt: past(85), updatedAt: past(5),
      },
      {
        id: rSys004, revisionId: rev1, identifier: 'SYS-004', title: 'First Natural Frequency',
        description: 'Loaded structure first natural frequency shall exceed 20 Hz.',
        rationale: 'Control loop operates at 1 kHz. First structural mode must be above servo bandwidth.',
        category: 'system', reqType: 'performance', status: 'approved', priority: 'high',
        owner: 'J. Park', minValue: 20, unit: 'Hz',
        verificationMethod: 'analysis', acceptanceCriteria: 'FEA modal analysis shows first mode > 20 Hz.',
        version: 1, createdBy: 'J. Park', createdAt: past(80), updatedAt: past(60),
      },
      // Safety
      {
        id: rSaf001, revisionId: rev1, identifier: 'SAF-001', title: 'Emergency Stop Response Time',
        description: 'The robot shall reach a complete stop within 250 ms of E-stop activation.',
        rationale: 'Maximum allowable E-stop response per ISO 12100 risk assessment.',
        category: 'safety', reqType: 'safety', status: 'approved', priority: 'critical',
        owner: 'L. Johansson', maxValue: 250, unit: 'ms',
        verificationMethod: 'test', acceptanceCriteria: 'Trigger E-stop at max velocity. All trials < 250 ms.',
        applicableStandards: ['ISO 10218-1:2011', 'IEC 60204-1'], version: 1,
        createdBy: 'L. Johansson', createdAt: past(85), updatedAt: past(30),
      },
      {
        id: rSaf002, revisionId: rev1, identifier: 'SAF-002', title: 'Contact Force Limit',
        description: 'Contact force at TCP shall not exceed 150 N transient and 50 N quasi-static per ISO/TS 15066.',
        rationale: 'ISO/TS 15066 biomechanical force limits for hand/finger contact zone.',
        category: 'safety', reqType: 'safety', status: 'in_review', priority: 'critical',
        owner: 'L. Johansson', maxValue: 150, unit: 'N',
        verificationMethod: 'test', acceptanceCriteria: 'Instrumented contact test per ISO/TS 15066 Annex A.',
        applicableStandards: ['ISO/TS 15066:2016'], version: 1,
        createdBy: 'L. Johansson', createdAt: past(80), updatedAt: past(8),
      },
      {
        id: rSaf003, revisionId: rev1, identifier: 'SAF-003', title: 'Safety Function PLd',
        description: 'Emergency stop shall achieve Performance Level d, Category 3 per ISO 13849-1.',
        rationale: 'PLd Cat3 determined by risk graph analysis.',
        category: 'safety', reqType: 'safety', status: 'approved', priority: 'critical',
        owner: 'L. Johansson',
        verificationMethod: 'analysis', acceptanceCriteria: 'SISTEMA calculation showing PL >= d.',
        applicableStandards: ['ISO 13849-1:2015'], version: 1,
        createdBy: 'L. Johansson', createdAt: past(82), updatedAt: past(25),
      },
      // Performance
      {
        id: rPrf001, revisionId: rev1, identifier: 'PRF-001', title: 'Hip Joint Peak Torque',
        description: 'Hip actuator shall deliver 150 Nm peak torque for up to 2 seconds.',
        rationale: 'Derived from gait dynamics simulation.',
        category: 'performance', reqType: 'performance', status: 'approved', priority: 'critical',
        owner: 'A. Nakamura', nominalValue: 150, minValue: 150, unit: 'Nm',
        verificationMethod: 'test', acceptanceCriteria: 'Dynamometer test: output >= 150 Nm sustained 2 sec.',
        version: 1, createdBy: 'A. Nakamura', createdAt: past(75), updatedAt: past(40),
      },
      {
        id: rPrf002, revisionId: rev1, identifier: 'PRF-002', title: 'Control Loop Frequency',
        description: 'Main servo loop shall execute at minimum 1 kHz with max jitter 50 us.',
        rationale: '1 kHz provides adequate bandwidth for force control and balance.',
        category: 'performance', reqType: 'performance', status: 'approved', priority: 'critical',
        owner: 'S. Kim', minValue: 1000, unit: 'Hz',
        verificationMethod: 'test', acceptanceCriteria: 'Measure loop timing over 10,000 cycles. All within 950-1050 us.',
        version: 1, createdBy: 'S. Kim', createdAt: past(70), updatedAt: past(35),
      },
      {
        id: rPrf003, revisionId: rev1, identifier: 'PRF-003', title: 'Battery Runtime',
        description: 'Robot shall operate 4.0 hours continuous at 50% duty cycle.',
        rationale: 'Covers a full warehouse shift.',
        category: 'performance', reqType: 'performance', status: 'in_review', priority: 'high',
        owner: 'R. Gupta', minValue: 4.0, unit: 'hours',
        verificationMethod: 'test', acceptanceCriteria: 'Run standardized duty cycle. Runtime >= 4.0 hours.',
        version: 1, createdBy: 'R. Gupta', createdAt: past(65), updatedAt: past(12),
      },
      // Subsystem
      {
        id: rSub001, revisionId: rev1, identifier: 'SUB-001', title: 'Gearbox Efficiency',
        description: 'Gearbox efficiency shall exceed 85% at rated speed and 50% rated torque.',
        rationale: 'Low efficiency wastes battery energy and generates excess heat.',
        category: 'subsystem', reqType: 'performance', status: 'in_review', priority: 'medium',
        owner: 'A. Nakamura', minValue: 85, unit: '%',
        verificationMethod: 'test', acceptanceCriteria: 'Back-to-back test at rated conditions shows efficiency > 85%.',
        version: 1, createdBy: 'A. Nakamura', createdAt: past(70), updatedAt: past(10),
      },
      {
        id: rSub002, revisionId: rev1, identifier: 'SUB-002', title: 'Joint Encoder Resolution',
        description: 'Each joint encoder shall have minimum 19-bit resolution (524,288 counts/rev).',
        rationale: '19-bit resolution provides 0.00069 deg angular resolution.',
        category: 'subsystem', reqType: 'performance', status: 'approved', priority: 'high',
        owner: 'S. Kim', minValue: 19, unit: 'bits',
        verificationMethod: 'inspection', acceptanceCriteria: 'Verify encoder spec from vendor datasheet.',
        version: 1, createdBy: 'S. Kim', createdAt: past(65), updatedAt: past(50),
      },
      // Interface
      {
        id: rIfc001, revisionId: rev1, identifier: 'IFC-001', title: 'Main Bus Voltage',
        description: 'Main power bus shall operate at 48V DC nominal with +/-5% regulation.',
        rationale: '48V is below SELV limit, maximizes power transfer efficiency.',
        category: 'interface', reqType: 'interface', status: 'baselined', priority: 'critical',
        owner: 'R. Gupta', nominalValue: 48, unit: 'V DC',
        verificationMethod: 'test', acceptanceCriteria: 'Measure bus voltage under no-load and full-load. 45.6V to 50.4V.',
        version: 1, createdBy: 'R. Gupta', createdAt: past(90), updatedAt: past(60),
      },
      {
        id: rIfc002, revisionId: rev1, identifier: 'IFC-002', title: 'IMU Update Rate',
        description: 'IMU shall provide orientation data at minimum 400 Hz.',
        rationale: 'Balance controller requires high-rate orientation feedback.',
        category: 'interface', reqType: 'performance', status: 'approved', priority: 'high',
        owner: 'S. Kim', minValue: 400, unit: 'Hz',
        verificationMethod: 'test', acceptanceCriteria: 'Log IMU timestamps over 10 sec. Avg >= 400 Hz.',
        version: 1, createdBy: 'S. Kim', createdAt: past(62), updatedAt: past(45),
      },
      // Regulatory
      {
        id: rReg001, revisionId: rev1, identifier: 'REG-001', title: 'CE Machinery Directive',
        description: 'Robot shall comply with EU Machinery Directive 2006/42/EC.',
        rationale: 'Legal requirement for EU market.',
        category: 'regulatory', reqType: 'operational', status: 'draft', priority: 'critical',
        owner: 'L. Johansson',
        verificationMethod: 'inspection', acceptanceCriteria: 'Complete technical file per Annex VII.',
        applicableStandards: ['EU Machinery Directive 2006/42/EC', 'ISO 12100:2010'], version: 1,
        createdBy: 'L. Johansson', createdAt: past(90), updatedAt: past(15),
      },
      // Manufacturing
      {
        id: rMfg001, revisionId: rev1, identifier: 'MFG-001', title: 'IP54 Ingress Protection',
        description: 'Robot shall achieve IP54 rating per IEC 60529.',
        rationale: 'Warehouse environments have dust and water splashes.',
        category: 'manufacturing', reqType: 'physical', status: 'in_review', priority: 'high',
        owner: 'M. Chen',
        verificationMethod: 'test', acceptanceCriteria: 'IP54 test per IEC 60529.',
        applicableStandards: ['IEC 60529'], version: 1,
        createdBy: 'M. Chen', createdAt: past(55), updatedAt: past(8),
      },
    ],
    requirementLinks: [
      { id: 'link_01', sourceId: rSaf001, targetId: rPrf002, linkType: 'parent_child', description: 'E-stop response constrains control loop frequency', createdAt: past(80) },
      { id: 'link_02', sourceId: rSys001, targetId: rPrf001, linkType: 'derived_from', description: 'Payload capacity drives hip torque requirement', createdAt: past(75) },
      { id: 'link_03', sourceId: rPrf003, targetId: rSys003, linkType: 'conflicts_with', description: 'Battery capacity impacts system mass budget', createdAt: past(65) },
      { id: 'link_04', sourceId: rReg001, targetId: rSaf003, linkType: 'satisfies', description: 'CE compliance requires PLd safety functions', createdAt: past(82) },
      { id: 'link_05', sourceId: rIfc001, targetId: rSaf001, linkType: 'derived_from', description: '48V bus chosen to stay within SELV limits', createdAt: past(78) },
      { id: 'link_06', sourceId: rSub002, targetId: rPrf002, linkType: 'parent_child', description: 'Encoder resolution constrains control bandwidth', createdAt: past(60) },
    ],
    architectureElements: [
      {
        id: arch1, revisionId: rev1, name: 'Main Compute', description: 'NVIDIA Jetson AGX Orin - main planning and perception',
        domainType: 'compute', x: 300, y: 100, width: 160, height: 80,
        ports: [
          { id: 'p1', label: 'EtherCAT', side: 'bottom' },
          { id: 'p2', label: 'CAN', side: 'bottom' },
          { id: 'p3', label: 'Camera', side: 'left' },
        ],
        createdAt: past(60), updatedAt: past(10),
      },
      {
        id: arch2, revisionId: rev1, name: 'Actuator Controller', description: 'Real-time servo control for 12 joint actuators',
        domainType: 'electrical', x: 200, y: 280, width: 160, height: 80,
        ports: [
          { id: 'p1', label: 'EtherCAT', side: 'top' },
          { id: 'p2', label: 'Motor Out', side: 'bottom' },
          { id: 'p3', label: '48V In', side: 'left' },
        ],
        createdAt: past(58), updatedAt: past(10),
      },
      {
        id: arch3, revisionId: rev1, name: 'Safety PLC', description: 'Dual-channel safety controller for E-stop and safe motion',
        domainType: 'safety_interlock', x: 500, y: 280, width: 160, height: 80,
        ports: [
          { id: 'p1', label: 'SafetyBus', side: 'top' },
          { id: 'p2', label: 'E-Stop In', side: 'right' },
        ],
        createdAt: past(55), updatedAt: past(8),
      },
      {
        id: arch4, revisionId: rev1, name: 'Power Distribution', description: '48V bus with fusing, battery management',
        domainType: 'electrical', x: 50, y: 280, width: 140, height: 80,
        ports: [
          { id: 'p1', label: '48V Out', side: 'right' },
          { id: 'p2', label: 'Battery', side: 'bottom' },
        ],
        createdAt: past(60), updatedAt: past(10),
      },
      {
        id: arch5, revisionId: rev1, name: 'Perception Stack', description: 'Stereo cameras, LiDAR, depth processing pipeline',
        domainType: 'autonomy_dataflow', x: 100, y: 100, width: 140, height: 80,
        ports: [
          { id: 'p1', label: 'Data Out', side: 'right' },
        ],
        createdAt: past(50), updatedAt: past(5),
      },
      {
        id: arch6, revisionId: rev1, name: 'Chassis & Frame', description: 'Aluminium extrusion frame with CNC brackets',
        domainType: 'mechanical', x: 300, y: 420, width: 160, height: 80,
        ports: [
          { id: 'p1', label: 'Mount', side: 'top' },
        ],
        createdAt: past(70), updatedAt: past(20),
      },
    ],
    architectureInterfaces: [
      { id: archI1, revisionId: rev1, sourceElementId: arch1, sourcePortId: 'p1', targetElementId: arch2, targetPortId: 'p1', label: 'EtherCAT Bus', description: '100Mbps real-time fieldbus', createdAt: past(55) },
      { id: archI2, revisionId: rev1, sourceElementId: arch1, sourcePortId: 'p2', targetElementId: arch3, targetPortId: 'p1', label: 'CAN Safety', description: 'CAN bus for safety signaling', createdAt: past(55) },
      { id: archI3, revisionId: rev1, sourceElementId: arch4, sourcePortId: 'p1', targetElementId: arch2, targetPortId: 'p3', label: '48V Power', description: 'Main 48V power rail', createdAt: past(55) },
    ],
    artifacts: [
      {
        id: 'art_fea_report' as ArtifactId, revisionId: rev1, name: 'Structural FEA Report', description: 'ANSYS Mechanical static structural analysis',
        artifactType: 'analysis_report', status: 'released', version: 'Rev B',
        createdBy: 'J. Park', createdAt: past(45), updatedAt: past(30),
      },
      {
        id: 'art_hip_drawing' as ArtifactId, revisionId: rev1, name: 'Hip Assembly Drawing', description: 'Detail drawing of hip joint assembly',
        artifactType: 'drawing', status: 'released', version: 'Rev C',
        createdBy: 'M. Chen', createdAt: past(60), updatedAt: past(20),
      },
      {
        id: 'art_safety_manual' as ArtifactId, revisionId: rev1, name: 'Safety Integration Manual', description: 'Safety system design and integration guide',
        artifactType: 'manual', status: 'draft', version: 'Rev A',
        createdBy: 'L. Johansson', createdAt: past(30), updatedAt: past(5),
      },
    ],
    testPlans: [
      { id: tp1, revisionId: rev1, name: 'Structural Test Plan', description: 'Payload, FOS, and modal testing', status: 'completed', createdBy: 'M. Chen', createdAt: past(50), updatedAt: past(25) },
      { id: tp2, revisionId: rev1, name: 'Safety Test Plan', description: 'E-stop, contact force, and safety function tests', status: 'in_progress', createdBy: 'L. Johansson', createdAt: past(40), updatedAt: past(10) },
    ],
    testCases: [
      { id: tc1, testPlanId: tp1, revisionId: rev1, requirementId: rSys001, title: 'Payload Hold Test', description: 'Hold 5 kg at full extension', method: 'test', preconditions: 'Robot powered, calibrated', steps: '1. Attach 5 kg payload\n2. Command full arm extension\n3. Hold 30 seconds\n4. Check servo errors', expectedResult: 'No servo error, deflection < 5mm', createdAt: past(45) },
      { id: tc2, testPlanId: tp2, revisionId: rev1, requirementId: rSaf001, title: 'E-Stop Response', description: 'Measure time to zero velocity on E-stop', method: 'test', preconditions: 'Robot at max joint velocity', steps: '1. Command max velocity\n2. Trigger E-stop\n3. Record encoder timestamps', expectedResult: 'Time to zero < 250 ms', createdAt: past(35) },
      { id: tc3, testPlanId: tp1, revisionId: rev1, requirementId: rSys002, title: 'FEA Safety Factor', description: 'Verify FOS from structural analysis', method: 'analysis', preconditions: 'FEA model validated', steps: '1. Apply worst-case loads\n2. Run static analysis\n3. Extract min FOS', expectedResult: 'Min FOS >= 2.5', createdAt: past(50) },
      { id: tc4, testPlanId: tp2, revisionId: rev1, requirementId: rSaf002, title: 'Contact Force Test', description: 'Measure TCP contact force', method: 'test', preconditions: 'Calibrated force sensor mounted', steps: '1. Run at various speeds\n2. Make contact with sensor\n3. Record peak forces', expectedResult: 'Transient < 150 N, quasi-static < 50 N', createdAt: past(30) },
    ],
    testRuns: [
      { id: tr1, testPlanId: tp1, revisionId: rev1, name: 'Structural Run #1', executor: 'M. Chen', startedAt: past(28), completedAt: past(27), status: 'completed', notes: 'All structural tests completed successfully.' },
    ],
    testResults: [
      { id: tres1, testRunId: tr1, testCaseId: tc1, outcome: 'pass', measuredValue: 5.8, notes: 'Payload hold successful. Max deflection 2.1mm.', executedAt: past(28) },
      { id: tres2, testRunId: tr1, testCaseId: tc2, outcome: 'pass', measuredValue: 180, notes: 'E-stop response 180 ms (5 trials, max 195 ms).', executedAt: past(28) },
      { id: tres3, testRunId: tr1, testCaseId: tc3, outcome: 'pass', measuredValue: 3.1, notes: 'FEA min FOS = 3.1 at hip bracket.', executedAt: past(28) },
    ],
    testEvidence: [],
    bomItems: [
      { id: bom1, revisionId: rev1, partNumber: 'MOT-HIP-150', name: 'Hip BLDC Motor', description: 'Frameless BLDC motor, 150 Nm peak', category: 'actuator', quantity: 2, unitCost: 1200, currency: 'USD', supplierId: sup1, leadTimeDays: 45, createdAt: past(60), updatedAt: past(10) },
      { id: bom2, revisionId: rev1, partNumber: 'HD-CSD-32', name: 'Harmonic Drive CSG-32', description: 'Strain wave gear, 100:1 ratio', category: 'actuator', quantity: 2, unitCost: 850, currency: 'USD', supplierId: sup2, leadTimeDays: 60, createdAt: past(60), updatedAt: past(10) },
      { id: bom3, revisionId: rev1, partNumber: 'BAT-48V-1500', name: 'Battery Pack 48V 1.5kWh', description: 'Li-ion battery with BMS', category: 'electrical', quantity: 1, unitCost: 2200, currency: 'USD', leadTimeDays: 30, createdAt: past(55), updatedAt: past(10) },
      { id: bom4, revisionId: rev1, partNumber: 'NVIDIA-AGX-ORIN', name: 'Jetson AGX Orin 64GB', description: 'AI compute module', category: 'compute', quantity: 1, unitCost: 1999, currency: 'USD', supplierId: sup3, leadTimeDays: 14, createdAt: past(50), updatedAt: past(10) },
      { id: bom5, revisionId: rev1, partNumber: 'FRM-ATLAS-V3', name: 'Frame Assembly', description: '7075-T6 aluminium extrusion frame', category: 'mechanical', quantity: 1, unitCost: 3500, currency: 'USD', leadTimeDays: 90, createdAt: past(70), updatedAt: past(20) },
      { id: bom6, revisionId: rev1, partNumber: 'ENC-19BIT', name: '19-bit Absolute Encoder', description: 'High-resolution rotary encoder', category: 'sensor', quantity: 12, unitCost: 180, currency: 'USD', leadTimeDays: 21, createdAt: past(55), updatedAt: past(10) },
    ],
    suppliers: [
      { id: sup1, name: 'Teknic Inc.', contactEmail: 'sales@teknic.com', website: 'https://teknic.com', notes: 'Primary motor supplier', createdAt: past(100) },
      { id: sup2, name: 'Harmonic Drive LLC', contactEmail: 'sales@harmonicdrive.net', notes: 'Sole source for CSG gears', createdAt: past(100) },
      { id: sup3, name: 'NVIDIA', contactEmail: 'embedded@nvidia.com', website: 'https://nvidia.com', notes: 'Compute modules', createdAt: past(100) },
    ],
    milestones: [
      { id: ms1, revisionId: rev1, name: 'PDR', description: 'Preliminary Design Review', milestoneType: 'pdr', status: 'completed', targetDate: past(30), actualDate: past(28), createdAt: past(90), updatedAt: past(28) },
      { id: ms2, revisionId: rev1, name: 'CDR', description: 'Critical Design Review', milestoneType: 'cdr', status: 'in_progress', targetDate: future(30), createdAt: past(60), updatedAt: past(5) },
      { id: ms3, revisionId: rev1, name: 'DVT Start', description: 'Design Verification Testing begins', milestoneType: 'dvt', status: 'upcoming', targetDate: future(90), createdAt: past(60), updatedAt: past(5) },
      { id: ms4, revisionId: rev1, name: 'PVT', description: 'Production Validation Test', milestoneType: 'pvt', status: 'upcoming', targetDate: future(180), createdAt: past(60), updatedAt: past(5) },
    ],
    gatingEvents: [
      { id: ge1, milestoneId: ms2, name: 'Requirements Frozen', description: 'All system requirements baselined', isMet: false, createdAt: past(30) },
    ],
    dependencies: [
      { id: 'dep_1' as any, revisionId: rev1, fromMilestoneId: ms1, toMilestoneId: ms2, description: 'PDR must complete before CDR', createdAt: past(60) },
      { id: 'dep_2' as any, revisionId: rev1, fromMilestoneId: ms2, toMilestoneId: ms3, description: 'CDR must complete before DVT', createdAt: past(60) },
      { id: 'dep_3' as any, revisionId: rev1, fromMilestoneId: ms3, toMilestoneId: ms4, description: 'DVT must complete before PVT', createdAt: past(60) },
    ],
    changeProposals: [
      {
        id: cp1, revisionId: rev1, title: 'Increase Mass Budget to 90 kg',
        description: 'Current mass estimate is 82 kg with only 3 kg margin. Propose increasing limit to 90 kg.',
        rationale: 'Battery pack upgrade for extended runtime adds 4 kg. Current 85 kg limit cannot accommodate.',
        status: 'under_review', impact: 'high',
        impactedRequirementIds: [rSys003, rPrf003],
        impactedElementIds: [], impactedBomItemIds: [bom3],
        proposedBy: 'M. Chen', createdAt: past(10), updatedAt: past(3),
      },
    ],
    baselines: [],
    releases: [
      {
        id: rel1, revisionId: rev2, version: '1.2.0', name: 'Scout Mini v2.1',
        description: 'Production release with improved motor controllers.',
        status: 'released', releaseDate: past(60), knownIssues: 'Minor WiFi range reduction in metal enclosures.',
        createdAt: past(65), updatedAt: past(60),
      },
    ],
    fieldedUnits: [
      {
        id: fu1, releaseId: rel1, serialNumber: 'SCT-2024-001', location: 'Amazon DEN4 Warehouse',
        status: 'active', deployedAt: past(55), notes: 'First production deployment.',
        createdAt: past(55), updatedAt: past(15),
      },
    ],
    maintenanceEvents: [
      { id: 'me_1' as any, fieldedUnitId: fu1, description: 'Routine wheel bearing replacement', performedBy: 'Field Tech J. Rivera', performedAt: past(15), notes: 'Replaced front-left bearing, logged 1200 operating hours.', createdAt: past(15) },
    ],
    incidents: [],
    reviews: [
      {
        id: rev_r1, revisionId: rev1, title: 'PDR-001: Structural & Actuation',
        description: 'Preliminary Design Review for structural frame and actuation subsystem.',
        reviewType: 'PDR', requirementIds: [rSys001, rSys002, rSys003, rSys004, rPrf001],
        scheduledDate: past(25), status: 'completed', createdAt: past(35),
      },
      {
        id: rev_r2, revisionId: rev1, title: 'PDR-002: Safety & Controls',
        description: 'Preliminary Design Review for safety system and real-time control.',
        reviewType: 'PDR', requirementIds: [rSaf001, rSaf002, rSaf003, rPrf002],
        scheduledDate: past(3), status: 'in_progress', createdAt: past(15),
      },
    ],
    signOffs: [
      { id: so1, reviewId: rev_r1, requirementId: rSys001, reviewer: 'Dr. Sarah Chen', role: 'Lead ME', decision: 'approved', comments: 'FEA confirms adequate margin.', signedAt: past(24) },
      { id: so2, reviewId: rev_r1, requirementId: rSys002, reviewer: 'Dr. Sarah Chen', role: 'Lead ME', decision: 'approved', comments: 'Safety factor margins verified.', signedAt: past(24) },
      { id: so3, reviewId: rev_r1, requirementId: rSys003, reviewer: 'Dr. Sarah Chen', role: 'Lead ME', decision: 'needs_changes', comments: 'Current mass estimate 82 kg with only 3 kg margin.', signedAt: past(24) },
    ],
    reqArchLinks: [
      { id: 'ral_1', requirementId: rPrf002, elementId: arch1, createdAt: past(50) },
      { id: 'ral_2', requirementId: rPrf001, elementId: arch2, createdAt: past(50) },
      { id: 'ral_3', requirementId: rSaf001, elementId: arch3, createdAt: past(50) },
      { id: 'ral_4', requirementId: rIfc001, elementId: arch4, createdAt: past(50) },
    ],
    reqArtifactLinks: [
      { id: 'rartl_1', requirementId: rSys002, artifactId: 'art_fea_report' as ArtifactId, createdAt: past(40) },
      { id: 'rartl_2', requirementId: rPrf001, artifactId: 'art_hip_drawing' as ArtifactId, createdAt: past(40) },
    ],
    reqTestCaseLinks: [
      { id: 'rtcl_1', requirementId: rSys001, testCaseId: tc1, createdAt: past(40) },
      { id: 'rtcl_2', requirementId: rSaf001, testCaseId: tc2, createdAt: past(35) },
      { id: 'rtcl_3', requirementId: rSys002, testCaseId: tc3, createdAt: past(45) },
      { id: 'rtcl_4', requirementId: rSaf002, testCaseId: tc4, createdAt: past(30) },
    ],
    archArtifactLinks: [],
  };
}
