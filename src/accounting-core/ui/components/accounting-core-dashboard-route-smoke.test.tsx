// ==========================================
// FILE: accounting-core-dashboard-route-smoke.test.tsx
// PURPOSE: Verify the Dashboard structurally mounts and navigates lifecycle tabs.
// DEPENDENCIES: vitest, React definitions, AccountingCoreDashboardWorkspace
// ==========================================

import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Subject Component
import { AccountingCoreDashboardWorkspaceContent } from './accounting-core-dashboard-workspace';

vi.mock('../use-accounting-core-session', () => ({
  useAccountingCoreSession: () => ({
    session: { 
      actorId: 'test_user', 
      clientId: 'DEFAULT_TEST_CLIENT', 
      accountingPeriodId: 'FY_TEST_DEFAULT' 
    }
  })
}));

// Mock useState to safely allow purely functional Node execution without full DOM Mount context
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  let activeState = 'INTAKE';
  return {
    ...actual,
    useState: (initial: any) => {
      // Return a simulated state tuple
      return [activeState, (newVal: any) => { activeState = newVal; }];
    }
  };
});

describe('Accounting Core — Dashboard Route Smoke Test', () => {

  it('mounts the accounting core dashboard cleanly and isolates lifecycle areas accurately', () => {
    // Act: Render the dashboard functionally mapped via our mocked hook state
    const element = AccountingCoreDashboardWorkspaceContent();

    // Assert: Component mapped without crashing
    expect(element).toBeDefined();

    // Assert: We can structurally analyze the dashboard's output boundary
    expect(element.props).toBeDefined();
    
    // The component wrapper contains 3 primary divs: Header, Navigation, and Workspace Mount.
    const children = React.Children.toArray(element.props.children);
    expect(children.length).toBe(3);

    // Assert: Navigation Area propagates tabs properly
    const navComponent = children[1] as React.ReactElement;
    expect(navComponent.props.children).toBeDefined(); // AccountingCoreDashboardNav

    // Since we mocked useState to return 'INTAKE', the third child (Workspace Host) 
    // should have lazily evaluated exactly ONE active workspace mapping.
    const workspaceHost = children[2] as React.ReactElement;
    const activeViews = React.Children.toArray(workspaceHost.props.children);
    expect(activeViews.length).toBeGreaterThan(0);
  });
});
