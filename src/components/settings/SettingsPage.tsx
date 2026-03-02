import { useRef } from 'react';
import { PageHeader } from '../layout/PageHeader.tsx';
import { Button } from '../ui/Button.tsx';
import { Card } from '../ui/Card.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { createSeedData } from '../../utils/seedData.ts';
import { Download, Upload, Trash2, Database } from 'lucide-react';

export function SettingsPage() {
  const exportData = useAppStore(s => s.exportData);
  const importData = useAppStore(s => s.importData);
  const loadSeedData = useAppStore(s => s.loadSeedData);
  const clearAllData = useAppStore(s => s.clearAllData);
  const families = useAppStore(s => s.families);
  const requirements = useAppStore(s => s.requirements);
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strata-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  }

  function handleImport() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(reader.result as string);
      if (ok) toast.success('Data imported');
      else toast.error('Invalid import file');
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleSeed() {
    const data = createSeedData();
    loadSeedData(data);
    toast.success('Seed data loaded');
  }

  function handleClear() {
    if (!confirm('This will permanently delete all data. Continue?')) return;
    clearAllData();
    toast.info('All data cleared');
  }

  return (
    <div>
      <PageHeader title="Settings" description="Data management and configuration" />

      <div className="max-w-2xl space-y-4">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-1">Current Data</h3>
          <p className="text-sm text-gray-600">{families.length} families, {requirements.length} requirements loaded.</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Data Operations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Load Demo Data</p>
                <p className="text-xs text-gray-500">Load Atlas v3 and Scout Mini v2 demo data</p>
              </div>
              <Button variant="secondary" icon={<Database className="h-4 w-4" />} onClick={handleSeed}>Load Seed Data</Button>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Export Data</p>
                <p className="text-xs text-gray-500">Download all data as JSON</p>
              </div>
              <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExport}>Export</Button>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Import Data</p>
                <p className="text-xs text-gray-500">Load data from a JSON export file</p>
              </div>
              <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={handleImport}>Import</Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Clear All Data</p>
                <p className="text-xs text-gray-500">Permanently delete all data from IndexedDB</p>
              </div>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={handleClear}>Clear</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
