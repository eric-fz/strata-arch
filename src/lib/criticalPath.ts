import type { Milestone, Dependency } from '../types/planning.ts';

const MS_PER_DAY = 86_400_000;

export interface CPMResult {
  id: string;
  es: number;          // earliest start (ms timestamp)
  ef: number;          // earliest finish
  ls: number;          // latest start
  lf: number;          // latest finish
  totalFloat: number;  // days (0 = critical)
  isCritical: boolean;
}

function durationMs(m: Milestone): number {
  const start = m.startDate
    ? new Date(m.startDate).getTime()
    : new Date(m.targetDate).getTime();
  const end = new Date(m.targetDate).getTime();
  return Math.max(0, end - start);
}

/**
 * Classic CPM forward/backward pass.
 *
 * Constraints:
 *  - Each milestone's ES is floored to its own planned startDate (or targetDate
 *    for point milestones) so planned anchors are respected unless a predecessor
 *    forces a later start.
 *  - Dependency type: Finish-to-Start with optional lagDays.
 *  - Milestones not reachable in a topological sort (cycle) are skipped
 *    gracefully.
 */
export function computeCriticalPath(
  milestones: Milestone[],
  dependencies: Dependency[],
): Map<string, CPMResult> {
  if (milestones.length === 0) return new Map();

  const msMap = new Map<string, Milestone>(milestones.map(m => [m.id as string, m]));

  // Build adjacency
  const succs = new Map<string, string[]>();
  const preds = new Map<string, string[]>();
  const lagMs = new Map<string, number>(); // key: "from-to"

  for (const m of milestones) {
    succs.set(m.id, []);
    preds.set(m.id, []);
  }
  for (const dep of dependencies) {
    if (!msMap.has(dep.fromMilestoneId) || !msMap.has(dep.toMilestoneId)) continue;
    succs.get(dep.fromMilestoneId)!.push(dep.toMilestoneId);
    preds.get(dep.toMilestoneId)!.push(dep.fromMilestoneId);
    lagMs.set(`${dep.fromMilestoneId}-${dep.toMilestoneId}`, (dep.lagDays ?? 0) * MS_PER_DAY);
  }

  // Kahn's topological sort
  const inDeg = new Map<string, number>(
    milestones.map(m => [m.id, preds.get(m.id)!.length]),
  );
  const queue: string[] = [...inDeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  const topo: string[] = [];
  const seen = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    topo.push(id);
    for (const s of succs.get(id)!) {
      const d = (inDeg.get(s) ?? 1) - 1;
      inDeg.set(s, d);
      if (d === 0) queue.push(s);
    }
  }

  // ── Forward pass ─────────────────────────────────────────────────────────
  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  for (const id of topo) {
    const m = msMap.get(id)!;
    const anchor = m.startDate
      ? new Date(m.startDate).getTime()
      : new Date(m.targetDate).getTime();

    let earliest = anchor;
    for (const predId of preds.get(id)!) {
      const predEf = ef.get(predId) ?? 0;
      const lag = lagMs.get(`${predId}-${id}`) ?? 0;
      earliest = Math.max(earliest, predEf + lag);
    }
    es.set(id, earliest);
    ef.set(id, earliest + durationMs(m));
  }

  // Project end = latest EF
  const projectEnd = Math.max(...ef.values());

  // ── Backward pass ────────────────────────────────────────────────────────
  const lf = new Map<string, number>();
  const ls = new Map<string, number>();

  for (const id of [...topo].reverse()) {
    const m = msMap.get(id)!;
    const succList = succs.get(id)!;
    const latestFinish = succList.length === 0
      ? projectEnd
      : Math.min(...succList.map(s => (ls.get(s) ?? 0) - (lagMs.get(`${id}-${s}`) ?? 0)));
    lf.set(id, latestFinish);
    ls.set(id, latestFinish - durationMs(m));
  }

  // ── Assemble results ─────────────────────────────────────────────────────
  const results = new Map<string, CPMResult>();
  const EPSILON = MS_PER_DAY * 0.01; // ~15 min tolerance

  for (const m of milestones) {
    const esV = es.get(m.id) ?? new Date(m.targetDate).getTime();
    const efV = ef.get(m.id) ?? esV;
    const lsV = ls.get(m.id) ?? esV;
    const lfV = lf.get(m.id) ?? efV;
    const floatMs = lsV - esV;
    results.set(m.id, {
      id: m.id,
      es: esV,
      ef: efV,
      ls: lsV,
      lf: lfV,
      totalFloat: Math.round((floatMs / MS_PER_DAY) * 10) / 10,
      isCritical: floatMs <= EPSILON,
    });
  }

  return results;
}
