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
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate, daysUntil } from '../../lib/date.ts';
import type { MilestoneType, MilestoneStatus, RevisionId } from '../../types/index.ts';
import { Plus, Calendar, Flag, CheckCircle, Clock } from 'lucide-react';

const MS_TYPE_LABELS: Record<MilestoneType, string> = {
  pdr: 'PDR', cdr: 'CDR', fai: 'FAI', dvt: 'DVT', pvt: 'PVT', production_release: 'Production', custom: 'Custom',
};

const MS_STATUS_COLORS: Record<MilestoneStatus, string> = {
  upcoming: 'blue', in_progress: 'yellow', completed: 'green', missed: 'red',
};

export function PlanningPage() {
  const milestones = useAppStore(s => s.milestones);
  const gatingEvents = useAppStore(s => s.gatingEvents);
  const dependencies = useAppStore(s => s.dependencies);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createMilestone = useAppStore(s => s.createMilestone);
  const updateMilestone = useAppStore(s => s.updateMilestone);
  const toast = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', milestoneType: 'custom' as MilestoneType, targetDate: '' });

  const revMs = milestones.filter(m => m.revisionId === activeRevisionId).sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  function handleCreate() {
    if (!form.name.trim() || !form.targetDate || !activeRevisionId) return;
    createMilestone({ ...form, revisionId: activeRevisionId as RevisionId, status: 'upcoming', targetDate: new Date(form.targetDate).toISOString() });
    setShowCreate(false);
    setForm({ name: '', description: '', milestoneType: 'custom', targetDate: '' });
    toast.success('Milestone created');
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Planning" /><EmptyState title="No revision selected" /></div>;
  }

  // Gantt calculation
  const allDates = revMs.flatMap(m => [new Date(m.targetDate).getTime(), m.actualDate ? new Date(m.actualDate).getTime() : 0]).filter(Boolean);
  const minDate = allDates.length > 0 ? Math.min(...allDates) - 7 * 86400000 : Date.now();
  const maxDate = allDates.length > 0 ? Math.max(...allDates) + 30 * 86400000 : Date.now() + 180 * 86400000;
  const range = maxDate - minDate;
  const today = Date.now();

  function dateToX(d: number) {
    return ((d - minDate) / range) * 100;
  }

  return (
    <div>
      <PageHeader
        title="Planning"
        description={`${revMs.length} milestones`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Add Milestone</Button>}
      />

      {revMs.length === 0 ? (
        <EmptyState icon={<Calendar className="h-12 w-12" />} title="No milestones" action={<Button onClick={() => setShowCreate(true)}>Create Milestone</Button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gantt */}
          <div className="lg:col-span-2">
            <Card header={<h3 className="text-sm font-semibold text-gray-700">Timeline</h3>}>
              <div className="relative h-64 overflow-x-auto">
                {/* Today line */}
                <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${dateToX(today)}%` }}>
                  <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-red-500 font-medium">Today</span>
                </div>
                {/* Milestone bars */}
                {revMs.map((m, i) => {
                  const x = dateToX(new Date(m.targetDate).getTime());
                  const dep = dependencies.find(d => d.toMilestoneId === m.id);
                  const fromMs = dep ? revMs.find(ms => ms.id === dep.fromMilestoneId) : null;
                  const startX = fromMs ? dateToX(new Date(fromMs.targetDate).getTime()) : Math.max(0, x - 10);
                  const barColor = m.status === 'completed' ? 'bg-green-400' : m.status === 'missed' ? 'bg-red-400' : m.status === 'in_progress' ? 'bg-yellow-400' : 'bg-blue-400';
                  return (
                    <div key={m.id} className="absolute h-7 flex items-center" style={{ top: `${i * 36 + 20}px`, left: `${startX}%`, width: `${Math.max(x - startX, 2)}%` }}>
                      <div className={`h-full w-full rounded ${barColor} opacity-80`} />
                      <div className="absolute -right-1 w-3 h-3 rounded-full bg-white border-2 border-gray-600" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                      <span className="absolute -right-2 top-8 text-[10px] text-gray-600 whitespace-nowrap">{m.name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Milestones list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Milestones</h3>
            {revMs.map(m => {
              const days = daysUntil(m.targetDate);
              const gates = gatingEvents.filter(g => g.milestoneId === m.id);
              const gatesMet = gates.filter(g => g.isMet).length;
              return (
                <Card key={m.id}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900 text-sm">{m.name}</h4>
                    </div>
                    <Badge color={MS_STATUS_COLORS[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{m.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Target: {formatDate(m.targetDate)}</span>
                    {m.status !== 'completed' && (
                      <Badge color={days < 0 ? 'red' : days < 14 ? 'orange' : 'gray'}>
                        {days < 0 ? `${-days}d overdue` : `${days}d left`}
                      </Badge>
                    )}
                  </div>
                  {gates.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500">Gates: {gatesMet}/{gates.length} met</span>
                      <div className="mt-1 space-y-0.5">
                        {gates.map(g => (
                          <div key={g.id} className="flex items-center gap-1">
                            {g.isMet ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-gray-400" />}
                            <span className={g.isMet ? 'text-green-700' : 'text-gray-600'}>{g.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.status !== 'completed' && (
                    <div className="mt-2">
                      <Button size="sm" variant="ghost" onClick={() => { updateMilestone(m.id, { status: 'completed', actualDate: new Date().toISOString() }); toast.success('Milestone completed'); }}>
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Milestone">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.milestoneType} onChange={e => setForm(f => ({ ...f, milestoneType: e.target.value as MilestoneType }))}
              options={Object.entries(MS_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            <Input label="Target Date" type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></div>
        </div>
      </Modal>
    </div>
  );
}
