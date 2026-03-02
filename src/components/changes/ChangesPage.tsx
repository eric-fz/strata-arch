import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { Tabs } from '../ui/Tabs.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate } from '../../lib/date.ts';
import type { ChangeProposalStatus, ChangeImpact, RevisionId } from '../../types/index.ts';
import { Plus, GitPullRequest } from 'lucide-react';

const STATUS_COLORS: Record<ChangeProposalStatus, string> = {
  draft: 'gray', submitted: 'blue', under_review: 'yellow', approved: 'green', rejected: 'red', implemented: 'emerald', closed: 'slate',
};

export function ChangesPage() {
  const changeProposals = useAppStore(s => s.changeProposals);
  const baselines = useAppStore(s => s.baselines);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createChangeProposal = useAppStore(s => s.createChangeProposal);
  const createBaseline = useAppStore(s => s.createBaseline);
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', rationale: '', impact: 'medium' as ChangeImpact, proposedBy: '' });
  const [baselineForm, setBaselineForm] = useState({ name: '', description: '', createdBy: '' });

  const revChanges = changeProposals.filter(c => c.revisionId === activeRevisionId);
  const revBaselines = baselines.filter(b => b.revisionId === activeRevisionId);

  function handleCreate() {
    if (!form.title.trim() || !activeRevisionId) return;
    createChangeProposal({ ...form, revisionId: activeRevisionId as RevisionId, status: 'draft', impactedRequirementIds: [], impactedElementIds: [], impactedBomItemIds: [] });
    setShowCreate(false);
    setForm({ title: '', description: '', rationale: '', impact: 'medium', proposedBy: '' });
    toast.success('Change proposal created');
  }

  function handleCreateBaseline() {
    if (!baselineForm.name.trim() || !activeRevisionId) return;
    createBaseline({ ...baselineForm, revisionId: activeRevisionId as RevisionId, snapshot: '{}' });
    setShowBaseline(false);
    setBaselineForm({ name: '', description: '', createdBy: '' });
    toast.success('Baseline created');
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Change Control" /><EmptyState title="No revision selected" /></div>;
  }

  const proposalsContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowCreate(true)}>New Proposal</Button>
      </div>
      {revChanges.length === 0 ? (
        <EmptyState icon={<GitPullRequest className="h-10 w-10" />} title="No change proposals" action={<Button onClick={() => setShowCreate(true)}>Create Proposal</Button>} />
      ) : (
        <div className="space-y-3">
          {revChanges.map(c => (
            <Link key={c.id} to={`/changes/${c.id}`}>
              <Card className="hover:ring-2 hover:ring-primary-200 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{c.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{c.description}</p>
                    <p className="text-xs text-gray-500 mt-1">By {c.proposedBy} | {formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge color={c.impact === 'critical' ? 'red' : c.impact === 'high' ? 'orange' : 'yellow'}>{c.impact}</Badge>
                    <Badge color={STATUS_COLORS[c.status]}>{c.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const baselinesContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowBaseline(true)}>New Baseline</Button>
      </div>
      {revBaselines.length === 0 ? (
        <EmptyState title="No baselines" description="Create a baseline snapshot." action={<Button onClick={() => setShowBaseline(true)}>Create Baseline</Button>} />
      ) : (
        <div className="space-y-3">
          {revBaselines.map(b => (
            <Card key={b.id}>
              <h3 className="font-medium text-gray-900">{b.name}</h3>
              <p className="text-sm text-gray-600">{b.description}</p>
              <p className="text-xs text-gray-500 mt-1">By {b.createdBy} | {formatDate(b.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Change Control" description="Manage change proposals and baselines" />
      <Tabs tabs={[
        { id: 'proposals', label: 'Proposals', content: proposalsContent },
        { id: 'baselines', label: 'Baselines', content: baselinesContent },
      ]} />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Change Proposal" wide>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Textarea label="Rationale" value={form.rationale} onChange={e => setForm(f => ({ ...f, rationale: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Impact" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value as ChangeImpact }))}
              options={['low','medium','high','critical'].map(v => ({ value: v, label: v }))} />
            <Input label="Proposed By" value={form.proposedBy} onChange={e => setForm(f => ({ ...f, proposedBy: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></div>
        </div>
      </Modal>

      <Modal open={showBaseline} onClose={() => setShowBaseline(false)} title="Create Baseline">
        <div className="space-y-4">
          <Input label="Name" value={baselineForm.name} onChange={e => setBaselineForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={baselineForm.description} onChange={e => setBaselineForm(f => ({ ...f, description: e.target.value }))} />
          <Input label="Created By" value={baselineForm.createdBy} onChange={e => setBaselineForm(f => ({ ...f, createdBy: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowBaseline(false)}>Cancel</Button><Button onClick={handleCreateBaseline}>Create</Button></div>
        </div>
      </Modal>
    </div>
  );
}
