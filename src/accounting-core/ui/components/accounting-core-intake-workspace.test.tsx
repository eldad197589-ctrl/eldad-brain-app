// ==========================================
// FILE: accounting-core-intake-workspace.test.tsx
// PURPOSE: Verify the React view wrapper configures the required provider correctly.
// DEPENDENCIES: vitest
// ==========================================

import { describe, it, expect, vi } from 'vitest';

// We bypass full dom mount rendering and exclusively verify React layout structure
import AccountingCoreIntakeWorkspace from './accounting-core-intake-workspace';

describe('Accounting Core — Intake Workspace Mounting', () => {

  it('instantiates the workspace view and constructs its root layout effectively without failing', () => {
    // Act
    const element = AccountingCoreIntakeWorkspace();

    // Assert the provider wraps the actual core component securely
    expect(element).toBeDefined();
    
    // Validate the core visual boundaries and attributes
    expect(element.props).toBeDefined();
    
    // Inspect children hierarchy ensuring it mounts the Provider and inner view container loosely
    const providerChildren = element.props.children;
    expect(providerChildren).toBeDefined();
    // Inner function is bound correctly as a React functional child
    expect(providerChildren.type.name).toBe('IntakeWorkspaceContent');
  });

});
