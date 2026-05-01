/* ============================================
   FILE: scanned-folder-listing.test.ts
   PURPOSE: Focused tests for read-only scanned folder listing utility.
   DEPENDENCIES: vitest, node fs/path/os, scanned-folder-listing
   EXPORTS: None
   ============================================ */

// #region Imports
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { listScannedFolderFiles, listScannedFolderFilesRecursive } from './scanned-folder-listing';
// #endregion

// #region Helpers
const tempRoots: string[] = [];

const createTempFolder = async (): Promise<string> => {
  const folderPath = await mkdtemp(path.join(os.tmpdir(), 'brain-spine-scans-'));
  tempRoots.push(folderPath);
  return folderPath;
};

const snapshotFolder = async (folderPath: string): Promise<Array<{ name: string; isDirectory: boolean; size: number }>> => {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const snapshot = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(folderPath, entry.name);
    const entryStats = await stat(entryPath);
    return {
      name: entry.name,
      isDirectory: entry.isDirectory(),
      size: entryStats.size,
    };
  }));
  return snapshot.sort((a, b) => a.name.localeCompare(b.name, 'en'));
};

const snapshotTree = async (folderPath: string): Promise<string[]> => {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const collected: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(folderPath, entry.name);
    collected.push(path.relative(folderPath, entryPath));
    if (entry.isDirectory() && !entry.isSymbolicLink()) {
      const nestedEntries = await snapshotTree(entryPath);
      collected.push(...nestedEntries.map((nestedEntry) => path.join(entry.name, nestedEntry)));
    }
  }
  return collected.sort((a, b) => a.localeCompare(b, 'en'));
};
// #endregion

// #region Tests
describe('listScannedFolderFiles', () => {
  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map((folderPath) => rm(folderPath, { recursive: true, force: true })));
  });

  it('lists supported scanned files from a controlled folder and returns metadata', async () => {
    const folderPath = await createTempFolder();
    await writeFile(path.join(folderPath, 'scan-a.pdf'), 'pdf-a');
    await writeFile(path.join(folderPath, 'scan-b.JPG'), 'jpg-b');
    await writeFile(path.join(folderPath, 'scan-c.tiff'), 'tiff-c');
    await writeFile(path.join(folderPath, 'notes.txt'), 'not-supported');
    await writeFile(path.join(folderPath, '.hidden.pdf'), 'hidden');
    await writeFile(path.join(folderPath, '~$temp.pdf'), 'temp');
    await mkdir(path.join(folderPath, 'nested'));
    await writeFile(path.join(folderPath, 'nested', 'nested.pdf'), 'nested-pdf');

    const beforeSnapshot = await snapshotFolder(folderPath);
    const result = await listScannedFolderFiles(folderPath);
    const afterSnapshot = await snapshotFolder(folderPath);

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.files.map((file) => file.fileName)).toEqual(['scan-a.pdf', 'scan-b.JPG', 'scan-c.tiff']);
    expect(result.ignoredCount).toBe(4);
    expect(result.supportedExtensions).toEqual(['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff']);
    expect(result.files[0]).toMatchObject({
      fileName: 'scan-a.pdf',
      extension: '.pdf',
      absolutePath: path.join(folderPath, 'scan-a.pdf'),
      sizeBytes: 5,
      isDirectory: false,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
    });
    expect(result.files[0]?.createdAt).toEqual(expect.any(String));
    expect(result.files[0]?.modifiedAt).toEqual(expect.any(String));
    expect(afterSnapshot).toEqual(beforeSnapshot);
    await expect(readFile(path.join(folderPath, 'scan-a.pdf'), 'utf8')).resolves.toBe('pdf-a');
    await expect(readFile(path.join(folderPath, 'nested', 'nested.pdf'), 'utf8')).resolves.toBe('nested-pdf');
  });

  it('handles an empty folder safely', async () => {
    const folderPath = await createTempFolder();

    const result = await listScannedFolderFiles(folderPath);

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.files).toEqual([]);
    expect(result.ignoredCount).toBe(0);
  });

  it('handles a missing folder with a typed read-only error', async () => {
    const folderPath = path.join(os.tmpdir(), 'brain-spine-missing-scans-folder');

    const result = await listScannedFolderFiles(folderPath);

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected missing folder failure');
    expect(result.error).toMatchObject({
      code: 'missing_folder',
      folderPath: path.resolve(folderPath),
    });
    expect(result.files).toEqual([]);
    expect(result.ignoredCount).toBe(0);
  });

  it('does not import stores or create Brain Spine professional records', async () => {
    const sourcePath = path.resolve('src/work-spine/intake/scanned-folder-listing.ts');
    const source = await readFile(sourcePath, 'utf8');

    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('MatterRecord');
    expect(source).not.toContain('DocumentRef');
    expect(source).not.toContain('IntakeEvent');
    expect(source).not.toContain('IntakeAttachment');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('rename(');
    expect(source).not.toContain('unlink(');
    expect(source).not.toContain('rm(');
    expect(source).not.toContain('writeFile(');
  });
});

describe('listScannedFolderFilesRecursive', () => {
  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map((folderPath) => rm(folderPath, { recursive: true, force: true })));
  });

  it('lists nested supported files through maxDepth and reports recursive metadata/counts', async () => {
    const folderPath = await createTempFolder();
    const level1 = path.join(folderPath, 'level-1');
    const level2 = path.join(level1, 'level-2');
    const level3 = path.join(level2, 'level-3');
    const nodeModules = path.join(folderPath, 'node_modules');
    const cacheFolder = path.join(folderPath, '.cache');

    await mkdir(level3, { recursive: true });
    await mkdir(nodeModules);
    await mkdir(cacheFolder);
    await writeFile(path.join(folderPath, 'root.pdf'), 'root-pdf');
    await writeFile(path.join(folderPath, 'ignored.txt'), 'ignored');
    await writeFile(path.join(level1, 'child.jpg'), 'child-jpg');
    await writeFile(path.join(level1, 'readme.txt'), 'readme');
    await writeFile(path.join(level2, 'deep.png'), 'deep-png');
    await writeFile(path.join(level3, 'too-deep.pdf'), 'too-deep');
    await writeFile(path.join(nodeModules, 'ignored.pdf'), 'ignored-noise');
    await writeFile(path.join(cacheFolder, 'ignored.pdf'), 'ignored-cache');

    let symlinkCreated = false;
    try {
      await symlink(path.join(folderPath, 'root.pdf'), path.join(folderPath, 'linked.pdf'));
      symlinkCreated = true;
    } catch {
      symlinkCreated = false;
    }

    const beforeSnapshot = await snapshotTree(folderPath);
    const result = await listScannedFolderFilesRecursive(folderPath, { maxDepth: 2 });
    const afterSnapshot = await snapshotTree(folderPath);

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.files.map((file) => file.relativePathFromRoot)).toEqual([
      'level-1\\child.jpg',
      'level-1\\level-2\\deep.png',
      'root.pdf',
    ].sort((a, b) => a.localeCompare(b, 'en')));
    expect(result.files.map((file) => file.fileName)).not.toContain('too-deep.pdf');
    expect(result.files.map((file) => file.fileName)).not.toContain('ignored.pdf');
    expect(result.files.map((file) => file.fileName)).not.toContain('linked.pdf');

    const child = result.files.find((file) => file.fileName === 'child.jpg');
    const deep = result.files.find((file) => file.fileName === 'deep.png');
    const root = result.files.find((file) => file.fileName === 'root.pdf');

    expect(root).toMatchObject({
      relativePathFromRoot: 'root.pdf',
      depth: 0,
      parentFolderName: path.basename(folderPath),
      folderPath,
      sourceRoot: folderPath,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
    });
    expect(child).toMatchObject({
      relativePathFromRoot: path.join('level-1', 'child.jpg'),
      depth: 1,
      parentFolderName: 'level-1',
      folderPath: level1,
      sourceRoot: folderPath,
    });
    expect(deep).toMatchObject({
      relativePathFromRoot: path.join('level-1', 'level-2', 'deep.png'),
      depth: 2,
      parentFolderName: 'level-2',
      folderPath: level2,
      sourceRoot: folderPath,
    });

    expect(result.counts).toMatchObject({
      supportedFiles: 3,
      ignoredFiles: symlinkCreated ? 3 : 2,
      ignoredFolders: 2,
      scannedFolders: 3,
      maxDepthSkipped: 1,
      errors: 0,
    });
    expect(result.ignoredCount).toBe((result.counts?.ignoredFiles ?? 0) + (result.counts?.ignoredFolders ?? 0));
    expect(result.errors).toEqual([]);
    expect(afterSnapshot).toEqual(beforeSnapshot);
    await expect(readFile(path.join(level3, 'too-deep.pdf'), 'utf8')).resolves.toBe('too-deep');
  });

  it('honors depth 0 as root only', async () => {
    const folderPath = await createTempFolder();
    const childFolder = path.join(folderPath, 'child-folder');
    await mkdir(childFolder);
    await writeFile(path.join(folderPath, 'root.pdf'), 'root');
    await writeFile(path.join(childFolder, 'child.pdf'), 'child');

    const result = await listScannedFolderFilesRecursive(folderPath, { maxDepth: 0 });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.files.map((file) => file.fileName)).toEqual(['root.pdf']);
    expect(result.counts).toMatchObject({
      supportedFiles: 1,
      scannedFolders: 1,
      maxDepthSkipped: 1,
    });
  });

  it('handles empty and missing folders safely', async () => {
    const folderPath = await createTempFolder();
    const emptyResult = await listScannedFolderFilesRecursive(folderPath);
    const missingResult = await listScannedFolderFilesRecursive(path.join(os.tmpdir(), 'brain-spine-missing-recursive-scans-folder'));

    expect(emptyResult.success).toBe(true);
    if (!emptyResult.success) throw new Error(emptyResult.error.message);
    expect(emptyResult.files).toEqual([]);
    expect(emptyResult.counts).toMatchObject({
      supportedFiles: 0,
      ignoredFiles: 0,
      ignoredFolders: 0,
      scannedFolders: 1,
      maxDepthSkipped: 0,
      errors: 0,
    });

    expect(missingResult.success).toBe(false);
    if (missingResult.success) throw new Error('Expected missing folder failure');
    expect(missingResult.error.code).toBe('missing_folder');
    expect(missingResult.files).toEqual([]);
  });
});
// #endregion
