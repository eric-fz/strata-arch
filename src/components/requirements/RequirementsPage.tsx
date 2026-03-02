import { useState } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { SearchInput } from '../ui/SearchInput.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { Table, type ColumnDef } from '../ui/Table.tsx';
import { Sheet } from '../ui/Sheet.tsx';
import { Modal } from '../ui/Modal.tsx';
import { RequirementForm } from './RequirementForm.tsx';
import { RequirementDetailSheet } from './RequirementDetailSheet.tsx';
import { ImportExcelDialog } from './ImportExcelDialog.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useActiveRequirements } from '../../store/selectors.ts';
import { useFilterSort } from '../../hooks/useFilterSort.ts';
import { CATEGORY_META, STATUS_META, PRIORITY_META } from '../../types/display-meta.ts';
import { exportRequirementsToExcel } from '../../lib/excel.ts';
import type { Requirement, RequirementId } from '../../types/index.ts';
import { Plus, FileText, Link as LinkIcon, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RequirementsPage() {
  const requirements = useActiveRequirements();
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedId, setSelectedId] = useState<RequirementId | null>(null);

  const { search, setSearch, filtered, paged, sortField, sortDir, toggleSort, page, setPage, totalPages, filters, setFilter } = useFilterSort<Requirement>({
    items: requirements,
    searchFields: ['title', 'identifier', 'description', 'owner'],
    defaultSortField: 'identifier',
    pageSize: 20,
  });

  const selected = requirements.find(r => r.id === selectedId);

  function handleExport() {
    if (filtered.length === 0) return;
    exportRequirementsToExcel(filtered);
  }

  const columns: ColumnDef<Requirement>[] = [
    {
      key: 'identifier', header: 'ID', sortable: true,
      render: r => <span className="font-mono text-xs font-medium text-primary-700">{r.identifier}</span>,
      className: 'w-24',
    },
    {
      key: 'title', header: 'Title', sortable: true,
      render: r => <span className="font-medium text-gray-900">{r.title}</span>,
    },
    {
      key: 'category', header: 'Category', sortable: true,
      render: r => <Badge color={CATEGORY_META[r.category].color}>{CATEGORY_META[r.category].label}</Badge>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: r => <Badge color={STATUS_META[r.status].color}>{STATUS_META[r.status].label}</Badge>,
    },
    {
      key: 'priority', header: 'Priority', sortable: true,
      render: r => <Badge color={PRIORITY_META[r.priority].color}>{PRIORITY_META[r.priority].label}</Badge>,
    },
    {
      key: 'owner', header: 'Owner', sortable: true,
      render: r => <span className="text-gray-600">{r.owner}</span>,
      className: 'w-32',
    },
  ];

  if (!activeRevisionId) {
    return (
      <div>
        <PageHeader title="Requirements" />
        <EmptyState title="No revision selected" description="Select a family, variant, and revision from the context selector." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Requirements"
        description={`${requirements.length} requirements in active revision`}
        actions={
          <div className="flex gap-2">
            <Link to="/requirements/traceability">
              <Button variant="secondary" icon={<LinkIcon className="h-4 w-4" />}>Traceability</Button>
            </Link>
            <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => setShowImport(true)}>Import</Button>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExport} disabled={filtered.length === 0}>Export</Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>New Requirement</Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search requirements..." className="w-64" />
        <div className="flex gap-2">
          {(['system', 'subsystem', 'interface', 'safety', 'performance', 'regulatory', 'manufacturing', 'service'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                const cur = filters['category'] ?? [];
                setFilter('category', cur.includes(cat) ? cur.filter(c => c !== cat) : [...cur, cat]);
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                filters['category']?.includes(cat) ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_META[cat].prefix}
            </button>
          ))}
        </div>
      </div>

      {paged.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No requirements found"
          description={search ? 'Try adjusting your search or filters.' : 'Create your first requirement or import from Excel.'}
          action={!search ? (
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => setShowImport(true)}>Import from Excel</Button>
              <Button onClick={() => setShowCreate(true)}>Create Requirement</Button>
            </div>
          ) : undefined}
        />
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table
              columns={columns}
              data={paged}
              keyExtractor={r => r.id}
              onRowClick={r => setSelectedId(r.id)}
              sortField={sortField as string}
              sortDir={sortDir}
              onSort={f => toggleSort(f as keyof Requirement)}
            />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">Showing {page * 20 + 1}-{Math.min((page + 1) * 20, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
                <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Sheet open={!!selected} onClose={() => setSelectedId(null)} title={selected?.identifier}>
        {selected && <RequirementDetailSheet requirement={selected} onClose={() => setSelectedId(null)} />}
      </Sheet>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Requirement" wide>
        <RequirementForm onClose={() => setShowCreate(false)} />
      </Modal>

      <ImportExcelDialog open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
