import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { SearchInput } from '../ui/SearchInput.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { PHASE_META } from '../../types/display-meta.ts';
import { Plus, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FamiliesPage() {
  const families = useAppStore(s => s.families);
  const variants = useAppStore(s => s.variants);
  const createFamily = useAppStore(s => s.createFamily);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', codeName: '', description: '' });

  const filtered = search
    ? families.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.codeName.toLowerCase().includes(search.toLowerCase()))
    : families;

  function handleCreate() {
    if (!form.name.trim()) return;
    createFamily(form);
    setShowCreate(false);
    setForm({ name: '', codeName: '', description: '' });
    toast.success('Family created');
  }

  return (
    <div>
      <PageHeader
        title="Robot Families"
        description="Manage robot product families, variants, and revisions."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>New Family</Button>}
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Search families..." className="max-w-sm mb-4" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-12 w-12" />}
          title="No robot families"
          description="Create your first robot family to get started."
          action={<Button onClick={() => setShowCreate(true)}>Create Family</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => {
            const fVars = variants.filter(v => v.familyId === f.id);
            return (
              <Link key={f.id} to={`/families/${f.id}`}>
                <Card className="hover:ring-2 hover:ring-primary-200 transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{f.name}</h3>
                      <p className="text-xs text-gray-500 font-mono">{f.codeName}</p>
                    </div>
                    <Badge color="blue">{fVars.length} variant{fVars.length !== 1 ? 's' : ''}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{f.description}</p>
                  {fVars.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {fVars.map(v => (
                        <Badge key={v.id} color={v.phase === 'production' ? 'green' : 'blue'}>
                          {v.name} - {PHASE_META[v.phase].label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Robot Family">
        <div className="space-y-4">
          <Input label="Family Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Atlas" />
          <Input label="Code Name" value={form.codeName} onChange={e => setForm(f => ({ ...f, codeName: e.target.value }))} placeholder="e.g. ATLAS" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
