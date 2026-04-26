/* ============================================
   FILE: integrationStore.ts
   PURPOSE: Authoritative integration settings layer
   DEPENDENCIES: zustand
   ============================================ */

import { create } from 'zustand';

export type IntegrationProvider = 'gmail' | 'drive' | 'whatsapp_business' | 'gemini' | 'google_cloud';

export type IntegrationConnectionStatus = 'connected' | 'disconnected' | 'configured' | 'missing_config' | 'disabled';

export interface TokenInfo {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface IntegrationState {
  googleClientId: string;
  googleAccessToken: TokenInfo | null;
  
  // Actions
  setGoogleClientId: (id: string) => void;
  setGoogleAccessToken: (token: TokenInfo | null) => void;
  getIntegrationStatus: (provider: IntegrationProvider) => IntegrationConnectionStatus;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => {
  // Hydrate from localStorage for backward compatibility
  const initialClientId = localStorage.getItem('brain_google_client_id') || '';
  let initialToken: TokenInfo | null = null;
  try {
    const raw = localStorage.getItem('brain_gmail_token');
    if (raw) {
      initialToken = JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }

  return {
    googleClientId: initialClientId,
    googleAccessToken: initialToken,

    setGoogleClientId: (id: string) => {
      localStorage.setItem('brain_google_client_id', id);
      set({ googleClientId: id });
    },

    setGoogleAccessToken: (token: TokenInfo | null) => {
      if (token) {
        localStorage.setItem('brain_gmail_token', JSON.stringify(token));
      } else {
        localStorage.removeItem('brain_gmail_token');
      }
      set({ googleAccessToken: token });
    },

    getIntegrationStatus: (provider: IntegrationProvider): IntegrationConnectionStatus => {
      const state = get();
      switch (provider) {
        case 'google_cloud':
          return state.googleClientId ? 'configured' : 'missing_config';
        case 'gmail':
        case 'drive':
          return state.googleAccessToken ? 'connected' : 'disconnected';
        case 'gemini':
          return import.meta.env.VITE_GEMINI_API_KEY ? 'configured' : 'missing_config';
        case 'whatsapp_business':
          return 'disabled';
        default:
          return 'disconnected';
      }
    }
  };
});

// Non-reactive helpers for services
export const getGoogleClientId = () => useIntegrationStore.getState().googleClientId;
export const setGoogleClientId = (id: string) => useIntegrationStore.getState().setGoogleClientId(id);
export const getGoogleAccessToken = () => useIntegrationStore.getState().googleAccessToken;
export const setGoogleAccessToken = (token: TokenInfo | null) => useIntegrationStore.getState().setGoogleAccessToken(token);
