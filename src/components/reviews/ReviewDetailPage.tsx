import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Textarea } from '../ui/Textarea.tsx';
import { Select } from '../ui/Select.tsx';
import { Breadcrumbs } from '../ui/Breadcrumbs.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { formatDate } from '../../lib/date.ts';
import type { ReviewDecision, RequirementId, ReviewId } from '../../types/index.ts';
import { CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';

const DECISION_ICONS = {
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  needs_changes: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
};

export function ReviewDetailPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const reviews = useAppStore(s => s.reviews);
  const signOffs = useAppStore(s => s.signOffs);
  const requirements = useAppStore(s => s.requirements);
  const addSignOff = useAppStore(s => s.addSignOff);
  const updateReview = useAppStore(s => s.updateReview);
  const toast = useToast();

  const [showSignOff, setShowSignOff] = useState(false);
  const [soForm, setSoForm] = useState({ requirementId: '', reviewer: '', role: '', decision: 'approved' as ReviewDecision, comments: '' });

  const review = reviews.find(r => r.id === reviewId);
  if (!review) return <EmptyState title="Review not found" />;

  const reviewId_ = review.id;
  const reviewReqIds = review.requirementIds;
  const reviewSignOffs = signOffs.filter(s => s.reviewId === reviewId_);
  const reviewReqs = requirements.filter(r => reviewReqIds.includes(r.id));

  function handleAddSignOff() {
    if (!soForm.reviewer.trim() || !soForm.requirementId) return;
    addSignOff({ ...soForm, reviewId: reviewId_ as ReviewId, requirementId: soForm.requirementId as RequirementId });
    setShowSignOff(false);
    setSoForm({ requirementId: '', reviewer: '', role: '', decision: 'approved', comments: '' });
    toast.success('Sign-off recorded');
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Reviews', href: '/reviews' }, { label: review.title }]} />
      <PageHeader title={review.title} description={review.description} />

      <div className="flex items-center gap-3 mb-6">
        <Badge color={review.status === 'completed' ? 'green' : review.status === 'in_progress' ? 'yellow' : 'blue'}>{review.status}</Badge>
        <Badge color="gray">{review.reviewType}</Badge>
        <span className="text-sm text-gray-500">Scheduled: {formatDate(review.scheduledDate)}</span>
        <div className="ml-auto flex gap-2">
          {review.status === 'scheduled' && (
            <Button size="sm" onClick={() => { updateReview(review.id, { status: 'in_progress' }); toast.success('Review started'); }}>Start Review</Button>
          )}
          {review.status === 'in_progress' && (
            <Button size="sm" onClick={() => { updateReview(review.id, { status: 'completed' }); toast.success('Review completed'); }}>Complete</Button>
          )}
          <Button size="sm" variant="secondary" icon={<Plus className="h-3 w-3" />} onClick={() => setShowSignOff(true)}>Add Sign-Off</Button>
        </div>
      </div>

      {/* Sign-Off Matrix */}
      <Card header={<h3 className="text-sm font-semibold">Sign-Off Matrix</h3>}>
        {reviewReqs.length === 0 && reviewSignOffs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No requirements or sign-offs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Requirement</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Reviewer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Decision</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Comments</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviewSignOffs.map(so => {
                  const req = requirements.find(r => r.id === so.requirementId);
                  return (
                    <tr key={so.id}>
                      <td className="px-3 py-2">
                        {req ? <span className="font-mono text-primary-700">{req.identifier}</span> : '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{so.reviewer}</td>
                      <td className="px-3 py-2 text-gray-600">{so.role}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {DECISION_ICONS[so.decision]}
                          <span className="capitalize">{so.decision.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{so.comments}</td>
                      <td className="px-3 py-2 text-gray-500">{formatDate(so.signedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showSignOff} onClose={() => setShowSignOff(false)} title="Add Sign-Off">
        <div className="space-y-4">
          <Select label="Requirement" value={soForm.requirementId} onChange={e => setSoForm(f => ({ ...f, requirementId: e.target.value }))}
            placeholder="Select requirement"
            options={[...reviewReqs, ...requirements.filter(r => !reviewReqs.includes(r))].slice(0, 50).map(r => ({ value: r.id, label: `${r.identifier} - ${r.title}` }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Reviewer" value={soForm.reviewer} onChange={e => setSoForm(f => ({ ...f, reviewer: e.target.value }))} />
            <Input label="Role" value={soForm.role} onChange={e => setSoForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <Select label="Decision" value={soForm.decision} onChange={e => setSoForm(f => ({ ...f, decision: e.target.value as ReviewDecision }))}
            options={[{ value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'needs_changes', label: 'Needs Changes' }]} />
          <Textarea label="Comments" value={soForm.comments} onChange={e => setSoForm(f => ({ ...f, comments: e.target.value }))} />
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowSignOff(false)}>Cancel</Button><Button onClick={handleAddSignOff}>Submit</Button></div>
        </div>
      </Modal>
    </div>
  );
}
