import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { SearchInput } from '../ui/SearchInput.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { Sheet } from '../ui/Sheet.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import type { ArtifactType, ArtifactStatus, ArtifactId, RevisionId } from '../../types/index.ts';
import { Plus, FileCode, Paperclip } from 'lucide-react';
import { formatDate } from '../../lib/date.ts';

const TYPE_LABELS: Record<ArtifactType, string> = {
  cad_model: 'CAD Model', drawing: 'Drawing', schematic: 'Schematic',
  firmware: 'Firmware', software: 'Software', datasheet: 'Datasheet',
  spec_sheet: 'Spec Sheet', test_report: 'Test Report', analysis_report: 'Analysis Report',
  manual: 'Manual', other: 'Other',
};

export function ArtifactsPage() {
  const artifacts = useAppStore(s => s.artifacts);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createArtifact = useAppStore(s => s.createArtifact);
  const deleteArtifact = useAppStore(s => s.deleteArtifact);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<ArtifactId | null>(null);
  const [form, setForm] = useState({ name: '', description: '', artifactType: 'other' as ArtifactType, status: 'draft' as ArtifactStatus, version: '', createdBy: '' });

  const revArtifacts = artifacts.filter(a => a.revisionId === activeRevisionId);
  const filtered = search ? revArtifacts.filter(a => a.name.toLowerCase().includes(search.toLowerCase())) : revArtifacts;
  const selected = revArtifacts.find(a => a.id === selectedId);

  function handleCreate() {
    if (!form.name.trim() || !activeRevisionId) return;
    createArtifact({ ...form, revisionId: activeRevisionId as RevisionId });
    setShowCreate(false);
    setForm({ name: '', description: '', artifactType: 'other', status: 'draft', version: '', createdBy: '' });
    toast.success('Artifact created');
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Artifacts" /><EmptyState title="No revision selected" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Artifacts"
        description={`${revArtifacts.length} artifacts`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>New Artifact</Button>}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search artifacts..." className="max-w-sm mb-4" />

      {filtered.length === 0 ? (
        <EmptyState icon={<Paperclip className="h-12 w-12" />} title="No artifacts" description="Upload or create artifacts." action={<Button onClick={() => setShowCreate(true)}>Create Artifact</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <Card key={a.id} className="cursor-pointer hover:ring-2 hover:ring-primary-200" onClick={() => setSelectedId(a.id)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900 text-sm">{a.name}</h3>
                </div>
                <Badge color={a.status === 'released' ? 'green' : a.status === 'obsolete' ? 'gray' : 'yellow'}>{a.status}</Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Badge color="blue">{TYPE_LABELS[a.artifactType]}</Badge>
                <span>{a.version}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <Badge color={selected.status === 'released' ? 'green' : 'yellow'}>{selected.status}</Badge>
            <p className="text-sm text-gray-700">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Type:</span> {TYPE_LABELS[selected.artifactType]}</div>
              <div><span className="text-gray-500">Version:</span> {selected.version}</div>
              <div><span className="text-gray-500">Created by:</span> {selected.createdBy}</div>
              <div><span className="text-gray-500">Created:</span> {formatDate(selected.createdAt)}</div>
            </div>
            <Button variant="danger" size="sm" onClick={() => { deleteArtifact(selected.id); setSelectedId(null); toast.success('Artifact deleted'); }}>Delete</Button>
          </div>
        )}
      </Sheet>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Artifact">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.artifactType} onChange={e => setForm(f => ({ ...f, artifactType: e.target.value as ArtifactType }))}
              options={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ArtifactStatus }))}
              options={[{ value: 'draft', label: 'Draft' }, { value: 'released', label: 'Released' }, { value: 'obsolete', label: 'Obsolete' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Version" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="Rev A" />
            <Input label="Created By" value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
