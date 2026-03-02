import type { RequirementCategory, RequirementStatus, RequirementPriority, LifecyclePhase } from './enums.ts';

export const CATEGORY_META: Record<RequirementCategory, { label: string; prefix: string; color: string }> = {
  system:        { label: 'System',        prefix: 'SYS', color: 'blue' },
  subsystem:     { label: 'Subsystem',     prefix: 'SUB', color: 'indigo' },
  interface:     { label: 'Interface',     prefix: 'IFC', color: 'violet' },
  safety:        { label: 'Safety',        prefix: 'SAF', color: 'red' },
  regulatory:    { label: 'Regulatory',    prefix: 'REG', color: 'emerald' },
  manufacturing: { label: 'Manufacturing', prefix: 'MFG', color: 'slate' },
  service:       { label: 'Service',       prefix: 'SVC', color: 'amber' },
  performance:   { label: 'Performance',   prefix: 'PRF', color: 'cyan' },
};

export const STATUS_META: Record<RequirementStatus, { label: string; color: string }> = {
  draft:      { label: 'Draft',      color: 'gray' },
  in_review:  { label: 'In Review',  color: 'yellow' },
  approved:   { label: 'Approved',   color: 'green' },
  baselined:  { label: 'Baselined',  color: 'blue' },
  deprecated: { label: 'Deprecated', color: 'slate' },
};

export const PRIORITY_META: Record<RequirementPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'red' },
  high:     { label: 'High',     color: 'orange' },
  medium:   { label: 'Medium',   color: 'yellow' },
  low:      { label: 'Low',      color: 'gray' },
};

export const PHASE_META: Record<LifecyclePhase, { label: string; description: string }> = {
  concept:    { label: 'Concept',    description: 'Pre-Alpha: Requirements drafting & risk assessment' },
  alpha:      { label: 'Alpha',      description: 'First prototype: Subsystem elaboration & analysis' },
  beta:       { label: 'Beta',       description: 'Beta prototype: Requirements baselined, testing begins' },
  dvt:        { label: 'DVT',        description: 'Design Verification: Formal test campaigns' },
  pvt:        { label: 'PVT',        description: 'Pilot Build: Production-intent validation' },
  production: { label: 'Production', description: 'Released: ECO-governed changes only' },
};
