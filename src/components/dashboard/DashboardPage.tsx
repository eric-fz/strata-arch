import { PageHeader } from '../layout/PageHeader.tsx';
import { StatCard } from '../ui/StatCard.tsx';
import { Card } from '../ui/Card.tsx';
import { Badge } from '../ui/Badge.tsx';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { useDashboardMetrics, useCoverageStats } from '../../store/selectors.ts';
import { useAppStore } from '../../store/appStore.ts';
import { useContextScope } from '../../hooks/useContextScope.ts';
import { formatDate, daysUntil } from '../../lib/date.ts';
import { STATUS_META, PRIORITY_META, PHASE_META } from '../../types/display-meta.ts';
import { FileText, Shield, Activity, GitPullRequest, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { activeFamily, activeVariant, activeRevision } = useContextScope();
  const metrics = useDashboardMetrics();
  const coverage = useCoverageStats();
  const milestones = useAppStore(s => s.milestones);
  const changeProposals = useAppStore(s => s.changeProposals);
  const requirements = useAppStore(s => s.requirements);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);

  const revReqs = requirements.filter(r => r.revisionId === activeRevisionId);
  const upcomingMs = milestones
    .filter(m => m.status === 'upcoming' || m.status === 'in_progress')
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .slice(0, 5);

  const openChanges = changeProposals.filter(
    c => c.status !== 'closed' && c.status !== 'rejected' && c.status !== 'implemented'
  );

  if (!activeFamily) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-lg font-semibold text-gray-700">Welcome to Strata</h2>
        <p className="mt-2 text-sm text-gray-500">Select a robot family from the context selector above to get started.</p>
        <Link to="/families" className="mt-4 text-sm text-primary-600 hover:underline">Manage Families</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${activeFamily.name} ${activeVariant?.name ?? ''} Dashboard`}
        description={activeRevision ? `Revision ${activeRevision.version}` : 'Select a revision'}
      />

      {activeVariant && (
        <div className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500">
          Phase: <Badge color={activeVariant.phase === 'production' ? 'green' : 'blue'}>{PHASE_META[activeVariant.phase].label}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requirements" value={metrics.totalRequirements} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Verification Coverage" value={`${metrics.coveragePct}%`} icon={<Shield className="h-5 w-5" />} />
        <StatCard label="Test Pass Rate" value={`${metrics.testPassRate}%`} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Open Changes" value={metrics.openChanges} icon={<GitPullRequest className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage */}
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Verification Coverage</h3>}>
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg viewBox="0 0 120 120" className="h-28 w-28">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="10"
                  strokeDasharray={`${(coverage.pct / 100) * 314} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                />
                <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="text-lg font-bold fill-gray-900" fontSize="20">
                  {coverage.pct}%
                </text>
              </svg>
            </div>
            <div className="grid grid-cols-3 text-center text-xs">
              <div><div className="text-lg font-bold text-gray-900">{coverage.covered}</div>Covered</div>
              <div><div className="text-lg font-bold text-green-600">{coverage.passed}</div>Passed</div>
              <div><div className="text-lg font-bold text-red-600">{coverage.failed}</div>Failed</div>
            </div>
          </div>
        </Card>

        {/* Requirements by Status */}
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Requirements by Status</h3>}>
          <div className="space-y-3">
            {(['draft', 'in_review', 'approved', 'baselined', 'deprecated'] as const).map(status => {
              const count = revReqs.filter(r => r.status === status).length;
              if (count === 0 && status === 'deprecated') return null;
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{STATUS_META[status].label}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                  <ProgressBar value={count} max={Math.max(revReqs.length, 1)} color={
                    status === 'approved' ? 'bg-green-500' :
                    status === 'baselined' ? 'bg-blue-500' :
                    status === 'in_review' ? 'bg-yellow-500' :
                    status === 'draft' ? 'bg-gray-400' : 'bg-slate-400'
                  } />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Milestones */}
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Upcoming Milestones</h3>}>
          {upcomingMs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming milestones</p>
          ) : (
            <div className="space-y-3">
              {upcomingMs.map(m => {
                const days = daysUntil(m.targetDate);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(m.targetDate)}</p>
                    </div>
                    <Badge color={days < 0 ? 'red' : days < 14 ? 'orange' : 'blue'}>
                      {days < 0 ? `${-days}d overdue` : `${days}d`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Open Changes */}
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Open Change Proposals</h3>} className="lg:col-span-2">
          {openChanges.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No open changes</p>
          ) : (
            <div className="space-y-2">
              {openChanges.map(c => (
                <Link key={c.id} to={`/changes/${c.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{c.title}</p>
                    <p className="text-xs text-gray-500">by {c.proposedBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={c.impact === 'critical' ? 'red' : c.impact === 'high' ? 'orange' : 'yellow'}>{c.impact}</Badge>
                    <Badge color="blue">{c.status.replace('_', ' ')}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Requirements by Priority */}
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Requirements by Priority</h3>}>
          <div className="space-y-2">
            {(['critical', 'high', 'medium', 'low'] as const).map(p => {
              const count = revReqs.filter(r => r.priority === p).length;
              return (
                <div key={p} className="flex items-center justify-between">
                  <Badge color={PRIORITY_META[p].color}>{PRIORITY_META[p].label}</Badge>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
