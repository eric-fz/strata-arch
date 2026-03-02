import { nanoid } from 'nanoid';

export function genId(): string {
  return nanoid();
}

export function genIdentifier(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}
