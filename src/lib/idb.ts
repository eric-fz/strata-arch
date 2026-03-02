import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'strata';
const DB_VERSION = 1;

const STORES = [
  'families', 'variants', 'revisions',
  'requirements', 'links',
  'architectureElements', 'architectureInterfaces',
  'artifacts',
  'testPlans', 'testCases', 'testRuns', 'testResults', 'testEvidence',
  'bomItems', 'suppliers',
  'milestones', 'gatingEvents', 'dependencies',
  'changeProposals', 'baselines',
  'releases', 'fieldedUnits', 'maintenanceEvents', 'incidents',
  'reviews', 'signOffs',
  'reqArchLinks', 'reqArtifactLinks', 'reqTestCaseLinks', 'archArtifactLinks',
] as const;

export type StoreName = typeof STORES[number];

let dbPromise: Promise<IDBPDatabase> | null = null;

export function openStrataDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openStrataDB();
  return db.getAll(store) as Promise<T[]>;
}

export async function idbPut<T extends { id: string }>(store: StoreName, item: T): Promise<void> {
  const db = await openStrataDB();
  await db.put(store, item);
}

export async function idbPutMany<T extends { id: string }>(store: StoreName, items: T[]): Promise<void> {
  const db = await openStrataDB();
  const tx = db.transaction(store, 'readwrite');
  for (const item of items) {
    tx.store.put(item);
  }
  await tx.done;
}

export async function idbDelete(store: StoreName, id: string): Promise<void> {
  const db = await openStrataDB();
  await db.delete(store, id);
}

export async function idbClear(store: StoreName): Promise<void> {
  const db = await openStrataDB();
  await db.clear(store);
}

export async function idbClearAll(): Promise<void> {
  const db = await openStrataDB();
  for (const store of STORES) {
    await db.clear(store);
  }
}

export async function idbExportAll(): Promise<Record<StoreName, unknown[]>> {
  const db = await openStrataDB();
  const result: Record<string, unknown[]> = {};
  for (const store of STORES) {
    result[store] = await db.getAll(store);
  }
  return result as Record<StoreName, unknown[]>;
}

export async function idbImportAll(data: Record<string, unknown[]>): Promise<void> {
  const db = await openStrataDB();
  for (const store of STORES) {
    if (data[store]) {
      const tx = db.transaction(store, 'readwrite');
      await tx.store.clear();
      for (const item of data[store]) {
        tx.store.put(item);
      }
      await tx.done;
    }
  }
}
