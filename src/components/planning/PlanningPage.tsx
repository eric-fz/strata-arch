import { useState, useMemo } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { GanttChart } from './GanttChart.tsx';
import { BulkAddModal } from './BulkAddModal.tsx';
import type { BulkRow } from './BulkAddModal.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate, daysUntil } from '../../lib/date.ts';
import { computeCriticalPath } from '../../lib/criticalPath.ts';
import type { MilestoneType, MilestoneStatus } from '../../types/enums.ts';
import type { MilestoneId, RevisionId, DependencyId } from '../../types/ids.ts';
import type { Milestone } from '../../types/planning.ts';
import { Plus, Calendar, CheckCircle, Clock, Link2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<MilestoneType, string> = {
  pdr: 'PDR', cdr: 'CDR', fai: 'FAI', dvt: 'DVT', pvt: 'PVT',
  production_release: 'Production', custom: 'Custom',
};

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  upcoming: 'blue', in_progress: 'yellow', completed: 'green', missed: 'red',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }));
const STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
];

// ── Hierarchy helpers ─────────────────────────────────────────────────────────

function buildTree(milestones: Milestone[]) {
  const children = new Map<string | undefined, Milestone[]>();
  for (const m of milestones) {
    const key = m.parentMilestoneId;
    if (!children.has(key)) children.set(key, []);
    children.get(key)!.push(m);
  }
  for (const arr of children.values()) {
    arr.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  }
  return children;
}

// ── Main component ────────────────────────────────────────────────────────────

export function PlanningPage() {
  const milestones = useAppStore(s => s.milestones);
  const dependencies = useAppStore(s => s.dependencies);
  const gatingEvents = useAppStore(s => s.gatingEvents);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createMilestone = useAppStore(s => s.createMilestone);
  const updateMilestone = useAppStore(s => s.updateMilestone);
  const deleteMilestone = useAppStore(s => s.deleteMilestone);
  const createDependency = useAppStore(s => s.createDependency);
  const deleteDependency = useAppStore(s => s.deleteDependency);
  const toast = useToast();

  // Filter to active revision
  const revMs = useMemo(
    () => milestones.filter(m => m.revisionId === activeRevisionId),
    [milestones, activeRevisionId],
  );
  const revDeps = useMemo(
    () => dependencies.filter(d => d.revisionId === activeRevisionId),
    [dependencies, activeRevisionId],
  );

  // CPM
  const cpm = useMemo(() => computeCriticalPath(revMs, revDeps), [revMs, revDeps]);
  const criticalCount = [...cpm.values()].filter(r => r.isCritical).length;

  // UI state
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showSingle, setShowSingle] = useState(false);
  const [showDepModal, setShowDepModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Single add form
  const [form, setForm] = useState({
    name: '', description: '', milestoneType: 'custom' as MilestoneType,
    parentMilestoneId: '', startDate: '', targetDate: '',
  });

  // Dependency add form
  const [depForm, setDepForm] = useState({ fromId: '', toId: '', lagDays: '0' });

  // Edit form (selected milestone)
  const [editForm, setEditForm] = useState<Partial<Milestone> & { startDateStr?: string; targetDateStr?: string }>({});

  const selected = revMs.find(m => m.id === selectedId);
  const tree = buildTree(revMs);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSingleCreate() {
    if (!form.name.trim() || !form.targetDate || !activeRevisionId) return;
    createMilestone({
      name: form.name,
      description: form.description,
      milestoneType: form.milestoneType,
      revisionId: activeRevisionId as RevisionId,
      parentMilestoneId: (form.parentMilestoneId || undefined) as MilestoneId | undefined,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      targetDate: new Date(form.targetDate).toISOString(),
      status: 'upcoming',
    });
    setShowSingle(false);
    setForm({ name: '', description: '', milestoneType: 'custom', parentMilestoneId: '', startDate: '', targetDate: '' });
    toast.success('Milestone created');
  }

  function handleBulkCreate(rows: BulkRow[]) {
    if (!activeRevisionId) return;
    for (const row of rows) {
      createMilestone({
        name: row.name,
        description: '',
        milestoneType: row.milestoneType,
        revisionId: activeRevisionId as RevisionId,
        parentMilestoneId: (row.parentId || undefined) as MilestoneId | undefined,
        startDate: row.startDate ? new Date(row.startDate).toISOString() : undefined,
        targetDate: new Date(row.targetDate).toISOString(),
        status: 'upcoming',
      });
    }
    setShowBulkAdd(false);
    toast.success(`${rows.length} milestones created`);
  }

  function handleAddDep() {
    if (!depForm.fromId || !depForm.toId || depForm.fromId === depForm.toId || !activeRevisionId) return;
    const lag = parseInt(depForm.lagDays) || 0;
    createDependency({
      revisionId: activeRevisionId as RevisionId,
      fromMilestoneId: depForm.fromId as MilestoneId,
      toMilestoneId: depForm.toId as MilestoneId,
      lagDays: lag > 0 ? lag : undefined,
      description: '',
    });
    setShowDepModal(false);
    setDepForm({ fromId: '', toId: '', lagDays: '0' });
    toast.success('Dependency added');
  }

  function handleSaveEdit() {
    if (!selected || !editForm.name?.trim()) return;
    updateMilestone(selected.id, {
      name: editForm.name,
      description: editForm.description ?? selected.description,
      status: editForm.status ?? selected.status,
      milestoneType: editForm.milestoneType ?? selected.milestoneType,
      startDate: editForm.startDateStr ? new Date(editForm.startDateStr).toISOString() : undefined,
      targetDate: editForm.targetDateStr ? new Date(editForm.targetDateStr).toISOString() : selected.targetDate,
    });
    toast.success('Milestone updated');
  }

  function openEdit(m: Milestone) {
    setSelectedId(m.id);
    setEditForm({
      name: m.name,
      description: m.description,
      status: m.status,
      milestoneType: m.milestoneType,
      startDateStr: m.startDate ? m.startDate.slice(0, 10) : '',
      targetDateStr: m.targetDate.slice(0, 10),
    });
  }

  function toggleCollapse(id: string) {
    setCollapsed(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // ── Recursive milestone list ────────────────────────────────────────────────

  function renderTree(parentId: string | undefined, depth: number): React.ReactNode {
    const kids = tree.get(parentId) ?? [];
    return kids.map(m => {
      const cpmR = cpm.get(m.id);
      const isParent = (tree.get(m.id)?.length ?? 0) > 0;
      const isCollapsed = collapsed.has(m.id);
      const days = daysUntil(m.targetDate);
      const gates = gatingEvents.filter(g => g.milestoneId === m.id);
      const gatesMet = gates.filter(g => g.isMet).length;
      const depsDriving = revDeps.filter(d => d.toMilestoneId === m.id);
      const depsDriven = revDeps.filter(d => d.fromMilestoneId === m.id);

      return (
        <div key={m.id}>
          <div
            className={`flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === m.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => openEdit(m)}
          >
            {/* Expand/collapse toggle for parent milestones */}
            <button
              className="mt-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
              style={{ visibility: isParent ? 'visible' : 'hidden' }}
              onClick={e => { e.stopPropagation(); toggleCollapse(m.id); }}
            >
              {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm truncate ${isParent ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {m.name}
                </span>
                <Badge color={STATUS_COLORS[m.status]}>{m.status}</Badge>
                <span className="text-xs text-gray-400">{TYPE_LABELS[m.milestoneType]}</span>
                {/* Critical / float badge */}
                {cpmR?.isCritical && m.status !== 'completed' && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">CRITICAL</span>
                )}
                {cpmR && !cpmR.isCritical && cpmR.totalFloat > 0 && m.status !== 'completed' && (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{cpmR.totalFloat}d float</span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                <span>{m.startDate ? `${formatDate(m.startDate)} → ` : ''}{formatDate(m.targetDate)}</span>
                {m.status !== 'completed' && (
                  <span className={days < 0 ? 'text-red-500' : days < 14 ? 'text-orange-500' : ''}>
                    {days < 0 ? `${-days}d overdue` : `${days}d left`}
                  </span>
                )}
                {gates.length > 0 && (
                  <span className={gatesMet === gates.length ? 'text-green-600' : 'text-gray-400'}>
                    {gatesMet}/{gates.length} gates
                  </span>
                )}
                {depsDriving.length > 0 && (
                  <span className="text-gray-400">{depsDriving.length} predecessor{depsDriving.length > 1 ? 's' : ''}</span>
                )}
                {depsDriven.length > 0 && (
                  <span className="text-gray-400">drives {depsDriven.length}</span>
                )}
              </div>
            </div>
          </div>

          {/* Children */}
          {!isCollapsed && isParent && (
            <div>{renderTree(m.id, depth + 1)}</div>
          )}
        </div>
      );
    });
  }

  // ── No revision guard ───────────────────────────────────────────────────────

  if (!activeRevisionId) {
    return (
      <div>
        <PageHeader title="Planning" />
        <EmptyState title="No revision selected" description="Select a family, variant, and revision from the context selector." />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const msOptions = revMs.map(m => ({ value: m.id, label: m.name }));
  const topLevelMs = revMs.filter(m => !m.parentMilestoneId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planning"
        description={`${revMs.length} milestones · ${criticalCount} on critical path`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Link2 className="h-4 w-4" />} onClick={() => setShowDepModal(true)} disabled={revMs.length < 2}>
              Add Dependency
            </Button>
            <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowSingle(true)}>
              Add Milestone
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowBulkAdd(true)}>
              Bulk Add
            </Button>
          </div>
        }
      />

      {/* Legend */}
      {revMs.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-red-400 inline-block" /> Critical path</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-blue-400 inline-block" /> Has float</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-green-400 inline-block" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 border-2 border-gray-500 rotate-45" /> Point milestone</span>
          <span className="flex items-center gap-1.5"><span className="border-t-2 border-dashed border-gray-400 w-6 inline-block" />→ Dependency</span>
          <span className="flex items-center gap-1.5"><span className="border-t-2 border-red-400 w-6 inline-block" />→ Critical dependency</span>
        </div>
      )}

      {revMs.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No milestones"
          description="Add milestones individually or bulk-add an entire program schedule at once."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowSingle(true)}>Add Milestone</Button>
              <Button onClick={() => setShowBulkAdd(true)}>Bulk Add</Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

          {/* ── Left: hierarchy list ── */}
          <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Milestones</h3>
            <div className="space-y-0.5">{renderTree(undefined, 0)}</div>
          </div>

          {/* ── Right: Gantt + edit panel ── */}
          <div className="xl:col-span-3 space-y-4">
            <GanttChart
              milestones={revMs}
              dependencies={revDeps}
              cpm={cpm}
              onSelectMilestone={id => openEdit(revMs.find(m => m.id === id)!)}
              selectedId={selectedId}
            />

            {/* Dependency list */}
            {revDeps.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dependencies</h3>
                <div className="space-y-1">
                  {revDeps.map(dep => {
                    const from = revMs.find(m => m.id === dep.fromMilestoneId);
                    const to = revMs.find(m => m.id === dep.toMilestoneId);
                    if (!from || !to) return null;
                    const isCrit = cpm.get(from.id)?.isCritical && cpm.get(to.id)?.isCritical;
                    return (
                      <div key={dep.id} className="flex items-center justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                        <span className="flex items-center gap-1.5">
                          {isCrit && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                          <span className={isCrit ? 'font-medium text-red-700' : ''}>{from.name}</span>
                          <span className="text-gray-400">→</span>
                          <span className={isCrit ? 'font-medium text-red-700' : ''}>{to.name}</span>
                          {dep.lagDays ? <span className="text-gray-400">(+{dep.lagDays}d lag)</span> : null}
                        </span>
                        <button
                          onClick={() => { deleteDependency(dep.id as DependencyId); toast.success('Dependency removed'); }}
                          className="text-gray-300 hover:text-red-400 transition-colors ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Inline edit panel ── */}
            {selected && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">{selected.name}</h3>
                  <button onClick={() => { deleteMilestone(selected.id); setSelectedId(null); toast.success('Deleted'); }} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Name" value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  <Select label="Status" value={editForm.status ?? 'upcoming'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as MilestoneStatus }))} options={STATUS_OPTIONS} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Start date" type="date" value={editForm.startDateStr ?? ''} onChange={e => setEditForm(f => ({ ...f, startDateStr: e.target.value }))} />
                  <Input label="Target date" type="date" value={editForm.targetDateStr ?? ''} onChange={e => setEditForm(f => ({ ...f, targetDateStr: e.target.value }))} />
                </div>

                {/* CPM summary for selected milestone */}
                {cpm.has(selected.id) && (() => {
                  const r = cpm.get(selected.id)!;
                  return (
                    <div className={`rounded-md px-3 py-2 text-xs ${r.isCritical ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                      {r.isCritical
                        ? '⚠ On the critical path — any slip delays the program end date.'
                        : `${r.totalFloat}d total float — can slip ${r.totalFloat} days before hitting the critical path.`}
                    </div>
                  );
                })()}

                {/* Gating events */}
                {gatingEvents.filter(g => g.milestoneId === selected.id).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Gate criteria</p>
                    {gatingEvents.filter(g => g.milestoneId === selected.id).map(g => (
                      <div key={g.id} className="flex items-center gap-2 text-xs">
                        {g.isMet
                          ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          : <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
                        <span className={g.isMet ? 'text-green-700' : 'text-gray-600'}>{g.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                  {selected.status !== 'completed' && (
                    <Button size="sm" variant="secondary" onClick={() => {
                      updateMilestone(selected.id, { status: 'completed', actualDate: new Date().toISOString() });
                      toast.success('Marked complete');
                    }}>
                      Mark Complete
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedId(null)}>Dismiss</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Single add modal ── */}
      <Modal open={showSingle} onClose={() => setShowSingle(false)} title="Add Milestone">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select label="Type" value={form.milestoneType} onChange={e => setForm(f => ({ ...f, milestoneType: e.target.value as MilestoneType }))} options={TYPE_OPTIONS} />
          </div>
          <Select
            label="Parent phase (optional)"
            value={form.parentMilestoneId}
            onChange={e => setForm(f => ({ ...f, parentMilestoneId: e.target.value }))}
            options={[{ value: '', label: '— none —' }, ...topLevelMs.map(m => ({ value: m.id, label: m.name }))]}
          />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date (optional)" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="Target date *" type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSingle(false)}>Cancel</Button>
            <Button onClick={handleSingleCreate} disabled={!form.name.trim() || !form.targetDate}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* ── Bulk add modal ── */}
      <Modal open={showBulkAdd} onClose={() => setShowBulkAdd(false)} title="Bulk Add Milestones" wide>
        <BulkAddModal parents={topLevelMs} onSubmit={handleBulkCreate} onClose={() => setShowBulkAdd(false)} />
      </Modal>

      {/* ── Add dependency modal ── */}
      <Modal open={showDepModal} onClose={() => setShowDepModal(false)} title="Add Dependency">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Finish-to-start: the successor cannot start until the predecessor is complete.</p>
          <Select
            label="Predecessor (must finish first)"
            value={depForm.fromId}
            onChange={e => setDepForm(f => ({ ...f, fromId: e.target.value }))}
            options={[{ value: '', label: 'Select milestone…' }, ...msOptions]}
          />
          <Select
            label="Successor (can start after)"
            value={depForm.toId}
            onChange={e => setDepForm(f => ({ ...f, toId: e.target.value }))}
            options={[{ value: '', label: 'Select milestone…' }, ...msOptions.filter(o => o.value !== depForm.fromId)]}
          />
          <Input
            label="Lag (days, optional)"
            type="number"
            value={depForm.lagDays}
            onChange={e => setDepForm(f => ({ ...f, lagDays: e.target.value }))}
            placeholder="0"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDepModal(false)}>Cancel</Button>
            <Button onClick={handleAddDep} disabled={!depForm.fromId || !depForm.toId}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
