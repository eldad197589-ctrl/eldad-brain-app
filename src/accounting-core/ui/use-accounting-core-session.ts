// ==========================================
// FILE: use-accounting-core-session.ts
// PURPOSE: Read and update UI session context securely for the active accounting core workspace.
// DEPENDENCIES: AccountingCoreSessionContext
// ==========================================

import { useContext } from 'react';
import { AccountingCoreSessionContext, AccountingCoreSessionContextValue } from './accounting-core-session-context';

export function useAccountingCoreSession(): AccountingCoreSessionContextValue {
  const context = useContext(AccountingCoreSessionContext);
  
  if (!context) {
    throw new Error(
      'Boundary Error: useAccountingCoreSession() was called outside an <AccountingCoreSessionShell>. ' +
      'Accounting core boundaries strictly require session context to track active client/actor scope.'
    );
  }

  return context;
}
