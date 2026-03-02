import { useParams } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Breadcrumbs } from '../ui/Breadcrumbs.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate } from '../../lib/date.ts';
import type { ChangeProposalStatus } from '../../types/index.ts';

export function ChangeDetailPage() {
  const { changeId } = useParams<{ changeId: string }>();
  const changeProposals = useAppStore(s => s.changeProposals);
  const requirements = useAppStore(s => s.requirements);
  const updateChangeProposal = useAppStore(s => s.updateChangeProposal);
  const toast = useToast();

  const cp = changeProposals.find(c => c.id === changeId);
  if (!cp) return <EmptyState title="Change proposal not found" />;

  const cpId = cp.id;
  const impactedReqs = requirements.filter(r => cp.impactedRequirementIds.includes(r.id));

  function advance(status: ChangeProposalStatus) {
    updateChangeProposal(cpId, { status });
    toast.success(`Status changed to ${status}`);
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Changes', href: '/changes' }, { label: cp.title }]} />
      <PageHeader title={cp.title} description={`Proposed by ${cp.proposedBy}`} />

      <div className="flex gap-2 mb-6">
        <Badge color={cp.impact === 'critical' ? 'red' : cp.impact === 'high' ? 'orange' : 'yellow'}>{cp.impact} impact</Badge>
        <Badge color="blue">{cp.status.replace('_', ' ')}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="text-sm font-semibold">Description</h3>}>
          <p className="text-sm text-gray-700">{cp.description}</p>
        </Card>
        <Card header={<h3 className="text-sm font-semibold">Rationale</h3>}>
          <p className="text-sm text-gray-700">{cp.rationale}</p>
        </Card>
      </div>

      {impactedReqs.length > 0 && (
        <Card header={<h3 className="text-sm font-semibold">Impacted Requirements</h3>} className="mt-6">
          <div className="space-y-2">
            {impactedReqs.map(r => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-primary-700">{r.identifier}</span>
                <span className="text-gray-700">{r.title}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2 mt-6">
        {cp.status === 'draft' && <Button onClick={() => advance('submitted')}>Submit</Button>}
        {cp.status === 'submitted' && <Button onClick={() => advance('under_review')}>Start Review</Button>}
        {cp.status === 'under_review' && (
          <>
            <Button onClick={() => advance('approved')}>Approve</Button>
            <Button variant="danger" onClick={() => advance('rejected')}>Reject</Button>
          </>
        )}
        {cp.status === 'approved' && <Button onClick={() => advance('implemented')}>Mark Implemented</Button>}
        {cp.status === 'implemented' && <Button variant="secondary" onClick={() => advance('closed')}>Close</Button>}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        Created: {formatDate(cp.createdAt)} | Updated: {formatDate(cp.updatedAt)}
      </div>
    </div>
  );
}
