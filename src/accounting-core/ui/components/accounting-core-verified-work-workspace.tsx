// ==========================================
// FILE: accounting-core-verified-work-workspace.tsx
// PURPOSE: Read-only container orchestrating the visibility of finalized/verified accounting states.
// DEPENDENCIES: React, AccountingCoreProvider, UI lists
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAccountingCoreRuntime } from '../accounting-core-react-context';
import { AccountingCoreVerifiedResolutionList } from './accounting-core-verified-resolution-list';
import { AccountingCoreLinkedMappingList } from './accounting-core-linked-mapping-list';
import { AccountingCoreDerivedViewList } from './accounting-core-derived-view-list';
import { 
  ResolutionResult, 
  ClientCaseMapping, 
  DerivedView, 
  ResolutionStatus 
} from '../../types/accounting-core-types';

interface Props {
  clientId: string;
  accountingPeriodId: string;
}

export default function AccountingCoreVerifiedWorkWorkspace({ clientId, accountingPeriodId }: Props) {
  const runtime = useAccountingCoreRuntime();
  
  const [resolutions, setResolutions] = useState<ResolutionResult[]>([]);
  const [mappings, setMappings] = useState<ClientCaseMapping[]>([]);
  const [views, setViews] = useState<DerivedView[]>([]);

  useEffect(() => {
    // Structural isolation: Data loads strictly via Read channels on the core Repositories.
    
    // 1. Get mappings linked to this client/period
    const loadedMappings = runtime.repositories.clientCaseMapping.listByPeriod(clientId, accountingPeriodId);
    setMappings(loadedMappings);

    // 2. Discover Verified Resolutions explicitly supporting mappings
    const mappedResolutionsDir = new Map<string, ResolutionResult>();
    loadedMappings.forEach(mapping => {
        const res = runtime.repositories.resolutionResult.getById(mapping.resolution_result_id);
        if (res) {
          mappedResolutionsDir.set(res.id, res);
        }
    });

    // Extract any BLOCKED resolutions directly by tracing back through all classifications for this period
    // Since BLOCKED ones do not map to ClientCaseMapping
    const periodClassifications = runtime.repositories.classificationResult.listByPeriod(clientId, accountingPeriodId);
    // Warning: strictly speaking, we don't have getByClassificationId for Resolutions. We only knowVERIFIED ones from Mapping.
    // If we wanted BLOCKED, we'd need to extend repo. The user requested 'verified resolutions' explicitly,
    // so exposing just the ones mapped to resolving logic matches limits.

    setResolutions(Array.from(mappedResolutionsDir.values()));

    // 3. Load generated analytical views
    const loadedViews = runtime.repositories.derivedView.listByPeriod(clientId, accountingPeriodId);
    setViews(loadedViews);

  }, [runtime, clientId, accountingPeriodId]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-gray-200 rounded-lg overflow-hidden rtl" dir="rtl">
      
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800">Verified Work & Pipeline Results</h2>
        <p className="text-sm text-gray-500 mt-1">
          Read-only visibility for explicitly mapped, authorized, and analyzed data segments.
        </p>
        <div className="flex space-x-4 space-x-reverse mt-2">
            <span className="text-xs font-mono text-gray-400">Client: {clientId}</span>
            <span className="text-xs font-mono text-gray-400">Period: {accountingPeriodId}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Resolutions */}
        <section className="bg-white p-4 shadow-sm border border-gray-200 rounded-md">
           <AccountingCoreVerifiedResolutionList resolutions={resolutions} />
        </section>

        {/* Mappings */}
        <section className="bg-white p-4 shadow-sm border border-gray-200 rounded-md">
           <AccountingCoreLinkedMappingList mappings={mappings} />
        </section>

        {/* Views */}
        <section className="bg-white p-4 shadow-sm border border-gray-200 rounded-md">
           <AccountingCoreDerivedViewList views={views} />
        </section>

      </div>
    </div>
  );
}
