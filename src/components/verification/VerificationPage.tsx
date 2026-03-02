import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Tabs } from '../ui/Tabs.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Card } from '../ui/Card.tsx';
import { Table, type ColumnDef } from '../ui/Table.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { useCoverageStats } from '../../store/selectors.ts';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate } from '../../lib/date.ts';
import type { TestCase, VerificationMethod, TestPlanId, RevisionId, RequirementId } from '../../types/index.ts';
import { Plus, FlaskConical, CheckCircle, XCircle, Clock } from 'lucide-react';

export function VerificationPage() {
  const testPlans = useAppStore(s => s.testPlans);
  const testCases = useAppStore(s => s.testCases);
  const testRuns = useAppStore(s => s.testRuns);
  const testResults = useAppStore(s => s.testResults);
  const requirements = useAppStore(s => s.requirements);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createTestPlan = useAppStore(s => s.createTestPlan);
  const createTestCase = useAppStore(s => s.createTestCase);
  const addReqTestCaseLink = useAppStore(s => s.addReqTestCaseLink);
  const coverage = useCoverageStats();
  const toast = useToast();

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', description: '', createdBy: '' });
  const [caseForm, setCaseForm] = useState({ testPlanId: '', requirementId: '', title: '', description: '', method: 'test' as VerificationMethod, preconditions: '', steps: '', expectedResult: '' });

  const revPlans = testPlans.filter(p => p.revisionId === activeRevisionId);
  const revCases = testCases.filter(c => c.revisionId === activeRevisionId);
  const revRuns = testRuns.filter(r => r.revisionId === activeRevisionId);
  const revReqs = requirements.filter(r => r.revisionId === activeRevisionId);

  function handleCreatePlan() {
    if (!planForm.name.trim() || !activeRevisionId) return;
    createTestPlan({ ...planForm, revisionId: activeRevisionId as RevisionId, status: 'draft' });
    setShowPlanForm(false);
    setPlanForm({ name: '', description: '', createdBy: '' });
    toast.success('Test plan created');
  }

  function handleCreateCase() {
    if (!caseForm.title.trim() || !caseForm.testPlanId || !activeRevisionId) return;
    const tc = createTestCase({
      ...caseForm,
      testPlanId: caseForm.testPlanId as TestPlanId,
      requirementId: caseForm.requirementId as RequirementId,
      revisionId: activeRevisionId as RevisionId,
    });
    if (caseForm.requirementId) {
      addReqTestCaseLink(caseForm.requirementId as RequirementId, tc.id);
    }
    setShowCaseForm(false);
    setCaseForm({ testPlanId: '', requirementId: '', title: '', description: '', method: 'test', preconditions: '', steps: '', expectedResult: '' });
    toast.success('Test case created');
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Verification" /><EmptyState title="No revision selected" /></div>;
  }

  const plansContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowPlanForm(true)}>New Plan</Button>
      </div>
      {revPlans.length === 0 ? (
        <EmptyState icon={<FlaskConical className="h-10 w-10" />} title="No test plans" action={<Button onClick={() => setShowPlanForm(true)}>Create Plan</Button>} />
      ) : (
        <div className="space-y-3">
          {revPlans.map(p => {
            const cases = testCases.filter(c => c.testPlanId === p.id);
            return (
              <Card key={p.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.description}</p>
                  </div>
                  <Badge color={p.status === 'completed' ? 'green' : p.status === 'in_progress' ? 'yellow' : 'gray'}>{p.status}</Badge>
                </div>
                <div className="mt-2 text-xs text-gray-500">{cases.length} test cases | Created by {p.createdBy}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const casesColumns: ColumnDef<TestCase>[] = [
    { key: 'title', header: 'Title', render: c => <span className="font-medium">{c.title}</span> },
    { key: 'method', header: 'Method', render: c => <Badge color="blue">{c.method}</Badge> },
    {
      key: 'requirement', header: 'Requirement',
      render: c => {
        const req = revReqs.find(r => r.id === c.requirementId);
        return req ? <span className="font-mono text-xs text-primary-700">{req.identifier}</span> : <span className="text-gray-400">-</span>;
      },
    },
    { key: 'result', header: 'Result', render: c => {
      const res = testResults.find(r => r.testCaseId === c.id);
      if (!res) return <Clock className="h-4 w-4 text-gray-400" />;
      return res.outcome === 'pass' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
    }},
  ];

  const casesContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowCaseForm(true)}>New Case</Button>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={casesColumns} data={revCases} keyExtractor={c => c.id} emptyMessage="No test cases yet." />
      </div>
    </div>
  );

  const runsContent = (
    <div>
      {revRuns.length === 0 ? (
        <EmptyState title="No test runs" description="Execute a test plan to create a run." />
      ) : (
        <div className="space-y-3">
          {revRuns.map(r => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{r.name}</h3>
                  <p className="text-xs text-gray-500">Executor: {r.executor} | {formatDate(r.startedAt)}</p>
                </div>
                <Badge color={r.status === 'completed' ? 'green' : 'yellow'}>{r.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const coverageContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card><div className="text-center"><div className="text-2xl font-bold">{coverage.total}</div><div className="text-xs text-gray-500">Total Reqs</div></div></Card>
        <Card><div className="text-center"><div className="text-2xl font-bold text-green-600">{coverage.covered}</div><div className="text-xs text-gray-500">Covered</div></div></Card>
        <Card><div className="text-center"><div className="text-2xl font-bold text-green-600">{coverage.passed}</div><div className="text-xs text-gray-500">Passed</div></div></Card>
        <Card><div className="text-center"><div className="text-2xl font-bold text-red-600">{coverage.failed}</div><div className="text-xs text-gray-500">Failed</div></div></Card>
      </div>
      <ProgressBar value={coverage.pct} label="Overall Coverage" color="bg-primary-600" />
    </div>
  );

  return (
    <div>
      <PageHeader title="Verification" description="Test plans, cases, runs, and coverage tracking" />
      <Tabs tabs={[
        { id: 'plans', label: 'Plans', content: plansContent },
        { id: 'cases', label: 'Cases', content: casesContent },
        { id: 'runs', label: 'Runs', content: runsContent },
        { id: 'coverage', label: 'Coverage', content: coverageContent },
      ]} />

      <Modal open={showPlanForm} onClose={() => setShowPlanForm(false)} title="Create Test Plan">
        <div className="space-y-4">
          <Input label="Name" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Created By" value={planForm.createdBy} onChange={e => setPlanForm(f => ({ ...f, createdBy: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowPlanForm(false)}>Cancel</Button><Button onClick={handleCreatePlan}>Create</Button></div>
        </div>
      </Modal>

      <Modal open={showCaseForm} onClose={() => setShowCaseForm(false)} title="Create Test Case" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Test Plan" value={caseForm.testPlanId} onChange={e => setCaseForm(f => ({ ...f, testPlanId: e.target.value }))}
              placeholder="Select plan" options={revPlans.map(p => ({ value: p.id, label: p.name }))} />
            <Select label="Requirement" value={caseForm.requirementId} onChange={e => setCaseForm(f => ({ ...f, requirementId: e.target.value }))}
              placeholder="Select requirement" options={revReqs.map(r => ({ value: r.id, label: `${r.identifier} - ${r.title}` }))} />
          </div>
          <Input label="Title" value={caseForm.title} onChange={e => setCaseForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" value={caseForm.description} onChange={e => setCaseForm(f => ({ ...f, description: e.target.value }))} />
          <Select label="Method" value={caseForm.method} onChange={e => setCaseForm(f => ({ ...f, method: e.target.value as VerificationMethod }))}
            options={['test','analysis','inspection','demonstration','similarity'].map(v => ({ value: v, label: v }))} />
          <Textarea label="Preconditions" value={caseForm.preconditions} onChange={e => setCaseForm(f => ({ ...f, preconditions: e.target.value }))} />
          <Textarea label="Steps" value={caseForm.steps} onChange={e => setCaseForm(f => ({ ...f, steps: e.target.value }))} />
          <Textarea label="Expected Result" value={caseForm.expectedResult} onChange={e => setCaseForm(f => ({ ...f, expectedResult: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowCaseForm(false)}>Cancel</Button><Button onClick={handleCreateCase}>Create</Button></div>
        </div>
      </Modal>
    </div>
  );
}
