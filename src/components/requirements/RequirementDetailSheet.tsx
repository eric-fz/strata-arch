import { useState } from 'react';
import { Badge } from '../ui/Badge.tsx';
import { Button } from '../ui/Button.tsx';
import { Modal } from '../ui/Modal.tsx';
import { RequirementForm } from './RequirementForm.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { CATEGORY_META, STATUS_META, PRIORITY_META } from '../../types/display-meta.ts';
import { formatDate } from '../../lib/date.ts';
import type { Requirement, RequirementStatus } from '../../types/index.ts';
import { Edit, Trash2, ChevronRight } from 'lucide-react';

interface Props {
  requirement: Requirement;
  onClose: () => void;
}

export function RequirementDetailSheet({ requirement: r, onClose }: Props) {
  const transitionStatus = useAppStore(s => s.transitionStatus);
  const canTransition = useAppStore(s => s.canTransition);
  const deleteRequirement = useAppStore(s => s.deleteRequirement);
  const requirementLinks = useAppStore(s => s.requirementLinks);
  const requirements = useAppStore(s => s.requirements);
  const reqTestCaseLinks = useAppStore(s => s.reqTestCaseLinks);
  const testCases = useAppStore(s => s.testCases);
  const reqArchLinks = useAppStore(s => s.reqArchLinks);
  const architectureElements = useAppStore(s => s.architectureElements);
  const toast = useToast();
  const [showEdit, setShowEdit] = useState(false);

  const links = requirementLinks.filter(l => l.sourceId === r.id || l.targetId === r.id);
  const linkedReqs = links.map(l => {
    const otherId = l.sourceId === r.id ? l.targetId : l.sourceId;
    return { link: l, req: requirements.find(r => r.id === otherId) };
  });

  const linkedTests = reqTestCaseLinks.filter(l => l.requirementId === r.id).map(l => testCases.find(tc => tc.id === l.testCaseId)).filter(Boolean);
  const linkedArch = reqArchLinks.filter(l => l.requirementId === r.id).map(l => architectureElements.find(e => e.id === l.elementId)).filter(Boolean);

  const nextStatuses: RequirementStatus[] = (['draft', 'in_review', 'approved', 'baselined', 'deprecated'] as const).filter(s => canTransition(r.status, s));

  function handleTransition(status: RequirementStatus) {
    transitionStatus(r.id, status);
    toast.success(`Status changed to ${STATUS_META[status].label}`);
  }

  function handleDelete() {
    deleteRequirement(r.id);
    toast.success('Requirement deleted');
    onClose();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-sm font-bold text-primary-700">{r.identifier}</span>
          <Badge color={STATUS_META[r.status].color}>{STATUS_META[r.status].label}</Badge>
          <Badge color={PRIORITY_META[r.priority].color}>{PRIORITY_META[r.priority].label}</Badge>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{r.title}</h2>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" icon={<Edit className="h-3 w-3" />} onClick={() => setShowEdit(true)}>Edit</Button>
        <Button size="sm" variant="danger" icon={<Trash2 className="h-3 w-3" />} onClick={handleDelete}>Delete</Button>
        {nextStatuses.map(s => (
          <Button key={s} size="sm" variant="ghost" onClick={() => handleTransition(s)}>
            <ChevronRight className="h-3 w-3" /> {STATUS_META[s].label}
          </Button>
        ))}
      </div>

      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</h4>
        <p className="text-sm text-gray-700">{r.description}</p>
      </section>

      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Rationale</h4>
        <p className="text-sm text-gray-700">{r.rationale}</p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</h4>
          <Badge color={CATEGORY_META[r.category].color}>{CATEGORY_META[r.category].label}</Badge>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Verification</h4>
          <p className="text-sm text-gray-700 capitalize">{r.verificationMethod}</p>
        </div>
      </div>

      {(r.nominalValue !== undefined || r.minValue !== undefined || r.maxValue !== undefined) && (
        <section>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Quantitative Spec</h4>
          <div className="flex gap-4 text-sm">
            {r.nominalValue !== undefined && <span>Nominal: <strong>{r.nominalValue}</strong></span>}
            {r.minValue !== undefined && <span>Min: <strong>{r.minValue}</strong></span>}
            {r.maxValue !== undefined && <span>Max: <strong>{r.maxValue}</strong></span>}
            {r.unit && <span className="text-gray-500">({r.unit})</span>}
          </div>
        </section>
      )}

      <section>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Acceptance Criteria</h4>
        <p className="text-sm text-gray-700">{r.acceptanceCriteria}</p>
      </section>

      {linkedReqs.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Linked Requirements</h4>
          <div className="space-y-1">
            {linkedReqs.map(({ link, req }) => req && (
              <div key={link.id} className="flex items-center gap-2 text-sm p-1.5 rounded bg-gray-50">
                <span className="font-mono text-xs text-primary-700">{req.identifier}</span>
                <span className="text-gray-700">{req.title}</span>
                <Badge color="gray">{link.linkType.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {linkedTests.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Test Cases</h4>
          <div className="space-y-1">
            {linkedTests.map(tc => tc && (
              <div key={tc.id} className="text-sm p-1.5 rounded bg-gray-50">
                <span className="font-medium text-gray-700">{tc.title}</span>
                <span className="text-gray-500 text-xs ml-2 capitalize">{tc.method}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {linkedArch.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Architecture Elements</h4>
          <div className="space-y-1">
            {linkedArch.map(e => e && (
              <div key={e.id} className="text-sm p-1.5 rounded bg-gray-50">{e.name}</div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
        <div>Owner: {r.owner}</div>
        <div>Created by: {r.createdBy}</div>
        <div>Created: {formatDate(r.createdAt)}</div>
        <div>Updated: {formatDate(r.updatedAt)}</div>
        <div>Version: {r.version}</div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Requirement" wide>
        <RequirementForm initial={r} onClose={() => setShowEdit(false)} />
      </Modal>
    </div>
  );
}
