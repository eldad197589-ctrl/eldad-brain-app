// ==========================================
// FILE: accounting-core-session-context.tsx
// PURPOSE: Thin UI React context for shared workspace session state (actor, client, period).
// DEPENDENCIES: React
// ==========================================

import { createContext } from 'react';

export interface AccountingCoreSessionState {
  actorId: string;
  clientId: string;
  accountingPeriodId: string;
}

export interface AccountingCoreSessionContextValue {
  session: AccountingCoreSessionState;
  setSession: (session: Partial<AccountingCoreSessionState>) => void;
}

export const AccountingCoreSessionContext = createContext<AccountingCoreSessionContextValue | null>(null);
