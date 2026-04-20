// ==========================================
// FILE: accounting-core-session-shell.tsx
// PURPOSE: Root Context Provider boundary storing shared UI Session metrics.
// DEPENDENCIES: React, Session Context
// ==========================================

import React, { useState } from 'react';
import { 
  AccountingCoreSessionContext, 
  AccountingCoreSessionState 
} from '../accounting-core-session-context';

export interface AccountingCoreSessionShellProps {
  children: React.ReactNode;
  initialSession?: Partial<AccountingCoreSessionState>;
}

export function AccountingCoreSessionShell({ 
  children,
  initialSession 
}: AccountingCoreSessionShellProps) {
  
  const [session, setSessionState] = useState<AccountingCoreSessionState>({
    actorId: initialSession?.actorId || 'user_eldad_admin',
    clientId: initialSession?.clientId || 'DEFAULT_CLIENT',
    accountingPeriodId: initialSession?.accountingPeriodId || 'FY_DEFAULT'
  });

  const setSession = (partialSession: Partial<AccountingCoreSessionState>) => {
    setSessionState(prev => ({ ...prev, ...partialSession }));
  };

  return (
    <AccountingCoreSessionContext.Provider value={{ session, setSession }}>
      <div className="flex flex-col h-full w-full">
        {/* Minimal Session Control Header */}
        <div className="bg-slate-800 text-slate-200 text-xs py-2 px-4 flex justify-between items-center border-b border-slate-900 shadow-inner z-10">
          <div className="flex space-x-4 rtl:space-x-reverse font-mono">
            <span>Actor: <span className="text-white font-bold">{session.actorId}</span></span>
            <span className="opacity-50">|</span>
            <span>Client: <span className="text-white font-bold">{session.clientId}</span></span>
            <span className="opacity-50">|</span>
            <span>Period: <span className="text-white font-bold">{session.accountingPeriodId}</span></span>
          </div>
          <div>
            <span className="bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded text-[10px] uppercase tracking-wider">
              Protected Accounting Session
            </span>
          </div>
        </div>
        
        {/* Render Child Boundaries securely mapping to Context */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </div>
    </AccountingCoreSessionContext.Provider>
  );
}
