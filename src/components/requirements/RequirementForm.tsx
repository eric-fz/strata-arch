import { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { CATEGORY_META } from '../../types/display-meta.ts';
import type { Requirement, RequirementCategory, RequirementType, RequirementPriority, RequirementStatus, VerificationMethod, RevisionId } from '../../types/index.ts';

interface Props {
  onClose: () => void;
  initial?: Requirement;
}

export function RequirementForm({ onClose, initial }: Props) {
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createRequirement = useAppStore(s => s.createRequirement);
  const updateRequirement = useAppStore(s => s.updateRequirement);
  const toast = useToast();

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    rationale: initial?.rationale ?? '',
    category: initial?.category ?? 'system' as RequirementCategory,
    reqType: initial?.reqType ?? 'functional' as RequirementType,
    status: initial?.status ?? 'draft' as RequirementStatus,
    priority: initial?.priority ?? 'medium' as RequirementPriority,
    owner: initial?.owner ?? '',
    verificationMethod: initial?.verificationMethod ?? 'test' as VerificationMethod,
    acceptanceCriteria: initial?.acceptanceCriteria ?? '',
    nominalValue: initial?.nominalValue?.toString() ?? '',
    minValue: initial?.minValue?.toString() ?? '',
    maxValue: initial?.maxValue?.toString() ?? '',
    unit: initial?.unit ?? '',
    createdBy: initial?.createdBy ?? '',
  });

  function handleSubmit() {
    if (!form.title.trim() || !activeRevisionId) return;
    const data = {
      ...form,
      revisionId: activeRevisionId as RevisionId,
      nominalValue: form.nominalValue ? parseFloat(form.nominalValue) : undefined,
      minValue: form.minValue ? parseFloat(form.minValue) : undefined,
      maxValue: form.maxValue ? parseFloat(form.maxValue) : undefined,
      unit: form.unit || undefined,
    };
    if (initial) {
      updateRequirement(initial.id, data);
      toast.success('Requirement updated');
    } else {
      createRequirement(data as any);
      toast.success('Requirement created');
    }
    onClose();
  }

  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Payload Capacity" />
        <Input label="Owner" value={form.owner} onChange={e => f('owner', e.target.value)} placeholder="M. Chen" />
      </div>
      <Textarea label="Description (shall-statement)" value={form.description} onChange={e => f('description', e.target.value)} />
      <Textarea label="Rationale" value={form.rationale} onChange={e => f('rationale', e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        <Select label="Category" value={form.category} onChange={e => f('category', e.target.value)}
          options={Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label }))} />
        <Select label="Type" value={form.reqType} onChange={e => f('reqType', e.target.value)}
          options={['functional','performance','interface','physical','safety','operational'].map(v => ({ value: v, label: v }))} />
        <Select label="Priority" value={form.priority} onChange={e => f('priority', e.target.value)}
          options={['critical','high','medium','low'].map(v => ({ value: v, label: v }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Verification Method" value={form.verificationMethod} onChange={e => f('verificationMethod', e.target.value)}
          options={['analysis','test','inspection','demonstration','similarity'].map(v => ({ value: v, label: v }))} />
        <Input label="Created By" value={form.createdBy} onChange={e => f('createdBy', e.target.value)} />
      </div>
      <Textarea label="Acceptance Criteria" value={form.acceptanceCriteria} onChange={e => f('acceptanceCriteria', e.target.value)} />
      <div className="grid grid-cols-4 gap-4">
        <Input label="Nominal" type="number" value={form.nominalValue} onChange={e => f('nominalValue', e.target.value)} />
        <Input label="Min" type="number" value={form.minValue} onChange={e => f('minValue', e.target.value)} />
        <Input label="Max" type="number" value={form.maxValue} onChange={e => f('maxValue', e.target.value)} />
        <Input label="Unit" value={form.unit} onChange={e => f('unit', e.target.value)} placeholder="kg, N, Hz" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
}
