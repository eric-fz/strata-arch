import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Tabs } from '../ui/Tabs.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { Table, type ColumnDef } from '../ui/Table.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate } from '../../lib/date.ts';
import type { ReleaseStatus, FieldedUnitStatus, RevisionId } from '../../types/index.ts';
import type { FieldedUnit } from '../../types/releases.ts';
import { Plus, Rocket } from 'lucide-react';

const RELEASE_STATUS_COLORS: Record<ReleaseStatus, string> = {
  planning: 'gray', candidate: 'yellow', released: 'green', recalled: 'red', end_of_life: 'slate',
};

const UNIT_STATUS_COLORS: Record<FieldedUnitStatus, string> = {
  active: 'green', maintenance: 'yellow', decommissioned: 'slate', recalled: 'red',
};

export function ReleasesPage() {
  const releases = useAppStore(s => s.releases);
  const fieldedUnits = useAppStore(s => s.fieldedUnits);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createRelease = useAppStore(s => s.createRelease);
  const createFieldedUnit = useAppStore(s => s.createFieldedUnit);
  const toast = useToast();
  const [showRelForm, setShowRelForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [relForm, setRelForm] = useState({ version: '', name: '', description: '', knownIssues: '' });
  const [unitForm, setUnitForm] = useState({ releaseId: '', serialNumber: '', location: '', notes: '' });

  function handleCreateRelease() {
    if (!relForm.name.trim() || !activeRevisionId) return;
    createRelease({ ...relForm, revisionId: activeRevisionId as RevisionId, status: 'planning' });
    setShowRelForm(false);
    setRelForm({ version: '', name: '', description: '', knownIssues: '' });
    toast.success('Release created');
  }

  function handleCreateUnit() {
    if (!unitForm.serialNumber.trim() || !unitForm.releaseId) return;
    createFieldedUnit({ ...unitForm, releaseId: unitForm.releaseId as any, status: 'active', deployedAt: new Date().toISOString() });
    setShowUnitForm(false);
    setUnitForm({ releaseId: '', serialNumber: '', location: '', notes: '' });
    toast.success('Fielded unit created');
  }

  const releasesContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowRelForm(true)}>New Release</Button>
      </div>
      {releases.length === 0 ? (
        <EmptyState icon={<Rocket className="h-10 w-10" />} title="No releases" action={<Button onClick={() => setShowRelForm(true)}>Create Release</Button>} />
      ) : (
        <div className="space-y-3">
          {releases.map(r => (
            <Link key={r.id} to={`/releases/${r.id}`}>
              <Card className="hover:ring-2 hover:ring-primary-200 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{r.name}</h3>
                    <p className="text-sm text-gray-600">{r.description}</p>
                    <p className="text-xs text-gray-500 mt-1">v{r.version} | {r.releaseDate ? formatDate(r.releaseDate) : 'No release date'}</p>
                  </div>
                  <Badge color={RELEASE_STATUS_COLORS[r.status]}>{r.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const unitColumns: ColumnDef<FieldedUnit>[] = [
    { key: 'serialNumber', header: 'Serial', render: u => <span className="font-mono text-sm">{u.serialNumber}</span> },
    { key: 'location', header: 'Location', render: u => u.location },
    { key: 'status', header: 'Status', render: u => <Badge color={UNIT_STATUS_COLORS[u.status]}>{u.status}</Badge> },
    { key: 'deployedAt', header: 'Deployed', render: u => formatDate(u.deployedAt) },
  ];

  const unitsContent = (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" icon={<Plus className="h-3 w-3" />} onClick={() => setShowUnitForm(true)}>Add Unit</Button>
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={unitColumns} data={fieldedUnits} keyExtractor={u => u.id} emptyMessage="No fielded units." />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Releases & Field" description="Release management and fielded unit tracking" />
      <Tabs tabs={[
        { id: 'releases', label: 'Releases', content: releasesContent },
        { id: 'units', label: 'Fielded Units', content: unitsContent },
      ]} />

      <Modal open={showRelForm} onClose={() => setShowRelForm(false)} title="Create Release">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={relForm.version} onChange={e => setRelForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0.0" />
            <Input label="Name" value={relForm.name} onChange={e => setRelForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <Textarea label="Description" value={relForm.description} onChange={e => setRelForm(f => ({ ...f, description: e.target.value }))} />
          <Textarea label="Known Issues" value={relForm.knownIssues} onChange={e => setRelForm(f => ({ ...f, knownIssues: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowRelForm(false)}>Cancel</Button><Button onClick={handleCreateRelease}>Create</Button></div>
        </div>
      </Modal>

      <Modal open={showUnitForm} onClose={() => setShowUnitForm(false)} title="Add Fielded Unit">
        <div className="space-y-4">
          <Select label="Release" value={unitForm.releaseId} onChange={e => setUnitForm(f => ({ ...f, releaseId: e.target.value }))}
            placeholder="Select release" options={releases.map(r => ({ value: r.id, label: `${r.name} v${r.version}` }))} />
          <Input label="Serial Number" value={unitForm.serialNumber} onChange={e => setUnitForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="SCT-2024-001" />
          <Input label="Location" value={unitForm.location} onChange={e => setUnitForm(f => ({ ...f, location: e.target.value }))} />
          <Textarea label="Notes" value={unitForm.notes} onChange={e => setUnitForm(f => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowUnitForm(false)}>Cancel</Button><Button onClick={handleCreateUnit}>Add</Button></div>
        </div>
      </Modal>
    </div>
  );
}
