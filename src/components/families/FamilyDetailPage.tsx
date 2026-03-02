import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { Breadcrumbs } from '../ui/Breadcrumbs.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { PHASE_META } from '../../types/display-meta.ts';
import { formatDate } from '../../lib/date.ts';
import { Plus, GitBranch, Pencil } from 'lucide-react';
import type { FamilyId, LifecyclePhase } from '../../types/index.ts';

export function FamilyDetailPage() {
  const { familyId } = useParams<{ familyId: string }>();
  const families = useAppStore(s => s.families);
  const variants = useAppStore(s => s.variants);
  const revisions = useAppStore(s => s.revisions);
  const createVariant = useAppStore(s => s.createVariant);
  const createRevision = useAppStore(s => s.createRevision);
  const updateFamily = useAppStore(s => s.updateFamily);
  const setActiveFamily = useAppStore(s => s.setActiveFamily);
  const toast = useToast();

  const family = families.find(f => f.id === familyId);
  const familyVariants = variants.filter(v => v.familyId === familyId);

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [showRevForm, setShowRevForm] = useState<string | null>(null);
  const [showRename, setShowRename] = useState(false);
  const [renameForm, setRenameForm] = useState({ name: '', codeName: '', description: '' });
  const [varForm, setVarForm] = useState({ name: '', description: '', phase: 'concept' as LifecyclePhase });
  const [revForm, setRevForm] = useState({ version: '', description: '' });

  if (!family) {
    return <EmptyState title="Family not found" description="This robot family doesn't exist." />;
  }

  const familyRef = family;

  function openRename() {
    setRenameForm({ name: familyRef.name, codeName: familyRef.codeName, description: familyRef.description });
    setShowRename(true);
  }

  function handleRename() {
    if (!renameForm.name.trim()) return;
    updateFamily(familyRef.id, renameForm);
    setShowRename(false);
    toast.success('Family updated');
  }

  function handleCreateVariant() {
    if (!varForm.name.trim()) return;
    createVariant({ ...varForm, familyId: familyId as FamilyId });
    setShowVariantForm(false);
    setVarForm({ name: '', description: '', phase: 'concept' });
    toast.success('Variant created');
  }

  function handleCreateRevision() {
    if (!revForm.version.trim() || !showRevForm) return;
    createRevision({ ...revForm, variantId: showRevForm as any, isHead: true });
    setShowRevForm(null);
    setRevForm({ version: '', description: '' });
    toast.success('Revision created');
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Families', href: '/families' }, { label: family.name }]} />
      <PageHeader
        title={family.name}
        description={family.description}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={openRename}>Rename</Button>
            <Button variant="secondary" onClick={() => setActiveFamily(family.id)}>Set Active</Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowVariantForm(true)}>Add Variant</Button>
          </div>
        }
      />

      <p className="text-xs text-gray-500 font-mono mb-6">{family.codeName}</p>

      {familyVariants.length === 0 ? (
        <EmptyState title="No variants" description="Add a variant to this family." action={<Button onClick={() => setShowVariantForm(true)}>Add Variant</Button>} />
      ) : (
        <div className="space-y-4">
          {familyVariants.map(v => {
            const vRevs = revisions.filter(r => r.variantId === v.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            return (
              <Card key={v.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.name}</h3>
                    <p className="text-sm text-gray-600">{v.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={v.phase === 'production' ? 'green' : 'blue'}>{PHASE_META[v.phase].label}</Badge>
                    <Button size="sm" variant="ghost" icon={<Plus className="h-3 w-3" />} onClick={() => setShowRevForm(v.id)}>Revision</Button>
                  </div>
                </div>
                {vRevs.length > 0 && (
                  <div className="space-y-1">
                    {vRevs.map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50">
                        <GitBranch className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-gray-700">{r.version}</span>
                        {r.isHead && <Badge color="green">HEAD</Badge>}
                        <span className="text-gray-500 text-xs">{r.description}</span>
                        <span className="text-gray-400 text-xs ml-auto">{formatDate(r.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showVariantForm} onClose={() => setShowVariantForm(false)} title="Add Variant">
        <div className="space-y-4">
          <Input label="Name" value={varForm.name} onChange={e => setVarForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. v3" />
          <Textarea label="Description" value={varForm.description} onChange={e => setVarForm(f => ({ ...f, description: e.target.value }))} />
          <Select label="Phase" value={varForm.phase} onChange={e => setVarForm(f => ({ ...f, phase: e.target.value as LifecyclePhase }))}
            options={Object.entries(PHASE_META).map(([k, v]) => ({ value: k, label: v.label }))} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowVariantForm(false)}>Cancel</Button>
            <Button onClick={handleCreateVariant}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRename} onClose={() => setShowRename(false)} title="Rename Family">
        <div className="space-y-4">
          <Input label="Family Name" value={renameForm.name} onChange={e => setRenameForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Code Name" value={renameForm.codeName} onChange={e => setRenameForm(f => ({ ...f, codeName: e.target.value }))} />
          <Textarea label="Description" value={renameForm.description} onChange={e => setRenameForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRename(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!showRevForm} onClose={() => setShowRevForm(null)} title="Add Revision">
        <div className="space-y-4">
          <Input label="Version" value={revForm.version} onChange={e => setRevForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. 1.0.0" />
          <Textarea label="Description" value={revForm.description} onChange={e => setRevForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRevForm(null)}>Cancel</Button>
            <Button onClick={handleCreateRevision}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
