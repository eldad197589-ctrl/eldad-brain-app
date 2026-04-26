// ==========================================
// FILE: localVaultService.ts
// PURPOSE: Phase 1 connection to local brain vault via File System Access API
// ==========================================

const DB_NAME = 'BrainVaultDB';
const STORE_NAME = 'handles';
const ROOT_HANDLE_KEY = 'root_vault_handle';

export type VaultStatus = 'unsupported' | 'disconnected' | 'connected' | 'permission_required' | 'denied';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const localVaultService = {
  isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  },

  async getStoredLocalBrainRootHandle(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isFileSystemAccessSupported()) return null;
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(ROOT_HANDLE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async setStoredLocalBrainRootHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(handle, ROOT_HANDLE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async connectLocalBrainRoot(): Promise<FileSystemDirectoryHandle> {
    if (!this.isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported in this browser.');
    }
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite'
    });
    await this.setStoredLocalBrainRootHandle(handle);
    return handle;
  },

  async queryLocalBrainRootPermission(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
    const options = { mode: 'readwrite' };
    return await (handle as any).queryPermission(options);
  },

  async requestLocalBrainRootPermission(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
    const options = { mode: 'readwrite' };
    return await (handle as any).requestPermission(options);
  },

  async clearLocalBrainRoot(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(ROOT_HANDLE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  
  async getLocalBrainRootStatus(): Promise<{ status: VaultStatus; label?: string; handle?: FileSystemDirectoryHandle }> {
    if (!this.isFileSystemAccessSupported()) {
      return { status: 'unsupported' };
    }
    const handle = await this.getStoredLocalBrainRootHandle();
    if (!handle) {
      return { status: 'disconnected' };
    }
    
    try {
      const perm = await this.queryLocalBrainRootPermission(handle);
      if (perm === 'granted') {
        return { status: 'connected', label: handle.name, handle };
      } else if (perm === 'prompt') {
        return { status: 'permission_required', label: handle.name, handle };
      } else {
        return { status: 'denied', label: handle.name, handle };
      }
    } catch (e) {
      return { status: 'disconnected' };
    }
  }
};
