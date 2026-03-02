import { useAppStore } from '../store/appStore.ts';

export function useContextScope() {
  const activeFamilyId = useAppStore(s => s.activeFamilyId);
  const activeVariantId = useAppStore(s => s.activeVariantId);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const families = useAppStore(s => s.families);
  const variants = useAppStore(s => s.variants);
  const revisions = useAppStore(s => s.revisions);

  const activeFamily = families.find(f => f.id === activeFamilyId) ?? null;
  const activeVariant = variants.find(v => v.id === activeVariantId) ?? null;
  const activeRevision = revisions.find(r => r.id === activeRevisionId) ?? null;

  return { activeFamilyId, activeVariantId, activeRevisionId, activeFamily, activeVariant, activeRevision };
}
