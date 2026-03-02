import * as XLSX from 'xlsx';
import type { Requirement } from '../types/requirements.ts';
import type { RequirementCategory, RequirementType, RequirementStatus, RequirementPriority, VerificationMethod } from '../types/enums.ts';

// ─── Column mapping ───────────────────────────────────────

const EXPORT_COLUMNS = [
  { header: 'Identifier', key: 'identifier' },
  { header: 'Title', key: 'title' },
  { header: 'Description', key: 'description' },
  { header: 'Rationale', key: 'rationale' },
  { header: 'Category', key: 'category' },
  { header: 'Type', key: 'reqType' },
  { header: 'Status', key: 'status' },
  { header: 'Priority', key: 'priority' },
  { header: 'Owner', key: 'owner' },
  { header: 'Verification Method', key: 'verificationMethod' },
  { header: 'Acceptance Criteria', key: 'acceptanceCriteria' },
  { header: 'Created By', key: 'createdBy' },
  { header: 'Nominal Value', key: 'nominalValue' },
  { header: 'Min Value', key: 'minValue' },
  { header: 'Max Value', key: 'maxValue' },
  { header: 'Unit', key: 'unit' },
  { header: 'Applicable Standards', key: 'applicableStandards' },
] as const;

// ─── Valid enum values ────────────────────────────────────

const VALID_CATEGORIES: RequirementCategory[] = ['system', 'subsystem', 'interface', 'safety', 'regulatory', 'manufacturing', 'service', 'performance'];
const VALID_TYPES: RequirementType[] = ['functional', 'performance', 'interface', 'physical', 'safety', 'operational'];
const VALID_STATUSES: RequirementStatus[] = ['draft', 'in_review', 'approved', 'baselined', 'deprecated'];
const VALID_PRIORITIES: RequirementPriority[] = ['critical', 'high', 'medium', 'low'];
const VALID_METHODS: VerificationMethod[] = ['analysis', 'test', 'inspection', 'demonstration', 'similarity'];

// ─── Export ───────────────────────────────────────────────

export function exportRequirementsToExcel(requirements: Requirement[], filename?: string) {
  const rows = requirements.map(r => {
    const row: Record<string, string | number | undefined> = {};
    for (const col of EXPORT_COLUMNS) {
      const val = (r as unknown as Record<string, unknown>)[col.key];
      if (col.key === 'applicableStandards') {
        row[col.header] = Array.isArray(val) ? (val as string[]).join('; ') : '';
      } else {
        row[col.header] = val as string | number | undefined;
      }
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: EXPORT_COLUMNS.map(c => c.header) });

  // Set column widths
  ws['!cols'] = EXPORT_COLUMNS.map(col => {
    if (col.key === 'description' || col.key === 'acceptanceCriteria') return { wch: 60 };
    if (col.key === 'rationale') return { wch: 50 };
    if (col.key === 'title') return { wch: 35 };
    if (col.key === 'applicableStandards') return { wch: 40 };
    return { wch: 18 };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Requirements');

  // Also add a reference sheet with valid enum values
  const refData = [
    ['Field', 'Valid Values'],
    ['Category', VALID_CATEGORIES.join(', ')],
    ['Type', VALID_TYPES.join(', ')],
    ['Status', VALID_STATUSES.join(', ')],
    ['Priority', VALID_PRIORITIES.join(', ')],
    ['Verification Method', VALID_METHODS.join(', ')],
  ];
  const refWs = XLSX.utils.aoa_to_sheet(refData);
  refWs['!cols'] = [{ wch: 22 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, refWs, 'Reference');

  const name = filename ?? `requirements-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

// ─── Template download ────────────────────────────────────

export function downloadImportTemplate() {
  const sampleRows = [
    {
      'Identifier': '(auto-generated)',
      'Title': 'Example: Payload Capacity',
      'Description': 'The robot shall carry a payload of 5.0 kg minimum.',
      'Rationale': 'Customer requirement for warehouse operations.',
      'Category': 'system',
      'Type': 'performance',
      'Status': 'draft',
      'Priority': 'critical',
      'Owner': 'J. Smith',
      'Verification Method': 'test',
      'Acceptance Criteria': 'Robot holds 5 kg at full extension for 30 sec.',
      'Created By': 'J. Smith',
      'Nominal Value': 5.0,
      'Min Value': 5.0,
      'Max Value': '',
      'Unit': 'kg',
      'Applicable Standards': 'ISO 10218-1:2011',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows, { header: EXPORT_COLUMNS.map(c => c.header) });
  ws['!cols'] = EXPORT_COLUMNS.map(col => {
    if (col.key === 'description' || col.key === 'acceptanceCriteria') return { wch: 60 };
    if (col.key === 'rationale') return { wch: 50 };
    if (col.key === 'title') return { wch: 35 };
    return { wch: 18 };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Requirements');

  const refData = [
    ['Field', 'Valid Values'],
    ['Category', VALID_CATEGORIES.join(', ')],
    ['Type', VALID_TYPES.join(', ')],
    ['Status', VALID_STATUSES.join(', ')],
    ['Priority', VALID_PRIORITIES.join(', ')],
    ['Verification Method', VALID_METHODS.join(', ')],
    ['', ''],
    ['Notes', ''],
    ['Identifier column', 'Leave blank or remove — identifiers are auto-generated on import.'],
    ['Applicable Standards', 'Separate multiple standards with semicolons.'],
  ];
  const refWs = XLSX.utils.aoa_to_sheet(refData);
  refWs['!cols'] = [{ wch: 24 }, { wch: 70 }];
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

function normalizeNum(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
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
    const rowNum = i + 2; // 1-indexed, header is row 1
    const rowErrors: string[] = [];

    const title = normalizeStr(raw['Title']);
    const description = normalizeStr(raw['Description']);
    const rationale = normalizeStr(raw['Rationale']);
    const category = normalizeStr(raw['Category']).toLowerCase();
    const reqType = normalizeStr(raw['Type']).toLowerCase();
    const status = normalizeStr(raw['Status']).toLowerCase().replace(/\s+/g, '_');
    const priority = normalizeStr(raw['Priority']).toLowerCase();
    const owner = normalizeStr(raw['Owner']);
    const verificationMethod = normalizeStr(raw['Verification Method']).toLowerCase();
    const acceptanceCriteria = normalizeStr(raw['Acceptance Criteria']);
    const createdBy = normalizeStr(raw['Created By']);
    const unit = normalizeStr(raw['Unit']);
    const standardsStr = normalizeStr(raw['Applicable Standards']);

    // Required field validation
    if (!title) rowErrors.push('Title is required');
    if (!description) rowErrors.push('Description is required');
    if (!category) rowErrors.push('Category is required');
    else if (!VALID_CATEGORIES.includes(category as RequirementCategory)) rowErrors.push(`Invalid category "${category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
    if (!reqType) rowErrors.push('Type is required');
    else if (!VALID_TYPES.includes(reqType as RequirementType)) rowErrors.push(`Invalid type "${reqType}". Valid: ${VALID_TYPES.join(', ')}`);
    if (status && !VALID_STATUSES.includes(status as RequirementStatus)) rowErrors.push(`Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`);
    if (priority && !VALID_PRIORITIES.includes(priority as RequirementPriority)) rowErrors.push(`Invalid priority "${priority}". Valid: ${VALID_PRIORITIES.join(', ')}`);
    if (verificationMethod && !VALID_METHODS.includes(verificationMethod as VerificationMethod)) rowErrors.push(`Invalid verification method "${verificationMethod}". Valid: ${VALID_METHODS.join(', ')}`);

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
      verificationMethod: (verificationMethod || 'test') as VerificationMethod,
      acceptanceCriteria,
      createdBy,
      nominalValue: normalizeNum(raw['Nominal Value']),
      minValue: normalizeNum(raw['Min Value']),
      maxValue: normalizeNum(raw['Max Value']),
      unit: unit || undefined,
      applicableStandards: standardsStr ? standardsStr.split(';').map(s => s.trim()).filter(Boolean) : undefined,
    });
  }

  return { rows, errors, totalRows };
}
