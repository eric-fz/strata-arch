import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { formatDate } from '../../lib/date.ts';
import type { ReviewType, ReviewStatus, RevisionId } from '../../types/index.ts';
import { Plus, ClipboardCheck } from 'lucide-react';

const STATUS_COLORS: Record<ReviewStatus, string> = {
  scheduled: 'blue', in_progress: 'yellow', completed: 'green', cancelled: 'gray',
};

export function ReviewsPage() {
  const reviews = useAppStore(s => s.reviews);
  const signOffs = useAppStore(s => s.signOffs);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const createReview = useAppStore(s => s.createReview);
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', reviewType: 'PDR' as ReviewType, scheduledDate: '' });

  const revReviews = reviews.filter(r => r.revisionId === activeRevisionId);

  function handleCreate() {
    if (!form.title.trim() || !activeRevisionId) return;
    createReview({ ...form, revisionId: activeRevisionId as RevisionId, requirementIds: [], status: 'scheduled', scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : new Date().toISOString() });
    setShowCreate(false);
    setForm({ title: '', description: '', reviewType: 'PDR', scheduledDate: '' });
    toast.success('Review created');
  }

  if (!activeRevisionId) {
    return <div><PageHeader title="Design Reviews" /><EmptyState title="No revision selected" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Design Reviews"
        description={`${revReviews.length} reviews`}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>New Review</Button>}
      />

      {revReviews.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-12 w-12" />} title="No reviews" action={<Button onClick={() => setShowCreate(true)}>Create Review</Button>} />
      ) : (
        <div className="space-y-3">
          {revReviews.map(r => {
            const reviewSignOffs = signOffs.filter(s => s.reviewId === r.id);
            const approved = reviewSignOffs.filter(s => s.decision === 'approved').length;
            const total = reviewSignOffs.length;
            return (
              <Link key={r.id} to={`/reviews/${r.id}`}>
                <Card className="hover:ring-2 hover:ring-primary-200 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{r.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{r.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{r.reviewType}</span>
                        <span>{formatDate(r.scheduledDate)}</span>
                        {total > 0 && <span>{approved}/{total} approved</span>}
                      </div>
                    </div>
                    <Badge color={STATUS_COLORS[r.status]}>{r.status}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Design Review">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="PDR-001: Structural Review" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.reviewType} onChange={e => setForm(f => ({ ...f, reviewType: e.target.value as ReviewType }))}
              options={['PDR','CDR','FAI','QT','other'].map(v => ({ value: v, label: v }))} />
            <Input label="Scheduled Date" type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></div>
        </div>
      </Modal>
    </div>
  );
}
