import { useAppStore } from '../../store/appStore.ts';
import type { FamilyId, VariantId, RevisionId } from '../../types/index.ts';

export function ContextSelector() {
  const families = useAppStore(s => s.families);
  const variants = useAppStore(s => s.variants);
  const revisions = useAppStore(s => s.revisions);
  const activeFamilyId = useAppStore(s => s.activeFamilyId);
  const activeVariantId = useAppStore(s => s.activeVariantId);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const setActiveFamily = useAppStore(s => s.setActiveFamily);
  const setActiveVariant = useAppStore(s => s.setActiveVariant);
  const setActiveRevision = useAppStore(s => s.setActiveRevision);

  const familyVariants = variants.filter(v => v.familyId === activeFamilyId);
  const variantRevisions = revisions.filter(r => r.variantId === activeVariantId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeFamilyId ?? ''}
        onChange={e => setActiveFamily((e.target.value || null) as FamilyId | null)}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Select Family</option>
        {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <span className="text-gray-300">/</span>
      <select
        value={activeVariantId ?? ''}
        onChange={e => setActiveVariant((e.target.value || null) as VariantId | null)}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        disabled={!activeFamilyId}
      >
        <option value="">Variant</option>
        {familyVariants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
      <span className="text-gray-300">/</span>
      <select
        value={activeRevisionId ?? ''}
        onChange={e => setActiveRevision((e.target.value || null) as RevisionId | null)}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        disabled={!activeVariantId}
      >
        <option value="">Revision</option>
        {variantRevisions.map(r => <option key={r.id} value={r.id}>{r.version}{r.isHead ? ' (HEAD)' : ''}</option>)}
      </select>
    </div>
  );
}
