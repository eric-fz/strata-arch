import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { StatCard } from '../ui/StatCard.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useBomCostRollup } from '../../store/selectors.ts';
import { useToast } from '../../hooks/useToast.ts';
import type { BomItemCategory, RevisionId } from '../../types/index.ts';
import { Plus, Package, DollarSign, ChevronRight, ChevronDown } from 'lucide-react';

const CAT_LABELS: Record<BomItemCategory, string> = {
  mechanical: 'Mechanical', electrical: 'Electrical', pcb: 'PCB', fastener: 'Fastener',
  cable: 'Cable', sensor: 'Sensor', actuator: 'Actuator', compute: 'Compute',
  enclosure: 'Enclosure', consumable: 'Consumable', other: 'Other',
};

export function BomPage() {
  const bomItems = useAppStore(s => s.bomItems);
  const suppliers = useAppStore(s => s.suppliers);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createBomItem = useAppStore(s => s.createBomItem);
  const costRollup = useBomCostRollup();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ partNumber: '', name: '', description: '', category: 'mechanical' as BomItemCategory, quantity: '1', unitCost: '0', currency: 'USD' });

  const revItems = bomItems.filter(b => b.revisionId === activeRevisionId);
  const topLevel = revItems.filter(b => !b.parentItemId);

  function toggleExpand(id: string) {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleCreate() {
    if (!form.name.trim() || !activeRevisionId) return;
    createBomItem({ ...form, revisionId: activeRevisionId as RevisionId, quantity: parseInt(form.quantity) || 1, unitCost: parseFloat(form.unitCost) || 0 });
    setShowCreate(false);
    setForm({ partNumber: '', name: '', description: '', category: 'mechanical', quantity: '1', unitCost: '0', currency: 'USD' });
    toast.success('BOM item created');
  }

  function renderItem(item: typeof revItems[0], depth: number) {
    const children = revItems.filter(b => b.parentItemId === item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(item.id);
    const extended = item.quantity * item.unitCost;
    const supplier = suppliers.find(s => s.id === item.supplierId);

    return (
      <div key={item.id}>
        <div className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 border-b border-gray-100 text-sm`} style={{ paddingLeft: `${12 + depth * 24}px` }}>
          <button onClick={() => hasChildren && toggleExpand(item.id)} className="w-5 flex-shrink-0">
            {hasChildren && (isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />)}
          </button>
          <span className="font-mono text-xs text-gray-500 w-28 flex-shrink-0">{item.partNumber}</span>
          <span className="font-medium text-gray-900 flex-1">{item.name}</span>
          <Badge color="blue">{CAT_LABELS[item.category]}</Badge>
          <span className="w-12 text-right text-gray-600">{item.quantity}</span>
          <span className="w-24 text-right text-gray-600">${item.unitCost.toLocaleString()}</span>
          <span className="w-28 text-right font-medium text-gray-900">${extended.toLocaleString()}</span>
          {supplier && <span className="text-xs text-gray-500 w-24 truncate">{supplier.name}</span>}
        </div>
        {isExpanded && children.map(c => renderItem(c, depth + 1))}
      </div>
    );
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Bill of Materials" /><EmptyState title="No revision selected" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Bill of Materials"
        description={`${revItems.length} items`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Add Item</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Cost" value={`$${costRollup.total.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Line Items" value={costRollup.itemCount} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Categories" value={Object.keys(costRollup.byCategory).length} />
      </div>

      {revItems.length === 0 ? (
        <EmptyState icon={<Package className="h-12 w-12" />} title="Empty BOM" description="Add parts to your bill of materials." action={<Button onClick={() => setShowCreate(true)}>Add Item</Button>} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
            <span className="w-5" />
            <span className="w-28">Part Number</span>
            <span className="flex-1">Name</span>
            <span className="w-20">Category</span>
            <span className="w-12 text-right">Qty</span>
            <span className="w-24 text-right">Unit Cost</span>
            <span className="w-28 text-right">Extended</span>
            <span className="w-24">Supplier</span>
          </div>
          {topLevel.map(item => renderItem(item, 0))}
          <div className="flex items-center justify-end gap-2 py-3 px-3 bg-gray-50 border-t font-semibold">
            <span className="text-gray-700">Total:</span>
            <span className="text-gray-900">${costRollup.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add BOM Item">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Part Number" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} placeholder="MOT-HIP-150" />
            <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-3 gap-4">
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as BomItemCategory }))}
              options={Object.entries(CAT_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            <Input label="Unit Cost ($)" type="number" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate}>Add</Button></div>
        </div>
      </Modal>
    </div>
  );
}
