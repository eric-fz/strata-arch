import { useMemo } from 'react';
import { useAppStore } from './appStore.ts';
import type { Requirement } from '../types/index.ts';

// Hook: active revision requirements
export function useActiveRequirements(): Requirement[] {
  const requirements = useAppStore(s => s.requirements);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  return useMemo(
    () => activeRevisionId ? requirements.filter(r => r.revisionId === activeRevisionId) : [],
    [requirements, activeRevisionId],
  );
}

// Hook: coverage stats
export function useCoverageStats() {
  const reqs = useActiveRequirements();
  const reqTestCaseLinks = useAppStore(s => s.reqTestCaseLinks);
  const testResults = useAppStore(s => s.testResults);
  const testCases = useAppStore(s => s.testCases);

  return useMemo(() => {
    const total = reqs.length;
    if (total === 0) return { total: 0, covered: 0, passed: 0, failed: 0, pct: 0 };

    const coveredIds = new Set(reqTestCaseLinks.map(l => l.requirementId));
    const covered = reqs.filter(r => coveredIds.has(r.id)).length;

    const passedResults = new Set<string>();
    const failedResults = new Set<string>();
    for (const result of testResults) {
      const tc = testCases.find(c => c.id === result.testCaseId);
      if (tc) {
        if (result.outcome === 'pass') passedResults.add(tc.requirementId);
        if (result.outcome === 'fail') failedResults.add(tc.requirementId);
      }
    }

    return {
      total,
      covered,
      passed: reqs.filter(r => passedResults.has(r.id)).length,
      failed: reqs.filter(r => failedResults.has(r.id)).length,
      pct: total > 0 ? Math.round((covered / total) * 100) : 0,
    };
  }, [reqs, reqTestCaseLinks, testResults, testCases]);
}

// Hook: dashboard metrics
export function useDashboardMetrics() {
  const reqs = useActiveRequirements();
  const coverage = useCoverageStats();
  const changeProposals = useAppStore(s => s.changeProposals);

  return useMemo(() => {
    const openChanges = changeProposals.filter(
      c => c.status !== 'closed' && c.status !== 'rejected' && c.status !== 'implemented'
    ).length;

    return {
      totalRequirements: reqs.length,
      coveragePct: coverage.pct,
      testPassRate: coverage.covered > 0
        ? Math.round((coverage.passed / coverage.covered) * 100)
        : 0,
      openChanges,
    };
  }, [reqs, coverage, changeProposals]);
}

// Hook: BOM cost rollup
export function useBomCostRollup() {
  const bomItems = useAppStore(s => s.bomItems);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);

  return useMemo(() => {
    const items = activeRevisionId
      ? bomItems.filter(b => b.revisionId === activeRevisionId)
      : [];
    const total = items.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);
    const byCategory: Record<string, number> = {};
    for (const b of items) {
      byCategory[b.category] = (byCategory[b.category] ?? 0) + b.quantity * b.unitCost;
    }
    return { total, byCategory, itemCount: items.length };
  }, [bomItems, activeRevisionId]);
}
