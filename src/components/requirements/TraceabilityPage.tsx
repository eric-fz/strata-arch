import { PageHeader } from '../layout/PageHeader.tsx';
import { Badge } from '../ui/Badge.tsx';
import { EmptyState } from '../ui/EmptyState.tsx';
import { Breadcrumbs } from '../ui/Breadcrumbs.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useActiveRequirements } from '../../store/selectors.ts';
import { STATUS_META } from '../../types/display-meta.ts';
import { CheckCircle, XCircle, Minus } from 'lucide-react';

export function TraceabilityPage() {
  const requirements = useActiveRequirements();
  const testCases = useAppStore(s => s.testCases);
  const reqTestCaseLinks = useAppStore(s => s.reqTestCaseLinks);
  const testResults = useAppStore(s => s.testResults);

  if (requirements.length === 0) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Requirements', href: '/requirements' }, { label: 'Traceability' }]} />
        <PageHeader title="Traceability Matrix" />
        <EmptyState title="No requirements" description="Add requirements to see the traceability matrix." />
      </div>
    );
  }

  const tcList = testCases.filter(tc => reqTestCaseLinks.some(l => requirements.some(r => r.id === l.requirementId) && l.testCaseId === tc.id));

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Requirements', href: '/requirements' }, { label: 'Traceability' }]} />
      <PageHeader title="Traceability Matrix" description="Requirements vs verification coverage" />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 sticky left-0 bg-gray-50 z-10">Requirement</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
              {tcList.map(tc => (
                <th key={tc.id} className="px-3 py-2 text-center font-medium text-gray-500 max-w-[120px] truncate" title={tc.title}>
                  {tc.title}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-gray-500">Coverage</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requirements.map(req => {
              const linkedTcIds = reqTestCaseLinks.filter(l => l.requirementId === req.id).map(l => l.testCaseId);
              const coveredCount = linkedTcIds.length;
              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 sticky left-0 bg-white z-10">
                    <div>
                      <span className="font-mono text-primary-700 font-medium">{req.identifier}</span>
                      <span className="ml-2 text-gray-700">{req.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge color={STATUS_META[req.status].color}>{STATUS_META[req.status].label}</Badge>
                  </td>
                  {tcList.map(tc => {
                    const isLinked = linkedTcIds.includes(tc.id);
                    if (!isLinked) return <td key={tc.id} className="px-3 py-2 text-center"><Minus className="h-4 w-4 text-gray-300 mx-auto" /></td>;
                    const result = testResults.find(tr => tr.testCaseId === tc.id);
                    return (
                      <td key={tc.id} className="px-3 py-2 text-center">
                        {result?.outcome === 'pass' && <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />}
                        {result?.outcome === 'fail' && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                        {!result && <div className="h-4 w-4 rounded-full bg-yellow-200 mx-auto" title="Pending" />}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className={`font-medium ${coveredCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {coveredCount > 0 ? `${coveredCount} TC` : 'None'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
