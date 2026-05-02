/* ============================================
   FILE: settings-freeze.test.tsx
   PURPOSE: Focused tests for the /settings live integration UI freeze.
   DEPENDENCIES: vitest, react-dom/client, Settings
   EXPORTS: None
   ============================================ */

// #region Imports
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Settings from './Settings';
// #endregion

// #region Mocks
const mocked = vi.hoisted(() => {
  const integrationState = {
    googleClientId: '',
    googleAccessToken: null,
    setGoogleClientId: vi.fn(),
  };
  const vaultState = {
    status: 'connected',
    label: 'mock-brain-root',
    isScanning: false,
    scannedFolders: 0,
    scannedFiles: 0,
    currentPath: '',
    lastIndexedAt: '2026-05-01T10:00:00.000Z',
    totalFolders: 12,
    totalFiles: 34,
    initVault: vi.fn(),
    connectRoot: vi.fn(),
    checkPermission: vi.fn(),
    disconnectRoot: vi.fn(),
    startIndexScan: vi.fn(),
    clearIndex: vi.fn(),
  };

  return {
    integrationState,
    vaultState,
    signInWithGoogle: vi.fn(),
    signOutGoogle: vi.fn(),
  };
});

vi.mock('../../services/gmailService', () => ({
  signInWithGoogle: mocked.signInWithGoogle,
  signOutGoogle: mocked.signOutGoogle,
}));

vi.mock('../../store/integrationStore', () => ({
  useIntegrationStore: (selector: (state: typeof mocked.integrationState) => unknown) => selector(mocked.integrationState),
}));

vi.mock('../../store/localVaultStore', () => ({
  useLocalVaultStore: (selector: (state: typeof mocked.vaultState) => unknown) => selector(mocked.vaultState),
}));

vi.mock('./VaultBrowserPanel', () => ({
  default: () => 'Vault Browser Mock',
}));
// #endregion

// #region Test Harness
let container: HTMLDivElement;
let root: Root;

const renderSettings = () => {
  act(() => {
    root.render(React.createElement(Settings));
  });
};
// #endregion

// #region Tests
describe('Settings live integration freeze', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the Agent A freeze banner and env-only Gemini label', () => {
    renderSettings();

    expect(container.textContent).toContain('Live integrations disabled — requires Agent A approval');
    expect(container.textContent).toContain('Configuration visibility only — not a live connection check.');
    expect(container.textContent).toMatch(/Gemini env key (detected|missing)/);
  });

  it('disables all live Gmail, Drive, client id, and local vault actions', () => {
    renderSettings();

    const buttons = Array.from(container.querySelectorAll('button'));
    const clientIdInput = container.querySelector('input[placeholder="xxx.apps.googleusercontent.com"]');

    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((button) => button.disabled)).toBe(true);
    expect(clientIdInput).toBeInstanceOf(HTMLInputElement);
    expect((clientIdInput as HTMLInputElement).disabled).toBe(true);

    buttons.forEach((button) => button.click());

    expect(mocked.signInWithGoogle).not.toHaveBeenCalled();
    expect(mocked.signOutGoogle).not.toHaveBeenCalled();
    expect(mocked.integrationState.setGoogleClientId).not.toHaveBeenCalled();
    expect(mocked.vaultState.initVault).not.toHaveBeenCalled();
    expect(mocked.vaultState.connectRoot).not.toHaveBeenCalled();
    expect(mocked.vaultState.checkPermission).not.toHaveBeenCalled();
    expect(mocked.vaultState.disconnectRoot).not.toHaveBeenCalled();
    expect(mocked.vaultState.startIndexScan).not.toHaveBeenCalled();
    expect(mocked.vaultState.clearIndex).not.toHaveBeenCalled();
  });
});
// #endregion
