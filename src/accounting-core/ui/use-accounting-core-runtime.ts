// ==========================================
// FILE: use-accounting-core-runtime.ts
// PURPOSE: Strict React hook enforcing initialization and fetching of the Core Runtime.
// DEPENDENCIES: AccountingCoreContext
// ==========================================

import { useContext } from 'react';
import { AccountingCoreContext } from './accounting-core-react-context';
import { AccountingCoreRuntime } from '../index';

/**
 * Custom hook to safely grab the Accounting Core Context.
 * Throws explicit runtime exception if a UI component tries to access core services 
 * without being inside the unified provider boundaries.
 */
export function useAccountingCoreRuntime(): AccountingCoreRuntime {
  const context = useContext(AccountingCoreContext);
  
  if (!context) {
    throw new Error(
      'Boundary Error: useAccountingCoreRuntime() was called outside an <AccountingCoreProvider>. ' +
      'All components requesting core access must be placed within the hierarchy of the provider.'
    );
  }
  
  return context;
}
