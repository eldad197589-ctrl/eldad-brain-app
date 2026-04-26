import { create } from 'zustand';
import { localVaultService, VaultStatus } from '../services/localVaultService';

interface LocalVaultState {
  status: VaultStatus;
  label: string | null;
  handle: any | null; // FileSystemDirectoryHandle
  initVault: () => Promise<void>;
  connectRoot: () => Promise<void>;
  checkPermission: () => Promise<void>;
  disconnectRoot: () => Promise<void>;
}

export const useLocalVaultStore = create<LocalVaultState>((set, get) => ({
  status: 'disconnected',
  label: null,
  handle: null,

  initVault: async () => {
    try {
      const info = await localVaultService.getLocalBrainRootStatus();
      set({ status: info.status, label: info.label || null, handle: info.handle || null });
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
  }
}));
