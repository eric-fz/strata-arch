import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Sheet } from '../ui/Sheet.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction.ts';
import { useToast } from '../../hooks/useToast.ts';
import type { ArchitectureElement, ArchitectureElementType, ArchElementId, RevisionId } from '../../types/index.ts';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const DOMAIN_COLORS: Record<ArchitectureElementType, { fill: string; stroke: string; label: string }> = {
  mechanical:        { fill: '#dbeafe', stroke: '#3b82f6', label: 'Mechanical' },
  electrical:        { fill: '#fef3c7', stroke: '#f59e0b', label: 'Electrical' },
  compute:           { fill: '#d1fae5', stroke: '#10b981', label: 'Compute' },
  networking:        { fill: '#e0e7ff', stroke: '#6366f1', label: 'Networking' },
  autonomy_dataflow: { fill: '#fce7f3', stroke: '#ec4899', label: 'Autonomy' },
  safety_interlock:  { fill: '#fee2e2', stroke: '#ef4444', label: 'Safety' },
};

export function ArchitecturePage() {
  const elements = useAppStore(s => s.architectureElements);
  const interfaces = useAppStore(s => s.architectureInterfaces);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createArchElement = useAppStore(s => s.createArchElement);
  const updateArchElement = useAppStore(s => s.updateArchElement);
  const deleteArchElement = useAppStore(s => s.deleteArchElement);
  const toast = useToast();
  const { viewport, onMouseDown, onMouseMove, onMouseUp, onWheel, resetViewport, setViewport } = useCanvasInteraction();

  const [selectedId, setSelectedId] = useState<ArchElementId | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [domainFilter, setDomainFilter] = useState<ArchitectureElementType | 'all'>('all');
  const [dragging, setDragging] = useState<{ id: ArchElementId; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const revElements = elements.filter(e => e.revisionId === activeRevisionId);
  const revInterfaces = interfaces.filter(i => i.revisionId === activeRevisionId);
  const visibleElements = domainFilter === 'all' ? revElements : revElements.filter(e => e.domainType === domainFilter);
  const selected = revElements.find(e => e.id === selectedId);

  const [createForm, setCreateForm] = useState({ name: '', description: '', domainType: 'compute' as ArchitectureElementType });

  function handleCreate() {
    if (!createForm.name.trim() || !activeRevisionId) return;
    createArchElement({
      ...createForm,
      revisionId: activeRevisionId as RevisionId,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: 160,
      height: 80,
      ports: [],
    });
    setShowCreate(false);
    setCreateForm({ name: '', description: '', domainType: 'compute' });
    toast.success('Block created');
  }

  function handleBlockMouseDown(e: React.MouseEvent, el: ArchitectureElement) {
    e.stopPropagation();
    setSelectedId(el.id);
    setDragging({ id: el.id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y });
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / viewport.zoom;
      const dy = (e.clientY - dragging.startY) / viewport.zoom;
      updateArchElement(dragging.id, { x: dragging.origX + dx, y: dragging.origY + dy });
    } else {
      onMouseMove(e);
    }
  }

  function handleCanvasMouseUp() {
    setDragging(null);
    onMouseUp();
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Architecture" /><EmptyState title="No revision selected" description="Select a revision first." /></div>;
  }

  function getPortPosition(el: ArchitectureElement, portId: string): { x: number; y: number } {
    const port = el.ports.find(p => p.id === portId);
    if (!port) return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
    switch (port.side) {
      case 'top': return { x: el.x + el.width / 2, y: el.y };
      case 'bottom': return { x: el.x + el.width / 2, y: el.y + el.height };
      case 'left': return { x: el.x, y: el.y + el.height / 2 };
      case 'right': return { x: el.x + el.width, y: el.y + el.height / 2 };
    }
  }

  return (
    <div className="h-full flex flex-col -m-6">
      <div className="px-6 pt-6 pb-3 border-b bg-white">
        <PageHeader
          title="Architecture"
          description={`${revElements.length} blocks, ${revInterfaces.length} connections`}
          actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Add Block</Button>}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-2 py-1 rounded text-xs font-medium ${domainFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >All</button>
          {Object.entries(DOMAIN_COLORS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setDomainFilter(k as ArchitectureElementType)}
              className={`px-2 py-1 rounded text-xs font-medium ${domainFilter === k ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >{v.label}</button>
          ))}
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setViewport(v => ({ ...v, zoom: Math.min(3, v.zoom * 1.2) }))}><ZoomIn className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setViewport(v => ({ ...v, zoom: Math.max(0.2, v.zoom * 0.8) }))}><ZoomOut className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={resetViewport}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-[#f9fafb]"
        onMouseDown={onMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={onWheel}
      >
        <svg width="100%" height="100%" className="select-none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
            </pattern>
          </defs>
          <g transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}>
            <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

            {/* Connections */}
            {revInterfaces.map(iface => {
              const src = revElements.find(e => e.id === iface.sourceElementId);
              const tgt = revElements.find(e => e.id === iface.targetElementId);
              if (!src || !tgt) return null;
              const p1 = getPortPosition(src, iface.sourcePortId);
              const p2 = getPortPosition(tgt, iface.targetPortId);
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              return (
                <g key={iface.id}>
                  <path
                    d={`M ${p1.x} ${p1.y} C ${p1.x} ${my}, ${p2.x} ${my}, ${p2.x} ${p2.y}`}
                    fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2"
                  />
                  <text x={mx} y={my - 6} textAnchor="middle" fill="#64748b" fontSize="10">{iface.label}</text>
                </g>
              );
            })}

            {/* Blocks */}
            {visibleElements.map(el => {
              const dc = DOMAIN_COLORS[el.domainType];
              const isSelected = el.id === selectedId;
              return (
                <g key={el.id} onMouseDown={e => handleBlockMouseDown(e, el)} className="cursor-move">
                  <rect
                    x={el.x} y={el.y} width={el.width} height={el.height}
                    rx="6" ry="6"
                    fill={dc.fill} stroke={isSelected ? '#1d4ed8' : dc.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text x={el.x + el.width / 2} y={el.y + el.height / 2 - 6} textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="600">
                    {el.name}
                  </text>
                  <text x={el.x + el.width / 2} y={el.y + el.height / 2 + 10} textAnchor="middle" fill="#64748b" fontSize="9">
                    {dc.label}
                  </text>
                  {/* Ports */}
                  {el.ports.map(port => {
                    const pos = getPortPosition(el, port.id);
                    return (
                      <g key={port.id}>
                        <circle cx={pos.x} cy={pos.y} r="4" fill="white" stroke={dc.stroke} strokeWidth="1.5" />
                        <title>{port.label}</title>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <Badge color={DOMAIN_COLORS[selected.domainType].label === 'Safety' ? 'red' : 'blue'}>{DOMAIN_COLORS[selected.domainType].label}</Badge>
            <p className="text-sm text-gray-700">{selected.description}</p>
            <div className="text-xs text-gray-500">Position: ({Math.round(selected.x)}, {Math.round(selected.y)})</div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ports</h4>
              {selected.ports.length === 0 ? (
                <p className="text-sm text-gray-400">No ports</p>
              ) : (
                <div className="space-y-1">
                  {selected.ports.map(p => (
                    <div key={p.id} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="capitalize text-xs text-gray-500">{p.side}</span>
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button variant="danger" size="sm" onClick={() => { deleteArchElement(selected.id); setSelectedId(null); toast.success('Block deleted'); }}>
              Delete Block
            </Button>
          </div>
        )}
      </Sheet>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Architecture Block">
        <div className="space-y-4">
          <Input label="Name" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
          <Select label="Domain" value={createForm.domainType} onChange={e => setCreateForm(f => ({ ...f, domainType: e.target.value as ArchitectureElementType }))}
            options={Object.entries(DOMAIN_COLORS).map(([k, v]) => ({ value: k, label: v.label }))} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
