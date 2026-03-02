import { useParams } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Card } from '../ui/Card.tsx';
import { Table, type ColumnDef } from '../ui/Table.tsx';
import { Breadcrumbs } from '../ui/Breadcrumbs.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { formatDate } from '../../lib/date.ts';
import type { ReleaseStatus } from '../../types/index.ts';
import type { FieldedUnit } from '../../types/releases.ts';

const STATUS_COLORS: Record<ReleaseStatus, string> = {
  planning: 'gray', candidate: 'yellow', released: 'green', recalled: 'red', end_of_life: 'slate',
};

export function ReleaseDetailPage() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const releases = useAppStore(s => s.releases);
  const fieldedUnits = useAppStore(s => s.fieldedUnits);
  const release = releases.find(r => r.id === releaseId);
  if (!release) return <EmptyState title="Release not found" />;

  const units = fieldedUnits.filter(u => u.releaseId === release.id);

  const unitColumns: ColumnDef<FieldedUnit>[] = [
    { key: 'serialNumber', header: 'Serial', render: u => <span className="font-mono">{u.serialNumber}</span> },
    { key: 'location', header: 'Location', render: u => u.location },
    { key: 'status', header: 'Status', render: u => <Badge color={u.status === 'active' ? 'green' : 'yellow'}>{u.status}</Badge> },
    { key: 'deployedAt', header: 'Deployed', render: u => formatDate(u.deployedAt) },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Releases', href: '/releases' }, { label: release.name }]} />
      <PageHeader title={release.name} description={`v${release.version}`} />
      <Badge color={STATUS_COLORS[release.status]} className="mb-6">{release.status}</Badge>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card header={<h3 className="text-sm font-semibold">Details</h3>}>
          <p className="text-sm text-gray-700">{release.description}</p>
          <div className="mt-3 text-xs text-gray-500">
            {release.releaseDate && <div>Release date: {formatDate(release.releaseDate)}</div>}
            <div>Created: {formatDate(release.createdAt)}</div>
          </div>
        </Card>
        <Card header={<h3 className="text-sm font-semibold">Known Issues</h3>}>
          <p className="text-sm text-gray-700">{release.knownIssues || 'None'}</p>
        </Card>
      </div>

      <Card header={<h3 className="text-sm font-semibold">Fielded Units ({units.length})</h3>} className="mt-6">
        <Table columns={unitColumns} data={units} keyExtractor={u => u.id} emptyMessage="No fielded units for this release." />
      </Card>
    </div>
  );
}
