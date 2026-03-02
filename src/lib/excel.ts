import * as XLSX from 'xlsx';
import type { Requirement } from '../types/requirements.ts';
import type { RequirementCategory, RequirementType, RequirementStatus, RequirementPriority, VerificationMethod } from '../types/enums.ts';

// ─── Column order (export & template) ────────────────────
// Exactly the 10 columns requested, in order.

const EXPORT_COLUMNS = [
  'Identifier',
  'Formal Requirement Title',
  'Category',
  'Type',
  'Status',
  'Priority',
  'Acceptance Criteria',
  'Rationale',
  'Value +/- Tolerance',
  'Owner',
] as const;

// ─── Valid enum values ────────────────────────────────────

const VALID_CATEGORIES: RequirementCategory[] = ['system', 'subsystem', 'interface', 'safety', 'regulatory', 'manufacturing', 'service', 'performance'];
const VALID_TYPES: RequirementType[] = ['functional', 'performance', 'interface', 'physical', 'safety', 'operational'];
const VALID_STATUSES: RequirementStatus[] = ['draft', 'in_review', 'approved', 'baselined', 'deprecated'];
const VALID_PRIORITIES: RequirementPriority[] = ['critical', 'high', 'medium', 'low'];
const VALID_METHODS: VerificationMethod[] = ['analysis', 'test', 'inspection', 'demonstration', 'similarity'];

// ─── Value +/- Tolerance helpers ─────────────────────────

/**
 * Format nominalValue / minValue / maxValue / unit into a single string.
 * Examples:
 *   5.0 [4.5–5.5] kg
 *   5.0 kg
 *   5.0
 */
function formatValueTolerance(r: Requirement): string {
  const { nominalValue, minValue, maxValue, unit } = r;
  if (nominalValue === undefined && minValue === undefined && maxValue === undefined) return '';
  let s = nominalValue !== undefined ? String(nominalValue) : '';
  if (minValue !== undefined || maxValue !== undefined) {
    const lo = minValue !== undefined ? String(minValue) : '–';
    const hi = maxValue !== undefined ? String(maxValue) : '–';
    s += ` [${lo}–${hi}]`;
  }
  if (unit) s += ` ${unit}`;
  return s.trim();
}

/**
 * Parse "Value +/- Tolerance" cell back into components. Accepts:
 *   "5.0 [4.5–5.5] kg"   → nominal=5, min=4.5, max=5.5, unit=kg
 *   "5.0 ± 0.5 kg"        → nominal=5, min=4.5, max=5.5, unit=kg
 *   "5.0 kg"              → nominal=5, unit=kg
 *   "5.0"                 → nominal=5
 */
function parseValueTolerance(raw: string): {
  nominalValue?: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
} {
  const s = raw.trim();
  if (!s) return {};

  // "5.0 [4.5–5.5] kg"  (– is en-dash or regular hyphen)
  const bracketMatch = s.match(/^([\d.]+)\s*\[([\d.]+)\s*[–\-]\s*([\d.]+)\]\s*(.*)$/);
  if (bracketMatch) {
    return {
      nominalValue: parseFloat(bracketMatch[1]),
      minValue: parseFloat(bracketMatch[2]),
      maxValue: parseFloat(bracketMatch[3]),
      unit: bracketMatch[4].trim() || undefined,
    };
  }

  // "5.0 ± 0.5 kg"
  const pmMatch = s.match(/^([\d.]+)\s*±\s*([\d.]+)\s*(.*)$/);
  if (pmMatch) {
    const nominal = parseFloat(pmMatch[1]);
    const tol = parseFloat(pmMatch[2]);
    return {
      nominalValue: nominal,
      minValue: Math.round((nominal - tol) * 1e9) / 1e9,
      maxValue: Math.round((nominal + tol) * 1e9) / 1e9,
      unit: pmMatch[3].trim() || undefined,
    };
  }

  // "5.0 kg" or "5.0"
  const simpleMatch = s.match(/^([\d.]+)\s*(.*)$/);
  if (simpleMatch) {
    return {
      nominalValue: parseFloat(simpleMatch[1]),
      unit: simpleMatch[2].trim() || undefined,
    };
  }

  return {};
}

// ─── Column widths ────────────────────────────────────────

const COL_WIDTHS: Record<string, number> = {
  'Identifier': 14,
  'Formal Requirement Title': 35,
  'Category': 14,
  'Type': 14,
  'Status': 14,
  'Priority': 12,
  'Acceptance Criteria': 55,
  'Rationale': 45,
  'Value +/- Tolerance': 22,
  'Owner': 18,
};

// ─── Export ───────────────────────────────────────────────

export function exportRequirementsToExcel(requirements: Requirement[], filename?: string) {
  const rows = requirements.map(r => ({
    'Identifier': r.identifier,
    'Formal Requirement Title': r.title,
    'Category': r.category,
    'Type': r.reqType,
    'Status': r.status,
    'Priority': r.priority,
    'Acceptance Criteria': r.acceptanceCriteria,
    'Rationale': r.rationale,
    'Value +/- Tolerance': formatValueTolerance(r),
    'Owner': r.owner,
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { header: [...EXPORT_COLUMNS] });
  ws['!cols'] = EXPORT_COLUMNS.map(c => ({ wch: COL_WIDTHS[c] ?? 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Requirements');

  const refData = [
    ['Field', 'Valid Values'],
    ['Category', VALID_CATEGORIES.join(', ')],
    ['Type', VALID_TYPES.join(', ')],
    ['Status', VALID_STATUSES.join(', ')],
    ['Priority', VALID_PRIORITIES.join(', ')],
    ['', ''],
    ['Value +/- Tolerance', ''],
    ['', 'Nominal only: 5.0 kg'],
    ['', 'With tolerance: 5.0 [4.5–5.5] kg'],
    ['', 'Plus-minus: 5.0 ± 0.5 kg'],
  ];
  const refWs = XLSX.utils.aoa_to_sheet(refData);
  refWs['!cols'] = [{ wch: 22 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, refWs, 'Reference');

  const name = filename ?? `requirements-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

// ─── Template download ────────────────────────────────────

export function downloadImportTemplate() {
  const sampleRows = [
    {
      'Identifier': '(auto-generated)',
      'Formal Requirement Title': 'Payload Capacity',
      'Category': 'system',
      'Type': 'performance',
      'Status': 'draft',
      'Priority': 'critical',
      'Acceptance Criteria': 'Robot holds 5 kg at full extension for 30 sec without stalling.',
      'Rationale': 'Customer requirement for warehouse operations.',
      'Value +/- Tolerance': '5.0 [5.0–6.0] kg',
      'Owner': 'J. Smith',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: [...EXPORT_COLUMNS] });
  ws['!cols'] = EXPORT_COLUMNS.map(c => ({ wch: COL_WIDTHS[c] ?? 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Requirements');

  const refData = [
    ['Field', 'Valid Values'],
    ['Category', VALID_CATEGORIES.join(', ')],
    ['Type', VALID_TYPES.join(', ')],
    ['Status', VALID_STATUSES.join(', ')],
    ['Priority', VALID_PRIORITIES.join(', ')],
    ['', ''],
    ['Value +/- Tolerance formats', ''],
    ['', 'Nominal only: 5.0 kg'],
    ['', 'With range: 5.0 [4.5–5.5] kg'],
    ['', 'Plus-minus: 5.0 ± 0.5 kg'],
    ['', ''],
    ['Notes', ''],
    ['Identifier', 'Leave blank — auto-generated on import.'],
    ['Status / Priority', 'Leave blank to default to "draft" / "medium".'],
  ];
  const refWs = XLSX.utils.aoa_to_sheet(refData);
  refWs['!cols'] = [{ wch: 26 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, refWs, 'Reference');

  XLSX.writeFile(wb, 'requirements-import-template.xlsx');
}

// ─── Import ───────────────────────────────────────────────

export interface ImportedRow {
  title: string;
  description: string;
  rationale: string;
  category: RequirementCategory;
  reqType: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  owner: string;
  verificationMethod: VerificationMethod;
  acceptanceCriteria: string;
  createdBy: string;
  nominalValue?: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  applicableStandards?: string[];
}

export interface ImportResult {
  rows: ImportedRow[];
  errors: Array<{ row: number; message: string }>;
  totalRows: number;
}

function normalizeStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

export function parseRequirementsExcel(file: ArrayBuffer): ImportResult {
  const wb = XLSX.read(file, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { rows: [], errors: [{ row: 0, message: 'No sheets found in workbook.' }], totalRows: 0 };

  const ws = wb.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const totalRows = jsonRows.length;
  const rows: ImportedRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < jsonRows.length; i++) {
    const raw = jsonRows[i];
    const rowNum = i + 2;
    const rowErrors: string[] = [];

    // Accept new column names with fallback to old names
    const title = normalizeStr(raw['Formal Requirement Title'] ?? raw['Title']);
    const rationale = normalizeStr(raw['Rationale']);
    const acceptanceCriteria = normalizeStr(raw['Acceptance Criteria']);
    const category = normalizeStr(raw['Category']).toLowerCase();
    const reqType = normalizeStr(raw['Type']).toLowerCase();
    const status = normalizeStr(raw['Status']).toLowerCase().replace(/\s+/g, '_');
    const priority = normalizeStr(raw['Priority']).toLowerCase();
    const owner = normalizeStr(raw['Owner']);

    // Value +/- Tolerance: new combined column, with fallback to old separate columns
    let nominalValue: number | undefined;
    let minValue: number | undefined;
    let maxValue: number | undefined;
    let unit: string | undefined;

    const combinedValue = normalizeStr(raw['Value +/- Tolerance']);
    if (combinedValue) {
      const parsed = parseValueTolerance(combinedValue);
      nominalValue = parsed.nominalValue;
      minValue = parsed.minValue;
      maxValue = parsed.maxValue;
      unit = parsed.unit;
    } else {
      // Fallback: old separate columns
      const nomRaw = raw['Nominal Value'];
      const minRaw = raw['Min Value'];
      const maxRaw = raw['Max Value'];
      const unitRaw = normalizeStr(raw['Unit']);
      if (nomRaw !== undefined && nomRaw !== '') nominalValue = Number(nomRaw);
      if (minRaw !== undefined && minRaw !== '') minValue = Number(minRaw);
      if (maxRaw !== undefined && maxRaw !== '') maxValue = Number(maxRaw);
      if (unitRaw) unit = unitRaw;
    }

    // Description: use dedicated column if present, otherwise fall back to title
    const description = normalizeStr(raw['Description']) || title;

    // Verification method and createdBy: optional legacy columns
    const verificationMethodRaw = normalizeStr(raw['Verification Method']).toLowerCase();
    const verificationMethod = VALID_METHODS.includes(verificationMethodRaw as VerificationMethod)
      ? (verificationMethodRaw as VerificationMethod)
      : 'test';
    const createdBy = normalizeStr(raw['Created By']) || owner;

    const standardsStr = normalizeStr(raw['Applicable Standards']);

    // Validation
    if (!title) rowErrors.push('Formal Requirement Title is required');
    if (!category) rowErrors.push('Category is required');
    else if (!VALID_CATEGORIES.includes(category as RequirementCategory))
      rowErrors.push(`Invalid category "${category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
    if (!reqType) rowErrors.push('Type is required');
    else if (!VALID_TYPES.includes(reqType as RequirementType))
      rowErrors.push(`Invalid type "${reqType}". Valid: ${VALID_TYPES.join(', ')}`);
    if (status && !VALID_STATUSES.includes(status as RequirementStatus))
      rowErrors.push(`Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`);
    if (priority && !VALID_PRIORITIES.includes(priority as RequirementPriority))
      rowErrors.push(`Invalid priority "${priority}". Valid: ${VALID_PRIORITIES.join(', ')}`);

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join('; ') });
      continue;
    }

    rows.push({
      title,
      description,
      rationale,
      category: category as RequirementCategory,
      reqType: reqType as RequirementType,
      status: (status || 'draft') as RequirementStatus,
      priority: (priority || 'medium') as RequirementPriority,
      owner: owner || createdBy,
      verificationMethod,
      acceptanceCriteria,
      createdBy,
      nominalValue: isNaN(nominalValue!) ? undefined : nominalValue,
      minValue: isNaN(minValue!) ? undefined : minValue,
      maxValue: isNaN(maxValue!) ? undefined : maxValue,
      unit: unit || undefined,
      applicableStandards: standardsStr ? standardsStr.split(';').map(s => s.trim()).filter(Boolean) : undefined,
    });
  }

  return { rows, errors, totalRows };
}
