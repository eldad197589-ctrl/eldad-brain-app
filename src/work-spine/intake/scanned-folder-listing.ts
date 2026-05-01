/* ============================================
   FILE: scanned-folder-listing.ts
   PURPOSE: Read-only scanned document folder listing for intake staging candidates.
   DEPENDENCIES: node fs/path
   EXPORTS: listScannedFolderFiles, listScannedFolderFilesRecursive and related types
   ============================================ */

// #region Imports
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
// #endregion

// #region Types
export type ScannedFolderListingErrorCode = 'missing_folder' | 'inaccessible_folder' | 'not_a_directory';
export type ScannedFileOcrStatus = 'unknown' | 'not_processed';
export type ScannedFileIntakeStatus = 'staging_candidate';
export type ScannedFolderListingIssueScope = 'folder' | 'file';

export interface ScannedFolderFileMetadata {
  fileName: string;
  extension: string;
  absolutePath: string;
  sizeBytes: number;
  createdAt?: string;
  modifiedAt?: string;
  isDirectory: false;
  ocrStatus: ScannedFileOcrStatus;
  intakeStatus: ScannedFileIntakeStatus;
  relativePathFromRoot?: string;
  depth?: number;
  parentFolderName?: string;
  folderPath?: string;
  sourceRoot?: string;
}

export interface ScannedFolderListingCounts {
  supportedFiles: number;
  ignoredFiles: number;
  ignoredFolders: number;
  scannedFolders: number;
  maxDepthSkipped: number;
  errors: number;
}

export interface ScannedFolderListingIssue {
  scope: ScannedFolderListingIssueScope;
  absolutePath: string;
  relativePathFromRoot?: string;
  depth: number;
  code?: string;
  message: string;
}

export interface ScannedFolderListingSuccess {
  success: true;
  folderPath: string;
  files: ScannedFolderFileMetadata[];
  ignoredCount: number;
  supportedExtensions: string[];
  counts?: ScannedFolderListingCounts;
  errors?: ScannedFolderListingIssue[];
}

export interface ScannedFolderListingFailure {
  success: false;
  error: {
    code: ScannedFolderListingErrorCode;
    message: string;
    folderPath: string;
  };
  files: [];
  ignoredCount: 0;
  supportedExtensions: string[];
  counts?: ScannedFolderListingCounts;
  errors?: ScannedFolderListingIssue[];
}

export interface ScannedFolderRecursiveOptions {
  maxDepth?: number;
}

export type ScannedFolderListingResult = ScannedFolderListingSuccess | ScannedFolderListingFailure;
// #endregion

// #region Constants
export const SCANNED_FOLDER_SUPPORTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.tif', '.tiff'] as const;
const NOISE_FOLDER_NAMES = new Set(['node_modules', '.git', '.cache', 'dist', 'build', 'coverage']);
const DEFAULT_RECURSIVE_MAX_DEPTH = 3;
// #endregion

// #region Helpers
const toIsoIfAvailable = (date: Date): string | undefined => {
  const time = date.getTime();
  return Number.isFinite(time) && time > 0 ? date.toISOString() : undefined;
};

const isTemporaryOrHiddenName = (fileName: string): boolean => {
  const lowerName = fileName.toLowerCase();
  return (
    fileName.startsWith('.') ||
    fileName.startsWith('~$') ||
    lowerName.endsWith('.tmp') ||
    lowerName.endsWith('.temp') ||
    lowerName.endsWith('.crdownload') ||
    lowerName.endsWith('.part')
  );
};

const isIgnoredFolderName = (folderName: string): boolean =>
  folderName.startsWith('.') || folderName.startsWith('~$') || NOISE_FOLDER_NAMES.has(folderName.toLowerCase());

const isSupportedExtension = (extension: string): boolean =>
  SCANNED_FOLDER_SUPPORTED_EXTENSIONS.includes(extension.toLowerCase() as typeof SCANNED_FOLDER_SUPPORTED_EXTENSIONS[number]);

const emptyCounts = (): ScannedFolderListingCounts => ({
  supportedFiles: 0,
  ignoredFiles: 0,
  ignoredFolders: 0,
  scannedFolders: 0,
  maxDepthSkipped: 0,
  errors: 0,
});

const errorCode = (error: unknown): string | undefined => {
  const errorRecord = error as { code?: unknown };
  return typeof errorRecord.code === 'string' ? errorRecord.code : undefined;
};

const failure = (
  code: ScannedFolderListingErrorCode,
  folderPath: string,
  message: string,
  counts?: ScannedFolderListingCounts,
  errors?: ScannedFolderListingIssue[]
): ScannedFolderListingFailure => ({
  success: false,
  error: {
    code,
    message,
    folderPath,
  },
  files: [],
  ignoredCount: 0,
  supportedExtensions: [...SCANNED_FOLDER_SUPPORTED_EXTENSIONS],
  counts,
  errors,
});

const normalizeMaxDepth = (maxDepth?: number): number => {
  if (!Number.isFinite(maxDepth)) return DEFAULT_RECURSIVE_MAX_DEPTH;
  return Math.max(0, Math.floor(maxDepth as number));
};

const relativePath = (sourceRoot: string, absolutePath: string): string => path.relative(sourceRoot, absolutePath) || '.';

const createRecursiveMetadata = (
  sourceRoot: string,
  folderPath: string,
  fileName: string,
  depth: number,
  fileStats: Awaited<ReturnType<typeof stat>>
): ScannedFolderFileMetadata => {
  const absolutePath = path.join(folderPath, fileName);
  return {
    fileName,
    extension: path.extname(fileName).toLowerCase(),
    absolutePath,
    sizeBytes: fileStats.size,
    createdAt: toIsoIfAvailable(fileStats.birthtime),
    modifiedAt: toIsoIfAvailable(fileStats.mtime),
    isDirectory: false,
    ocrStatus: 'not_processed',
    intakeStatus: 'staging_candidate',
    relativePathFromRoot: relativePath(sourceRoot, absolutePath),
    depth,
    parentFolderName: path.basename(folderPath),
    folderPath,
    sourceRoot,
  };
};

const addIssue = (
  issues: ScannedFolderListingIssue[],
  counts: ScannedFolderListingCounts,
  issue: ScannedFolderListingIssue
): void => {
  issues.push(issue);
  counts.errors = issues.length;
};
// #endregion

// #region Public API
/**
 * Lists scanned document candidates from one explicit folder in read-only mode.
 * This function does not write, move, delete, rename, classify, persist, or create Brain Spine records.
 */
export async function listScannedFolderFiles(folderPath: string): Promise<ScannedFolderListingResult> {
  const resolvedFolderPath = path.resolve(folderPath);

  let folderStats;
  try {
    folderStats = await stat(resolvedFolderPath);
  } catch (error) {
    const code = errorCode(error);
    return failure(
      code === 'ENOENT' ? 'missing_folder' : 'inaccessible_folder',
      resolvedFolderPath,
      code === 'ENOENT' ? 'Scanned folder does not exist.' : 'Scanned folder is not accessible.'
    );
  }

  if (!folderStats.isDirectory()) {
    return failure('not_a_directory', resolvedFolderPath, 'Scanned folder path is not a directory.');
  }

  let entries;
  try {
    entries = await readdir(resolvedFolderPath, { withFileTypes: true });
  } catch {
    return failure('inaccessible_folder', resolvedFolderPath, 'Scanned folder could not be read.');
  }

  const files: ScannedFolderFileMetadata[] = [];
  let ignoredCount = 0;

  for (const entry of entries) {
    if (!entry.isFile() || isTemporaryOrHiddenName(entry.name)) {
      ignoredCount += 1;
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!isSupportedExtension(extension)) {
      ignoredCount += 1;
      continue;
    }

    const absolutePath = path.join(resolvedFolderPath, entry.name);
    const fileStats = await stat(absolutePath);

    files.push({
      fileName: entry.name,
      extension,
      absolutePath,
      sizeBytes: fileStats.size,
      createdAt: toIsoIfAvailable(fileStats.birthtime),
      modifiedAt: toIsoIfAvailable(fileStats.mtime),
      isDirectory: false,
      ocrStatus: 'not_processed',
      intakeStatus: 'staging_candidate',
    });
  }

  files.sort((a, b) => a.fileName.localeCompare(b.fileName, 'en'));

  return {
    success: true,
    folderPath: resolvedFolderPath,
    files,
    ignoredCount,
    supportedExtensions: [...SCANNED_FOLDER_SUPPORTED_EXTENSIONS],
  };
}

/**
 * Lists scanned document candidates recursively from one explicit folder in read-only mode.
 * This function scans metadata only and intentionally avoids symlink traversal.
 */
export async function listScannedFolderFilesRecursive(
  folderPath: string,
  options: ScannedFolderRecursiveOptions = {}
): Promise<ScannedFolderListingResult> {
  const sourceRoot = path.resolve(folderPath);
  const maxDepth = normalizeMaxDepth(options.maxDepth);
  const counts = emptyCounts();
  const errors: ScannedFolderListingIssue[] = [];
  const files: ScannedFolderFileMetadata[] = [];

  let rootStats;
  try {
    rootStats = await stat(sourceRoot);
  } catch (error) {
    const code = errorCode(error);
    return failure(
      code === 'ENOENT' ? 'missing_folder' : 'inaccessible_folder',
      sourceRoot,
      code === 'ENOENT' ? 'Scanned folder does not exist.' : 'Scanned folder is not accessible.',
      counts,
      errors
    );
  }

  if (!rootStats.isDirectory()) {
    return failure('not_a_directory', sourceRoot, 'Scanned folder path is not a directory.', counts, errors);
  }

  const scanFolder = async (currentFolderPath: string, depth: number): Promise<void> => {
    counts.scannedFolders += 1;

    let entries;
    try {
      entries = await readdir(currentFolderPath, { withFileTypes: true });
    } catch (error) {
      addIssue(errors, counts, {
        scope: 'folder',
        absolutePath: currentFolderPath,
        relativePathFromRoot: relativePath(sourceRoot, currentFolderPath),
        depth,
        code: errorCode(error),
        message: 'Folder could not be read.',
      });
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentFolderPath, entry.name);
      const entryRelativePath = relativePath(sourceRoot, entryPath);

      if (entry.isSymbolicLink()) {
        if (isSupportedExtension(path.extname(entry.name).toLowerCase())) counts.ignoredFiles += 1;
        else counts.ignoredFolders += 1;
        continue;
      }

      if (entry.isDirectory()) {
        if (isIgnoredFolderName(entry.name)) {
          counts.ignoredFolders += 1;
          continue;
        }
        if (depth >= maxDepth) {
          counts.maxDepthSkipped += 1;
          continue;
        }
        await scanFolder(entryPath, depth + 1);
        continue;
      }

      if (!entry.isFile() || isTemporaryOrHiddenName(entry.name)) {
        counts.ignoredFiles += 1;
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!isSupportedExtension(extension)) {
        counts.ignoredFiles += 1;
        continue;
      }

      try {
        const fileStats = await stat(entryPath);
        files.push(createRecursiveMetadata(sourceRoot, currentFolderPath, entry.name, depth, fileStats));
        counts.supportedFiles = files.length;
      } catch (error) {
        addIssue(errors, counts, {
          scope: 'file',
          absolutePath: entryPath,
          relativePathFromRoot: entryRelativePath,
          depth,
          code: errorCode(error),
          message: 'File metadata could not be read.',
        });
      }
    }
  };

  await scanFolder(sourceRoot, 0);
  files.sort((a, b) => (a.relativePathFromRoot ?? a.fileName).localeCompare(b.relativePathFromRoot ?? b.fileName, 'en'));

  return {
    success: true,
    folderPath: sourceRoot,
    files,
    ignoredCount: counts.ignoredFiles + counts.ignoredFolders,
    supportedExtensions: [...SCANNED_FOLDER_SUPPORTED_EXTENSIONS],
    counts,
    errors,
  };
}
// #endregion
