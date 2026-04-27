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

export type FolderCategory = 'client' | 'generated_output' | 'archive' | 'app_source' | 'system' | 'unknown';

export interface ManagedLocalFolder {
  relativePath: string;
  name: string;
  parentPath: string;
  depth: number;
  fileCount: number;
  folderCount: number;
  status: 'indexed' | 'skipped' | 'inaccessible';
  inferredCategory?: FolderCategory;
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
  inferredCategory?: FolderCategory;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
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
      if (oldVersion < 3) {
        const tx = request.transaction;
        if (tx) {
          const foldersStore = tx.objectStore('folders');
          if (!foldersStore.indexNames.contains('by_parentPath')) {
            foldersStore.createIndex('by_parentPath', 'parentPath', { unique: false });
          }
          const filesStore = tx.objectStore('files');
          if (!filesStore.indexNames.contains('by_parentPath')) {
            filesStore.createIndex('by_parentPath', 'parentPath', { unique: false });
          }
          if (!filesStore.indexNames.contains('by_extension')) {
            filesStore.createIndex('by_extension', 'extension', { unique: false });
          }
        }
      }
      if (oldVersion < 4) {
        const tx = request.transaction;
        if (tx) {
          const foldersStore = tx.objectStore('folders');
          if (!foldersStore.indexNames.contains('by_category')) {
            foldersStore.createIndex('by_category', 'inferredCategory', { unique: false });
          }
          const filesStore = tx.objectStore('files');
          if (!filesStore.indexNames.contains('by_category')) {
            filesStore.createIndex('by_category', 'inferredCategory', { unique: false });
          }
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
    const MAX_DEPTH = 8;
    const GLOBAL_EXCLUDED_DIRS = new Set(['.git', 'node_modules', '.DS_Store', 'Thumbs.db', 'AppData', '$RECYCLE.BIN', 'System Volume Information']);
    const APP_EXCLUDED_DIRS = new Set(['src', 'dist', 'public', 'tests', '.vercel', '.agents', '.gemini', 'scratch']);
    const INCLUDED_EXTS = new Set(['pdf', 'doc', 'docx', 'txt', 'html', 'htm', 'xlsx', 'xls', 'csv', 'zip', 'rar', 'jpg', 'jpeg', 'png']);

    const shouldExcludeDirectory = (entryName: string, currentPath: string): boolean => {
      if (GLOBAL_EXCLUDED_DIRS.has(entryName)) return true;
      if (currentPath === '' && (entryName === '.agents' || entryName === '.gemini' || entryName.startsWith('parallel_build_'))) return true;
      if (currentPath === 'brain-app' || currentPath.startsWith('brain-app/')) {
        if (APP_EXCLUDED_DIRS.has(entryName) || entryName.startsWith('parallel_build_')) return true;
      }
      return false;
    };

    const inferCategory = (path: string): FolderCategory => {
      if (path.startsWith('לקוחות/') || path.startsWith('דוד אלדד/') || path.startsWith('סריקות/')) return 'client';
      if (path.startsWith('brain-app/output/archive/')) return 'archive';
      if (path.startsWith('brain-app/output/') || path.startsWith('brain-app/cases/')) return 'generated_output';
      if (path.startsWith('brain-app/src/') || path.startsWith('brain-app/dist/')) return 'app_source';
      if (path.startsWith('.agents/') || path.startsWith('.gemini/')) return 'system';
      return 'unknown';
    };

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
            if (shouldExcludeDirectory(entry.name, currentPath)) continue;
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
              canOpen: INCLUDED_EXTS.has(ext),
              inferredCategory: inferCategory(newPath)
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
          status: 'inaccessible',
          inferredCategory: inferCategory(currentPath)
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
          status: 'indexed',
          inferredCategory: inferCategory(currentPath)
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
  },

  async searchIndex(query: string, options?: { extensionFilter?: string; categoryFilter?: FolderCategory; limit?: number }): Promise<{ folders: ManagedLocalFolder[]; files: LocalFileReference[]; totalMatched: number }> {
    const limit = options?.limit ?? 100;
    const lowerQuery = query.toLowerCase();
    const extFilter = options?.extensionFilter;
    const catFilter = options?.categoryFilter;
    
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['folders', 'files'], 'readonly');
      const matchedFolders: ManagedLocalFolder[] = [];
      const matchedFiles: LocalFileReference[] = [];
      let totalMatched = 0;

      const matchesQuery = (name: string, path: string, cat?: string) => {
        if (catFilter && cat !== catFilter) return false;
        if (!lowerQuery) return true;
        return name.toLowerCase().includes(lowerQuery) || path.toLowerCase().includes(lowerQuery);
      };

      const fileStore = tx.objectStore('files');
      let fileReq: IDBRequest;
      if (extFilter) {
        const index = fileStore.index('by_extension');
        fileReq = index.openCursor(IDBKeyRange.only(extFilter));
      } else if (catFilter && !lowerQuery) {
        const index = fileStore.index('by_category');
        fileReq = index.openCursor(IDBKeyRange.only(catFilter));
      } else {
        fileReq = fileStore.openCursor();
      }

      fileReq.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          const file = cursor.value as LocalFileReference;
          if (matchesQuery(file.name, file.relativePath, file.inferredCategory)) {
            totalMatched++;
            if (matchedFiles.length + matchedFolders.length < limit) {
              matchedFiles.push(file);
            }
          }
          cursor.continue();
        } else {
          if (extFilter) {
            resolve({ folders: matchedFolders, files: matchedFiles, totalMatched });
            return;
          }
          const folderStore = tx.objectStore('folders');
          let folderReq: IDBRequest;
          if (catFilter && !lowerQuery) {
            const index = folderStore.index('by_category');
            folderReq = index.openCursor(IDBKeyRange.only(catFilter));
          } else {
            folderReq = folderStore.openCursor();
          }
          
          folderReq.onsuccess = (e: any) => {
            const cursor2 = e.target.result;
            if (cursor2) {
              const folder = cursor2.value as ManagedLocalFolder;
              if (matchesQuery(folder.name, folder.relativePath, folder.inferredCategory)) {
                totalMatched++;
                if (matchedFiles.length + matchedFolders.length < limit) {
                  matchedFolders.push(folder);
                }
              }
              cursor2.continue();
            } else {
              const sortResults = (arr: any[]) => {
                if (!lowerQuery) return;
                arr.sort((a, b) => {
                  const aNameExact = a.name.toLowerCase() === lowerQuery;
                  const bNameExact = b.name.toLowerCase() === lowerQuery;
                  if (aNameExact && !bNameExact) return -1;
                  if (!aNameExact && bNameExact) return 1;
                  const aNameInc = a.name.toLowerCase().includes(lowerQuery);
                  const bNameInc = b.name.toLowerCase().includes(lowerQuery);
                  if (aNameInc && !bNameInc) return -1;
                  if (!aNameInc && bNameInc) return 1;
                  return 0;
                });
              };
              sortResults(matchedFolders);
              sortResults(matchedFiles);
              resolve({ folders: matchedFolders, files: matchedFiles, totalMatched });
            }
          };
        }
      };
      tx.onerror = () => reject(tx.error);
    });
  },

  async listFolderContents(parentPath: string): Promise<{ subfolders: ManagedLocalFolder[]; files: LocalFileReference[] }> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['folders', 'files'], 'readonly');
      const subfolders: ManagedLocalFolder[] = [];
      const files: LocalFileReference[] = [];
      const folderIdx = tx.objectStore('folders').index('by_parentPath');
      const fileIdx = tx.objectStore('files').index('by_parentPath');
      
      let pending = 2;
      const checkDone = () => {
        pending--;
        if (pending === 0) resolve({ subfolders, files });
      };

      const folderReq = folderIdx.getAll(parentPath);
      folderReq.onsuccess = () => {
        subfolders.push(...folderReq.result);
        checkDone();
      };
      
      const fileReq = fileIdx.getAll(parentPath);
      fileReq.onsuccess = () => {
        files.push(...fileReq.result);
        checkDone();
      };
      
      tx.onerror = () => reject(tx.error);
    });
  },

  async getExtensionSummary(): Promise<Array<{ ext: string; count: number }>> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const req = store.openCursor();
      const counts: Record<string, number> = {};
      
      req.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          const ext = cursor.value.extension;
          if (ext) counts[ext] = (counts[ext] || 0) + 1;
          cursor.continue();
        } else {
          const result = Object.keys(counts).map(ext => ({ ext, count: counts[ext] }));
          result.sort((a, b) => b.count - a.count || a.ext.localeCompare(b.ext));
          resolve(result);
        }
      };
      tx.onerror = () => reject(tx.error);
    });
  }
};
