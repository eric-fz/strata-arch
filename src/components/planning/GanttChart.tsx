import type { Milestone, Dependency } from '../../types/planning.ts';
import type { CPMResult } from '../../lib/criticalPath.ts';

// ── Layout constants ──────────────────────────────────────────────────────────
const ROW_H = 36;
const BAR_H = 16;
const BAR_Y_OFF = (ROW_H - BAR_H) / 2;
const HEADER_H = 40;
const LABEL_W = 220;
const PX_PER_DAY = 4;
const MS_PER_DAY = 86_400_000;
const PADDING_DAYS = 14;

// ── Colour helpers ────────────────────────────────────────────────────────────
const CRITICAL_BAR = '#ef4444';
const NORMAL_BAR = '#3b82f6';
const COMPLETE_BAR = '#22c55e';
const MISSED_BAR = '#f97316';
const POINT_FILL = '#fff';

function barColor(m: Milestone, cpm: CPMResult | undefined): string {
  if (m.status === 'completed') return COMPLETE_BAR;
  if (m.status === 'missed') return MISSED_BAR;
  if (cpm?.isCritical) return CRITICAL_BAR;
  return NORMAL_BAR;
}

// ── Ordered rows: parents first, then their children (depth-first) ────────────
function flattenHierarchy(milestones: Milestone[]): { m: Milestone; depth: number }[] {
  const childrenOf = new Map<string | undefined, Milestone[]>();
  for (const m of milestones) {
    const key = m.parentMilestoneId as string | undefined;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(m);
  }
  // sort each level by targetDate
  for (const arr of childrenOf.values()) {
    arr.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  }
  const result: { m: Milestone; depth: number }[] = [];
  function visit(id: string | undefined, depth: number) {
    for (const m of childrenOf.get(id) ?? []) {
      result.push({ m, depth });
      visit(m.id as string, depth + 1);
    }
  }
  visit(undefined, 0);
  return result;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  milestones: Milestone[];
  dependencies: Dependency[];
  cpm: Map<string, CPMResult>;
  onSelectMilestone: (id: string) => void;
  selectedId: string | null;
}

export function GanttChart({ milestones, dependencies, cpm, onSelectMilestone, selectedId }: Props) {
  if (milestones.length === 0) return null;

  // Date range
  const allTs = milestones.flatMap(m => [
    m.startDate ? new Date(m.startDate).getTime() : new Date(m.targetDate).getTime(),
    new Date(m.targetDate).getTime(),
  ]);
  const minTs = Math.min(...allTs) - PADDING_DAYS * MS_PER_DAY;
  const maxTs = Math.max(...allTs) + PADDING_DAYS * MS_PER_DAY;
  const totalDays = (maxTs - minTs) / MS_PER_DAY;

  const chartW = Math.round(totalDays * PX_PER_DAY);
  const rows = flattenHierarchy(milestones);
  const svgH = HEADER_H + rows.length * ROW_H + 8;
  const totalW = LABEL_W + chartW;

  function dateToX(ts: number): number {
    return LABEL_W + ((ts - minTs) / MS_PER_DAY) * PX_PER_DAY;
  }

  function rowY(idx: number): number {
    return HEADER_H + idx * ROW_H;
  }

  // Build row index map for arrow routing
  const rowIndex = new Map<string, number>(rows.map(({ m }, i) => [m.id as string, i]));

  // ── Month tick marks ──────────────────────────────────────────────────────
  const ticks: { x: number; label: string }[] = [];
  const cursor = new Date(minTs);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= maxTs) {
    ticks.push({
      x: dateToX(cursor.getTime()),
      label: cursor.toLocaleString('default', { month: 'short', year: '2-digit' }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const todayX = dateToX(Date.now());

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <svg width={totalW} height={svgH} className="block font-sans text-xs select-none">
        <defs>
          {/* Arrowhead markers */}
          <marker id="arrowN" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#9ca3af" />
          </marker>
          <marker id="arrowC" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill={CRITICAL_BAR} />
          </marker>
        </defs>

        {/* ── Header row ── */}
        <rect x={0} y={0} width={LABEL_W} height={HEADER_H} fill="#f9fafb" />
        <rect x={LABEL_W} y={0} width={chartW} height={HEADER_H} fill="#f9fafb" />
        <text x={8} y={HEADER_H / 2 + 5} fill="#6b7280" fontSize={11} fontWeight="600">Milestone</text>

        {ticks.map(t => (
          <g key={t.label + t.x}>
            <line x1={t.x} y1={HEADER_H - 6} x2={t.x} y2={svgH} stroke="#e5e7eb" strokeWidth={1} />
            <text x={t.x + 4} y={HEADER_H - 10} fill="#9ca3af" fontSize={10}>{t.label}</text>
          </g>
        ))}

        {/* ── Alternating row background ── */}
        {rows.map(({ m }, i) => (
          <rect
            key={`bg-${m.id}`}
            x={0} y={rowY(i)} width={totalW} height={ROW_H}
            fill={i % 2 === 0 ? '#fff' : '#f9fafb'}
            onClick={() => onSelectMilestone(m.id)}
            className="cursor-pointer"
          />
        ))}

        {/* ── Selected highlight ── */}
        {selectedId && rowIndex.has(selectedId) && (
          <rect
            x={0}
            y={rowY(rowIndex.get(selectedId)!)}
            width={totalW}
            height={ROW_H}
            fill="#eff6ff"
            opacity={0.7}
          />
        )}

        {/* ── Dependency arrows (drawn before bars so bars render on top) ── */}
        {dependencies.map(dep => {
          const fromIdx = rowIndex.get(dep.fromMilestoneId);
          const toIdx = rowIndex.get(dep.toMilestoneId);
          const fromM = milestones.find(m => m.id === dep.fromMilestoneId);
          const toM = milestones.find(m => m.id === dep.toMilestoneId);
          if (fromIdx == null || toIdx == null || !fromM || !toM) return null;

          const fromCpm = cpm.get(dep.fromMilestoneId);
          const toCpm = cpm.get(dep.toMilestoneId);
          const isCrit = fromCpm?.isCritical && toCpm?.isCritical;

          const fromX = dateToX(new Date(fromM.targetDate).getTime());
          const fromY = rowY(fromIdx) + ROW_H / 2;
          const toX = dateToX(
            toM.startDate
              ? new Date(toM.startDate).getTime()
              : new Date(toM.targetDate).getTime()
          ) - 1;
          const toY = rowY(toIdx) + ROW_H / 2;
          const midX = fromX + Math.max(12, (toX - fromX) * 0.4);

          return (
            <path
              key={dep.id}
              d={`M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`}
              fill="none"
              stroke={isCrit ? CRITICAL_BAR : '#9ca3af'}
              strokeWidth={isCrit ? 2 : 1.5}
              strokeDasharray={isCrit ? undefined : '4 2'}
              markerEnd={isCrit ? 'url(#arrowC)' : 'url(#arrowN)'}
            />
          );
        })}

        {/* ── Milestone rows ── */}
        {rows.map(({ m, depth }, i) => {
          const cpmR = cpm.get(m.id);
          const color = barColor(m, cpmR);
          const isPoint = !m.startDate || m.startDate === m.targetDate;
          const targetX = dateToX(new Date(m.targetDate).getTime());
          const startX = m.startDate ? dateToX(new Date(m.startDate).getTime()) : targetX;
          const barW = Math.max(isPoint ? 0 : 4, targetX - startX);
          const cy = rowY(i) + ROW_H / 2;
          const labelX = 8 + depth * 14;
          const isParent = milestones.some(x => x.parentMilestoneId === m.id);

          return (
            <g key={m.id} onClick={() => onSelectMilestone(m.id)} className="cursor-pointer">
              {/* Row label */}
              <text
                x={labelX}
                y={cy + 4}
                fill={isParent ? '#111827' : '#374151'}
                fontSize={isParent ? 11 : 11}
                fontWeight={isParent ? '600' : '400'}
                clipPath={`url(#lc-${m.id})`}
              >
                {isParent ? '▾ ' : ''}{m.name}
              </text>
              <clipPath id={`lc-${m.id}`}>
                <rect x={0} y={rowY(i)} width={LABEL_W - 4} height={ROW_H} />
              </clipPath>

              {isPoint ? (
                /* Diamond for point milestones */
                <polygon
                  points={`${targetX},${cy - 8} ${targetX + 8},${cy} ${targetX},${cy + 8} ${targetX - 8},${cy}`}
                  fill={color}
                  stroke={POINT_FILL}
                  strokeWidth={1.5}
                />
              ) : (
                /* Bar for duration milestones */
                <>
                  <rect
                    x={startX}
                    y={rowY(i) + BAR_Y_OFF}
                    width={barW}
                    height={BAR_H}
                    rx={3}
                    fill={color}
                    opacity={0.88}
                  />
                  {/* Narrow end-cap */}
                  <rect
                    x={targetX - 2}
                    y={rowY(i) + BAR_Y_OFF - 2}
                    width={4}
                    height={BAR_H + 4}
                    rx={2}
                    fill={color}
                  />
                </>
              )}

              {/* Float badge — only for non-critical, non-completed */}
              {cpmR && !cpmR.isCritical && m.status !== 'completed' && cpmR.totalFloat > 0 && (
                <text
                  x={targetX + (isPoint ? 12 : 6)}
                  y={cy + 4}
                  fill="#6b7280"
                  fontSize={9}
                >
                  {cpmR.totalFloat}d float
                </text>
              )}
              {/* Critical label */}
              {cpmR?.isCritical && m.status !== 'completed' && (
                <text
                  x={targetX + (isPoint ? 12 : 6)}
                  y={cy + 4}
                  fill={CRITICAL_BAR}
                  fontSize={9}
                  fontWeight="600"
                >
                  CRITICAL
                </text>
              )}
            </g>
          );
        })}

        {/* ── Today line ── */}
        {todayX >= LABEL_W && todayX <= totalW && (
          <g>
            <line x1={todayX} y1={HEADER_H} x2={todayX} y2={svgH} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={todayX + 3} y={HEADER_H + 10} fill="#ef4444" fontSize={9} fontWeight="600">Today</text>
          </g>
        )}

        {/* ── Divider between labels and chart ── */}
        <line x1={LABEL_W} y1={0} x2={LABEL_W} y2={svgH} stroke="#e5e7eb" strokeWidth={1} />
      </svg>
    </div>
  );
}
