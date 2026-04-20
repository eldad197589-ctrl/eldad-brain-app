// ==========================================
// FILE: accounting-core-session-shell.test.tsx
// PURPOSE: Verify the Session Shell functionally mounts properly and injects bounds.
// DEPENDENCIES: vitest, React definitions, AccountingCoreSessionShell
// ==========================================

import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Component Definitions Boundary
import { AccountingCoreSessionShell } from './accounting-core-session-shell';

// Mock useState
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  let activeState = {
    actorId: 'test_user',
    clientId: 'DEFAULT_CLIENT',
    accountingPeriodId: 'FY_DEFAULT'
  };
  return {
    ...actual,
    useState: (initial: any) => {
      if (typeof initial === 'function') {
        initial = initial();
      }
      return [initial || activeState, (newVal: any) => { activeState = newVal; }];
    }
  };
});

describe('Accounting Core — Session Shell UI Implementation', () => {

  it('validates shell module mounts and structurally provides the Context', () => {
    // 1. Session Shell mounts without hook crash natively in Node bounds
    const element = AccountingCoreSessionShell({
      children: <div data-testid="mock-child">Mock Layer</div>,
      initialSession: { actorId: 'test_actor_42' }
    });

    expect(element).toBeDefined();
    
    // Validate output is a Provider block
    expect(element.type).toHaveProperty('$$typeof');
    expect(element.props.value).toBeDefined();
    expect(element.props.value.session.actorId).toBe('test_actor_42');

    // Context bounds correctly wrapped the layout children
    const providerLayoutDiv = React.Children.toArray(element.props.children)[0] as React.ReactElement;
    expect(providerLayoutDiv).toBeDefined();
    expect(providerLayoutDiv.type).toBe('div');
  });

});
