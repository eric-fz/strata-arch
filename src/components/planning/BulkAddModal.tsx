import { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Plus, Trash2 } from 'lucide-react';
import type { MilestoneType, MilestoneStatus } from '../../types/enums.ts';
import type { Milestone } from '../../types/planning.ts';

const TYPE_OPTIONS: { value: MilestoneType; label: string }[] = [
  { value: 'pdr', label: 'PDR' },
  { value: 'cdr', label: 'CDR' },
  { value: 'fai', label: 'FAI' },
  { value: 'dvt', label: 'DVT' },
  { value: 'pvt', label: 'PVT' },
  { value: 'production_release', label: 'Production' },
  { value: 'custom', label: 'Custom' },
];

interface Row {
  name: string;
  milestoneType: MilestoneType;
  parentId: string;
  startDate: string;
  targetDate: string;
}

function emptyRow(): Row {
  return { name: '', milestoneType: 'custom', parentId: '', startDate: '', targetDate: '' };
}

interface Props {
  parents: Milestone[];  // existing top-level milestones for parent picker
  onSubmit: (rows: Row[]) => void;
  onClose: () => void;
}

export type BulkRow = Row;

export function BulkAddModal({ parents, onSubmit, onClose }: Props) {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);

  function setField<K extends keyof Row>(idx: number, key: K, val: Row[K]) {
    setRows(r => r.map((row, i) => i === idx ? { ...row, [key]: val } : row));
  }

  function addRow() { setRows(r => [...r, emptyRow()]); }
  function removeRow(idx: number) { setRows(r => r.filter((_, i) => i !== idx)); }

  function handleSubmit() {
    const valid = rows.filter(r => r.name.trim() && r.targetDate);
    if (valid.length === 0) return;
    onSubmit(valid);
  }

  const parentOptions = [
    { value: '', label: '— none (top-level) —' },
    ...parents.map(p => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Fill in as many rows as you need. Rows with an empty Name or Target Date are ignored.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-2 py-2 font-medium w-48">Name *</th>
              <th className="text-left px-2 py-2 font-medium w-32">Type</th>
              <th className="text-left px-2 py-2 font-medium w-36">Parent phase</th>
              <th className="text-left px-2 py-2 font-medium w-32">Start date</th>
              <th className="text-left px-2 py-2 font-medium w-32">Target date *</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-1 py-1">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Milestone name"
                    value={row.name}
                    onChange={e => setField(i, 'name', e.target.value)}
                  />
                </td>
                <td className="px-1 py-1">
                  <select
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                    value={row.milestoneType}
                    onChange={e => setField(i, 'milestoneType', e.target.value as MilestoneType)}
                  >
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <select
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                    value={row.parentId}
                    onChange={e => setField(i, 'parentId', e.target.value)}
                  >
                    {parentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1">
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                    value={row.startDate}
                    onChange={e => setField(i, 'startDate', e.target.value)}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                    value={row.targetDate}
                    onChange={e => setField(i, 'targetDate', e.target.value)}
                  />
                </td>
                <td className="px-1 py-1">
                  <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
          Add {rows.filter(r => r.name.trim() && r.targetDate).length || ''} Milestones
        </Button>
      </div>
    </div>
  );
}

// Re-export Select + Input for use in PlanningPage inline forms
export { Select, Input };
export type { MilestoneStatus };
