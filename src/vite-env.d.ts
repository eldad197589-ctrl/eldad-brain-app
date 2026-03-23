/* ============================================
   FILE: vite-env.d.ts
   PURPOSE: Type definitions
   DEPENDENCIES: None (local only)
   EXPORTS: None
   ============================================ */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
