import { create } from 'zustand';
import { localVaultService, VaultStatus, LocalBrainRootIndex } from '../services/localVaultService';

interface LocalVaultState {
  status: VaultStatus;
  label: string | null;
  handle: any | null; // FileSystemDirectoryHandle
  
  // Phase 2: Index state
  isScanning: boolean;
  scannedFolders: number;
  scannedFiles: number;
  currentPath: string;
  lastIndexedAt: string | null;
  totalFolders: number;
  totalFiles: number;
  scanError: string | null;

  initVault: () => Promise<void>;
  connectRoot: () => Promise<void>;
  checkPermission: () => Promise<void>;
  disconnectRoot: () => Promise<void>;

  startIndexScan: () => Promise<void>;
  loadIndexSummary: () => Promise<void>;
  clearIndex: () => Promise<void>;
}

export const useLocalVaultStore = create<LocalVaultState>((set, get) => ({
  status: 'disconnected',
  label: null,
  handle: null,

  isScanning: false,
  scannedFolders: 0,
  scannedFiles: 0,
  currentPath: '',
  lastIndexedAt: null,
  totalFolders: 0,
  totalFiles: 0,
  scanError: null,

  initVault: async () => {
    try {
      const info = await localVaultService.getLocalBrainRootStatus();
      set({ status: info.status, label: info.label || null, handle: info.handle || null });
      if (info.status === 'connected') {
        await get().loadIndexSummary();
      }
    } catch (err) {
      console.error('initVault error', err);
    }
  },

  connectRoot: async () => {
    try {
      const handle = await localVaultService.connectLocalBrainRoot();
      const info = await localVaultService.getLocalBrainRootStatus();
      set({ status: info.status, label: info.label || null, handle: info.handle || null });
    } catch (error) {
      console.error('Error connecting vault:', error);
      // user might have cancelled the picker
    }
  },

  checkPermission: async () => {
    const { handle } = get();
    if (!handle) return;
    try {
      const newStatus = await localVaultService.requestLocalBrainRootPermission(handle);
      if (newStatus === 'granted') {
        set({ status: 'connected' });
        await get().loadIndexSummary();
      } else if (newStatus === 'denied') {
        set({ status: 'denied' });
      } else {
        set({ status: 'permission_required' });
      }
    } catch (err) {
      console.error('Permission check failed', err);
    }
  },

  disconnectRoot: async () => {
    await localVaultService.clearLocalBrainRoot();
    set({ status: 'disconnected', label: null, handle: null });
  },

  startIndexScan: async () => {
    const { status } = get();
    if (status !== 'connected') return;

    set({ isScanning: true, scanError: null, scannedFolders: 0, scannedFiles: 0, currentPath: '' });
    try {
      await localVaultService.scanLocalBrainVault((stats) => {
        set({
          scannedFolders: stats.scannedFolders,
          scannedFiles: stats.scannedFiles,
          currentPath: stats.currentPath
        });
      });
      await get().loadIndexSummary();
    } catch (err: any) {
      console.error('Vault scan failed:', err);
      set({ scanError: err.message || 'Scan failed' });
    } finally {
      set({ isScanning: false });
    }
  },

  loadIndexSummary: async () => {
    try {
      const summary = await localVaultService.getVaultIndexSummary();
      if (summary && summary.status === 'completed') {
        set({
          lastIndexedAt: summary.indexedAt,
          totalFolders: summary.totalFolders,
          totalFiles: summary.totalFiles,
          scanError: summary.error || null,
        });
      }
    } catch (err) {
      console.error('Failed to load vault summary', err);
    }
  },

  clearIndex: async () => {
    try {
      await localVaultService.clearVaultIndex();
      set({
        lastIndexedAt: null,
        totalFolders: 0,
        totalFiles: 0,
        scannedFolders: 0,
        scannedFiles: 0,
        currentPath: ''
      });
    } catch (err) {
      console.error('Failed to clear index', err);
    }
  }
}));
