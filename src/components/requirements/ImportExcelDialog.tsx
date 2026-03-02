import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';
import { useAppStore } from '../../store/appStore.ts';
import { useToast } from '../../hooks/useToast.ts';
import { parseRequirementsExcel, downloadImportTemplate, type ImportResult } from '../../lib/excel.ts';
import type { RevisionId } from '../../types/index.ts';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'preview' | 'done';

export function ImportExcelDialog({ open, onClose }: Props) {
  const createRequirement = useAppStore(s => s.createRequirement);
  const activeRevisionId = useAppStore(s => s.activeRevisionId);
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  function reset() {
    setStep('upload');
    setResult(null);
    setImporting(false);
    setImportedCount(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const buffer = await file.arrayBuffer();
    const parsed = parseRequirementsExcel(buffer);
    setResult(parsed);
    setStep('preview');
  }

  function handleImport() {
    if (!result || !activeRevisionId) return;
    setImporting(true);

    let count = 0;
    for (const row of result.rows) {
      createRequirement({
        ...row,
        revisionId: activeRevisionId as RevisionId,
      });
      count++;
    }

    setImportedCount(count);
    setImporting(false);
    setStep('done');
    toast.success(`Imported ${count} requirement${count !== 1 ? 's' : ''}`);
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Requirements from Excel" wide>
      {step === 'upload' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            Upload an Excel file (.xlsx, .xls) with requirements. Each row becomes a requirement in the active revision.
          </p>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Click to select a file</p>
            <p className="text-xs text-gray-500 mt-1">.xlsx or .xls</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <button
              onClick={downloadImportTemplate}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700"
            >
              <Download className="h-4 w-4" />
              Download template
            </button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      )}

      {step === 'preview' && result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">{result.totalRows} row{result.totalRows !== 1 ? 's' : ''} found</span>
            </div>
            <Badge color="green">{result.rows.length} valid</Badge>
            {result.errors.length > 0 && <Badge color="red">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}</Badge>}
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                Rows with errors (will be skipped)
              </div>
              <div className="space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">
                    <span className="font-medium">Row {err.row}:</span> {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Preview table */}
          {result.rows.length > 0 && (
            <div className="rounded-md border border-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Title</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Category</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Priority</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Owner</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {result.rows.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-1.5 text-gray-900 font-medium max-w-[200px] truncate">{row.title}</td>
                      <td className="px-3 py-1.5"><Badge color="blue">{row.category}</Badge></td>
                      <td className="px-3 py-1.5 text-gray-600">{row.reqType}</td>
                      <td className="px-3 py-1.5"><Badge color={row.priority === 'critical' ? 'red' : row.priority === 'high' ? 'orange' : 'gray'}>{row.priority}</Badge></td>
                      <td className="px-3 py-1.5 text-gray-600">{row.owner}</td>
                      <td className="px-3 py-1.5 text-gray-600">{row.verificationMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.rows.length > 50 && (
                <p className="text-xs text-gray-500 text-center py-2">Showing first 50 of {result.rows.length} rows</p>
              )}
            </div>
          )}

          {!activeRevisionId && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
              No active revision selected. Please select a family, variant, and revision first.
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="secondary" onClick={() => { reset(); }}>Back</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleImport}
                loading={importing}
                disabled={result.rows.length === 0 || !activeRevisionId}
              >
                Import {result.rows.length} Requirement{result.rows.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-6 space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="text-lg font-semibold text-gray-900">Import Complete</p>
            <p className="text-sm text-gray-600 mt-1">
              Successfully imported {importedCount} requirement{importedCount !== 1 ? 's' : ''}.
            </p>
          </div>
          <Button onClick={handleClose}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
