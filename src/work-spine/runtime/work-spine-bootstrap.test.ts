// ==========================================
// FILE: work-spine-bootstrap.test.ts
// PURPOSE: Verify Work Spine startup remains idempotent with localStorage drift.
// ==========================================

import { beforeEach, describe, expect, it } from 'vitest';
import { FileBasedWorkItemRepository } from '../persistence/file-based-work-item-repository';
import { WorkItemStatus, type WorkDomainType, type WorkItemRecord } from '../types/work-spine-types';
import { initializeWorkSpineEnvironment } from './work-spine-bootstrap';

const WORK_ITEM_PREFIX = 'work_spine/work_item/';
const WORK_ITEM_INDEX_KEY = 'work_spine/work_item/__index__';

class TestLocalStorage implements Storage {
  private readonly records = new Map<string, string>();

  public get length(): number {
    return this.records.size;
  }

  public clear(): void {
    this.records.clear();
  }

  public getItem(key: string): string | null {
    return this.records.get(key) ?? null;
  }

  public key(index: number): string | null {
    return [...this.records.keys()][index] ?? null;
  }

  public removeItem(key: string): void {
    this.records.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.records.set(key, value);
  }
}

const storage = new TestLocalStorage();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: storage,
});

function makeWorkItem(
  id: string,
  title: string,
  domainType: WorkDomainType = 'ACCOUNTING_CORE',
): WorkItemRecord {
  return {
    id,
    domain_type: domainType,
    title,
    next_action_description: 'בדיקת bootstrap',
    status: WorkItemStatus.NEW,
    created_at: '2026-05-04T00:00:00.000Z',
    updated_at: '2026-05-04T00:00:00.000Z',
  };
}

function storedWorkItemIds(): string[] {
  const ids: string[] = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);

    if (key?.startsWith(WORK_ITEM_PREFIX) && key !== WORK_ITEM_INDEX_KEY) {
      ids.push(key.slice(WORK_ITEM_PREFIX.length));
    }
  }

  return ids.sort();
}

function indexIds(): string[] {
  return JSON.parse(localStorage.getItem(WORK_ITEM_INDEX_KEY) ?? '[]') as string[];
}

describe('initializeWorkSpineEnvironment', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not throw when a demo WorkItem exists but the index is missing', () => {
    localStorage.setItem(
      `${WORK_ITEM_PREFIX}wi-r-1`,
      JSON.stringify(makeWorkItem('wi-r-1', 'סגירת מע"מ')),
    );

    expect(() => initializeWorkSpineEnvironment()).not.toThrow();
    expect(indexIds()).toContain('wi-r-1');
  });

  it('rebuilds the Work Spine index from existing WorkItem records before startup reads', () => {
    localStorage.setItem(
      `${WORK_ITEM_PREFIX}wi-r-4`,
      JSON.stringify(makeWorkItem('wi-r-4', 'דימה', 'WAR_COMPENSATION')),
    );

    initializeWorkSpineEnvironment();

    expect(indexIds()).toContain('wi-r-4');
  });

  it('can run twice without throwing or duplicating stored demo WorkItems', () => {
    expect(() => {
      initializeWorkSpineEnvironment();
      initializeWorkSpineEnvironment();
    }).not.toThrow();

    expect(storedWorkItemIds()).toEqual([
      'wi-r-1',
      'wi-r-2',
      'wi-r-3',
      'wi-r-4',
      'wi-r-5',
      'wi-r-6',
      'wi-r-7',
      'wi-r-8',
    ]);
  });

  it('keeps existing demo WorkItems instead of recreating duplicate records', () => {
    localStorage.setItem(
      `${WORK_ITEM_PREFIX}wi-r-1`,
      JSON.stringify(makeWorkItem('wi-r-1', 'סגירת מע"מ')),
    );

    initializeWorkSpineEnvironment();

    expect(storedWorkItemIds().filter(id => id === 'wi-r-1')).toHaveLength(1);
  });

  it('keeps FileBasedWorkItemRepository duplicate creation strict outside bootstrap', () => {
    const repo = new FileBasedWorkItemRepository();
    const item = makeWorkItem('wi-direct-duplicate', 'Direct duplicate check');

    repo.create(item);

    expect(() => repo.create(item)).toThrow(/already exists/);
  });
});
