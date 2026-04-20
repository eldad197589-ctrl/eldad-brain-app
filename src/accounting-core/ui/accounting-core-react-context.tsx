// ==========================================
// FILE: accounting-core-react-context.tsx
// PURPOSE: Thin React provider boundary for the Accounting Core Runtime.
// DEPENDENCIES: AccountingCoreRuntime, React
// ==========================================

import React, { createContext, ReactNode, useState } from 'react';
import { AccountingCoreRuntime, createAccountingCoreRuntime } from '../index';

/**
 * 1. Context strictly typed to the Runtime.
 * Null is used as the initial state to enforce strict bounds checking in the hook.
 */
export const AccountingCoreContext = createContext<AccountingCoreRuntime | null>(null);

export interface AccountingCoreProviderProps {
  children: ReactNode;
  /** Optional override for testing injections entirely avoiding filesystem logic */
  forcedRuntime?: AccountingCoreRuntime;
}

/**
 * 2. The Provider Boundary.
 * - Instantiates the robust pure-TS factory EXACTLY ONCE per mount.
 * - Enforces zero business logic scaling in the UI layer.
 */
export function AccountingCoreProvider({ children, forcedRuntime }: AccountingCoreProviderProps) {
  
  // Lazy state initialization to guarantee single-instance creation of local db proxies via the factory
  const [runtime] = useState<AccountingCoreRuntime>(() => {
    return forcedRuntime ?? createAccountingCoreRuntime();
  });

  return (
    <AccountingCoreContext.Provider value={runtime}>
      {children}
    </AccountingCoreContext.Provider>
  );
}
