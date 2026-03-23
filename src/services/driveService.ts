/**
 * FILE: driveService.ts
 * PURPOSE: Google Drive API integration — list and search files
 * DEPENDENCIES: gmailService (shared OAuth2 token)
 *
 * Uses the same OAuth2 token as Gmail (scope includes drive.readonly).
 */

// #region Types

/** A Google Drive file entry */
export interface DriveFile {
  /** File ID */
  id: string;
  /** File name */
  name: string;
  /** MIME type */
  mimeType: string;
  /** Modified time ISO */
  modifiedTime: string;
  /** File size in bytes */
  size: string;
  /** Web view link */
  webViewLink: string;
  /** Thumbnail link */
  thumbnailLink?: string;
}

// #endregion

// #region Configuration

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const STORAGE_KEY = 'brain_gmail_token';

/** Get auth headers (shared with Gmail) */
function authHeaders(): HeadersInit {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('לא מחובר ל-Google');
  const token = JSON.parse(raw);
  return { Authorization: `Bearer ${token.access_token}` };
}

/** Check if Drive is connected */
export function isDriveConnected(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

// #endregion

// #region Drive API

/**
 * List recent files from Google Drive.
 * @param maxResults — Max files to return
 * @param query — Optional search query (Google Drive query format)
 * @returns Array of DriveFile
 */
export async function listRecentFiles(maxResults = 10, query?: string): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    pageSize: String(maxResults),
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink)',
  });

  if (query) {
    params.set('q', query);
  }

  const res = await fetch(`${DRIVE_API}/files?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data = await res.json();
  return (data.files || []) as DriveFile[];
}

/**
 * Search for files by name.
 * @param nameContains — Partial file name to search
 * @param maxResults — Max results
 */
export async function searchFiles(nameContains: string, maxResults = 10): Promise<DriveFile[]> {
  const query = `name contains '${nameContains.replace(/'/g, "\\'")}'`;
  return listRecentFiles(maxResults, query);
}

/**
 * Get direct download URL for a file.
 * @param fileId — Drive file ID
 * @returns Download URL
 */
export function getDownloadUrl(fileId: string): string {
  return `${DRIVE_API}/files/${fileId}?alt=media`;
}

// #endregion
