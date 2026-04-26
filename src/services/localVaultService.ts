// ==========================================
// FILE: localVaultService.ts
// PURPOSE: Phase 1 connection to local brain vault via File System Access API
// ==========================================

const DB_NAME = 'BrainVaultDB';
const STORE_NAME = 'handles';
const ROOT_HANDLE_KEY = 'root_vault_handle';

export type VaultStatus = 'unsupported' | 'disconnected' | 'connected' | 'permission_required' | 'denied';

export interface LocalBrainRootIndex {
  key: 'root-index';
  rootLabel: string;
  indexedAt: string;
  totalFolders: number;
  totalFiles: number;
  maxDepthScanned: number;
  status: 'idle' | 'scanning' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

export interface ManagedLocalFolder {
  relativePath: string;
  name: string;
  parentPath: string;
  depth: number;
  fileCount: number;
  folderCount: number;
  status: 'indexed' | 'skipped' | 'inaccessible';
}

export interface LocalFileReference {
  relativePath: string;
  name: string;
  parentPath: string;
  extension: string;
  size?: number;
  lastModified?: number;
  depth: number;
  canOpen: boolean;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const oldVersion = e.oldVersion;
      if (oldVersion < 1 && !db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'relativePath' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'relativePath' });
        }
        if (!db.objectStoreNames.contains('indexMeta')) {
          db.createObjectStore('indexMeta', { keyPath: 'key' });
        }
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
  },

  async clearVaultIndex(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['folders', 'files', 'indexMeta'], 'readwrite');
      tx.objectStore('folders').clear();
      tx.objectStore('files').clear();
      tx.objectStore('indexMeta').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getVaultIndexSummary(): Promise<LocalBrainRootIndex | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('indexMeta', 'readonly');
      const store = tx.objectStore('indexMeta');
      const req = store.get('root-index');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async scanLocalBrainVault(onProgress?: (stats: { scannedFolders: number; scannedFiles: number; currentPath: string }) => void): Promise<void> {
    const handle = await this.getStoredLocalBrainRootHandle();
    if (!handle) throw new Error('No vault connected');
    
    const perm = await this.queryLocalBrainRootPermission(handle);
    if (perm !== 'granted') {
      const reqPerm = await this.requestLocalBrainRootPermission(handle);
      if (reqPerm !== 'granted') throw new Error('Permission denied to scan vault');
    }

    await this.clearVaultIndex();
    
    let scannedFolders = 0;
    let scannedFiles = 0;
    let iterations = 0;
    const MAX_DEPTH = 5;
    const EXCLUDED_DIRS = new Set(['.git', 'node_modules', '.DS_Store', 'Thumbs.db', 'AppData', '$RECYCLE.BIN', 'System Volume Information']);
    const INCLUDED_EXTS = new Set(['pdf', 'doc', 'docx', 'txt', 'html', 'htm', 'xlsx', 'xls', 'csv', 'zip', 'rar', 'jpg', 'jpeg', 'png']);

    const db = await getDB();
    
    // Helper to save a batch
    const saveBatch = async (folders: ManagedLocalFolder[], files: LocalFileReference[]) => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['folders', 'files'], 'readwrite');
        const folderStore = tx.objectStore('folders');
        const fileStore = tx.objectStore('files');
        folders.forEach(f => folderStore.put(f));
        files.forEach(f => fileStore.put(f));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    };

    let batchFolders: ManagedLocalFolder[] = [];
    let batchFiles: LocalFileReference[] = [];

    const flushBatch = async () => {
      if (batchFolders.length > 0 || batchFiles.length > 0) {
        await saveBatch(batchFolders, batchFiles);
        batchFolders = [];
        batchFiles = [];
      }
    };

    const traverse = async (dirHandle: any, currentPath: string, depth: number) => {
      if (depth > MAX_DEPTH) return;
      
      let folderCount = 0;
      let fileCount = 0;

      try {
        for await (const entry of dirHandle.values()) {
          iterations++;
          if (iterations % 100 === 0) {
            await flushBatch();
            onProgress?.({ scannedFolders, scannedFiles, currentPath });
            await new Promise(r => setTimeout(r, 0)); // yield
          }

          if (entry.kind === 'directory') {
            if (EXCLUDED_DIRS.has(entry.name)) continue;
            folderCount++;
            scannedFolders++;
            const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            await traverse(entry, newPath, depth + 1);
          } else if (entry.kind === 'file') {
            const ext = entry.name.split('.').pop()?.toLowerCase() || '';
            fileCount++;
            scannedFiles++;
            const newPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
            
            let size, lastModified;
            try {
              const fileData = await entry.getFile();
              size = fileData.size;
              lastModified = fileData.lastModified;
            } catch (e) {
              // skip file metadata if it fails
            }

            batchFiles.push({
              relativePath: newPath,
              name: entry.name,
              parentPath: currentPath,
              extension: ext,
              size,
              lastModified,
              depth: depth + 1,
              canOpen: INCLUDED_EXTS.has(ext)
            });
          }
        }
      } catch (e) {
        console.warn(`Inaccessible folder: ${currentPath}`, e);
        batchFolders.push({
          relativePath: currentPath,
          name: dirHandle.name,
          parentPath: currentPath.split('/').slice(0, -1).join('/'),
          depth,
          fileCount: 0,
          folderCount: 0,
          status: 'inaccessible'
        });
        return;
      }

      if (currentPath) { // don't save root as a folder
        batchFolders.push({
          relativePath: currentPath,
          name: dirHandle.name,
          parentPath: currentPath.split('/').slice(0, -1).join('/'),
          depth,
          fileCount,
          folderCount,
          status: 'indexed'
        });
      }
    };

    const startTime = new Date().toISOString();
    
    // Write scanning status
    const updateIndexMeta = async (status: LocalBrainRootIndex['status'], error?: string) => {
      const meta: LocalBrainRootIndex = {
        key: 'root-index',
        rootLabel: handle.name,
        indexedAt: startTime,
        totalFolders: scannedFolders,
        totalFiles: scannedFiles,
        maxDepthScanned: MAX_DEPTH,
        status,
        error
      };
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('indexMeta', 'readwrite');
        tx.objectStore('indexMeta').put(meta);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    };

    try {
      await updateIndexMeta('scanning');
      await traverse(handle, '', 0);
      await flushBatch();
      await updateIndexMeta('completed');
    } catch (err: any) {
      await updateIndexMeta('failed', err.message);
      throw err;
    }
  }
};
