import type { BomItemId, SupplierId, RevisionId, Timestamp } from './ids.ts';
import type { BomItemCategory } from './enums.ts';

export interface BomItem {
  id: BomItemId;
  revisionId: RevisionId;
  parentItemId?: BomItemId;
  partNumber: string;
  name: string;
  description: string;
  category: BomItemCategory;
  quantity: number;
  unitCost: number;
  currency: string;
  supplierId?: SupplierId;
  leadTimeDays?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Supplier {
  id: SupplierId;
  name: string;
  contactEmail: string;
  website?: string;
  notes: string;
  createdAt: Timestamp;
}
