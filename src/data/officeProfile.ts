/* ============================================
   FILE: officeProfile.ts
   PURPOSE: officeProfile module
   DEPENDENCIES: None (local only)
   EXPORTS: OfficeProfile, OFFICE_PROFILES, getActiveProfile, setActiveProfile
   ============================================ */
/**
 * FILE: officeProfile.ts
 * PURPOSE: Office profile types, defaults, and storage utilities.
 *          Ported from אפוטרופוס and קליטת לקוח office settings systems.
 * DEPENDENCIES: none (pure data + localStorage)
 */

// #region Types

/**
 * Office profile — firm identity used across documents, PDFs, and letters.
 * Supports dual logos (Eldad solo / Aharoni-Shalchon-David firm).
 */
export interface OfficeProfile {
  /** Unique profile ID */
  id: string;
  /** Profile display name */
  name: string;
  /** Firm name (Hebrew) */
  firmName: string;
  /** Firm name (English) */
  firmNameEn: string;
  /** Firm logo URL (relative to public/) */
  logoUrl: string;
  /** Office address */
  address: string;
  /** Office phone */
  phone: string;
  /** Office fax */
  fax: string;
  /** Office email */
  email: string;
  /** Secondary email */
  email2?: string;
  /** CPA license number */
  licenseNumber: string;
  /** CPA ID number (ת.ז) */
  idNumber: string;
  /** Accountants list */
  accountants: string[];
  /** Header image URL (scanned letterhead top) */
  headerImageUrl?: string;
  /** Footer image URL (scanned letterhead bottom) */
  footerImageUrl?: string;
  /** Secondary branch address */
  branchAddress?: string;
}

// #endregion

// #region Default Profiles

/** Eldad David solo profile */
const ELDAD_PROFILE: OfficeProfile = {
  id: 'eldad-solo',
  name: 'ניהול דוד אלדד רו"ח',
  firmName: 'ניהול דוד אלדד רו"ח',
  firmNameEn: 'DAVID ELDAD CPA MANAGEMENT',
  logoUrl: '/logos/david_eldad_logo.png',
  address: 'מאירוביץ 55, ראשון לציון',
  phone: '03-9661234',
  fax: '077-9167711',
  email: 'eldad@robium.net',
  email2: 'eldad197589@gmail.com',
  licenseNumber: '',
  idNumber: '',
  accountants: ['אלדד דוד רו"ח'],
  headerImageUrl: '/logos/header_logo.png',
  branchAddress: 'ישפה 2, אשקלון',
};

/** Aharoni-Shalchon-David firm profile */
const AHARONI_PROFILE: OfficeProfile = {
  id: 'aharoni-shalchon-david',
  name: 'אהרוני שלחון דוד — משרד רו"ח',
  firmName: 'A&D משרד רואי חשבון',
  firmNameEn: 'Aharoni & David — Certified Public Accountants',
  logoUrl: '/logos/aharoni_logov2.jpg',
  address: 'מאירוביץ 55, ראשון לציון',
  phone: '03-9661234',
  fax: '077-9167711',
  email: 'eldad@robium.net',
  licenseNumber: '',
  idNumber: '',
  accountants: ['אהרוני רו"ח', 'שלחון רו"ח', 'דוד אלדד רו"ח'],
  headerImageUrl: '/logos/official_header_logo.png',
};

/**
 * Robium Technologies (חברת טכנולוגיה) profile.
 * Source: ceo-office.html footer, agreementData.ts, LetterPage.tsx
 */
const ROBIUM_PROFILE: OfficeProfile = {
  id: 'robium-tech',
  name: 'רוביום טכנולוגיות בע"מ',
  firmName: 'רוביום טכנולוגיות בע"מ',
  firmNameEn: 'ROBIUM TECHNOLOGIES LTD.',
  logoUrl: '/logos/david_eldad_logo.png',
  address: 'מאירוביץ 55, ראשון לציון',
  phone: '03-9661234',
  fax: '077-9167711',
  email: 'eldad@robium.net',
  licenseNumber: '',
  idNumber: '',
  accountants: ['אלדד דוד — CEO', 'אוסנת אהרוני שלחון — CRO', 'קיריל יאקימנקו — CTO'],
  headerImageUrl: '/logos/header_logo.png',
};

/** All available profiles */
export const OFFICE_PROFILES: OfficeProfile[] = [ELDAD_PROFILE, AHARONI_PROFILE, ROBIUM_PROFILE];

// #endregion

// #region Storage Utilities

const STORAGE_KEY = 'brain_active_office_profile';

/**
 * Get the currently active office profile.
 * Falls back to Eldad solo profile if nothing saved.
 *
 * @returns The active OfficeProfile
 */
export function getActiveProfile(): OfficeProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const id = JSON.parse(saved);
      const found = OFFICE_PROFILES.find(p => p.id === id);
      if (found) return found;
    }
  } catch {
    // Ignore parse errors
  }
  return ELDAD_PROFILE;
}

/**
 * Save the active profile selection.
 *
 * @param profileId - The profile ID to set as active
 */
export function setActiveProfile(profileId: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profileId));
}

// #endregion
