/* ============================================
// #region Module

   FILE: useKycChecklist.ts
   PURPOSE: Hook for computing dynamic required documents for new clients
   DEPENDENCIES: ../types
   EXPORTS: useKycChecklist
   ============================================ */

import { useState, useMemo } from 'react';
import { EntityType, DocumentItem, KycState } from '../types';

const BASE_DOCUMENTS: DocumentItem[] = [
  { id: 'b1', category: 'permanent', label: 'צילום תעודת זהות של בעל השליטה/העצמאי', description: 'משני הצדדים', status: 'pending' },
  { id: 'b2', category: 'permanent', label: 'ספח תעודת זהות', description: 'כולל כתובת מעודכנת', status: 'pending' },
  { id: 'b3', category: 'permanent', label: 'אישור ניהול חשבון בנק / צ\'ק מבוטל', status: 'pending' },
  { id: 'b4', category: 'permanent', label: 'הצעת מחיר מאושרת / חתומה', status: 'pending' },
  { id: 'b5', category: 'permanent', label: 'הסכם שכר טרחה חתום', status: 'pending' },
  { id: 'b6', category: 'permanent', label: 'טופס 2279 / ייפוי כוח לרשויות', status: 'pending' },
];

interface Result {
  state: KycState;
  updateClientInfo: (name: string, type: EntityType, isTransfer: boolean) => void;
  toggleDocStatus: (docId: string, newStatus: DocumentItem['status']) => void;
}

/** Optional initial values for pre-populating from Smart Folder Intake */
interface InitialParams {
  name?: string;
  entityType?: EntityType;
  isTransfer?: boolean;
  /** Doc IDs to mark as 'uploaded' from the start */
  foundDocIds?: string[];
}

export function useKycChecklist(initial?: InitialParams): Result {
  const [clientName, setClientName] = useState<string>(initial?.name || '');
  const [entityType, setEntityType] = useState<EntityType>(initial?.entityType || 'exempt');
  const [isTransfer, setIsTransfer] = useState<boolean>(initial?.isTransfer || false);

  // Pre-populate doc statuses from found docs
  const initialStatuses: Record<string, DocumentItem['status']> = {};
  if (initial?.foundDocIds) {
    initial.foundDocIds.forEach(id => { initialStatuses[id] = 'uploaded'; });
  }
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentItem['status']>>(initialStatuses);

  const state = useMemo<KycState>(() => {
    let docs: DocumentItem[] = [...BASE_DOCUMENTS];

    // Regulatory docs by entity type
    if (entityType === 'authorized' || entityType === 'partnership') {
      docs.push({ id: 'r1', category: 'regulatory', label: 'תעודת עוסק מורשה (מע"מ)', status: 'pending' });
    }
    
    if (entityType === 'partnership') {
      docs.push({ id: 'r2', category: 'regulatory', label: 'הסכם שותפות חתום + אישור רשם השותפויות', status: 'pending' });
    }

    if (entityType === 'company') {
      docs.push({ id: 'rc1', category: 'regulatory', label: 'תעודת התאגדות (רשם החברות)', status: 'pending' });
      docs.push({ id: 'rc2', category: 'regulatory', label: 'נסח חברה עדכני מתאריך הקליטה', description: 'מפרט דירקטורים ובעלי מניות', status: 'pending' });
      docs.push({ id: 'rc3', category: 'regulatory', label: 'תקנון החברה חתום', status: 'pending' });
    }

    if (entityType === 'npo') {
      docs.push({ id: 'rn1', category: 'regulatory', label: 'תעודת התאגדות עמותה (רשם העמותות)', status: 'pending' });
      docs.push({ id: 'rn2', category: 'regulatory', label: 'נסח עמותה ורשימת חברי ועד', status: 'pending' });
      docs.push({ id: 'rn3', category: 'regulatory', label: 'תקנון עמותה ואישור ניהול תקין', status: 'pending' });
    }

    // Transfer docs
    if (isTransfer) {
      docs.push({ id: 't1', category: 'transfer', label: 'מכתב דרישת מסמכים + שחרור ממייצג קודם', description: 'מופק ונשלח על ידי המשרד', status: 'pending' });
      docs.push({ id: 't2', category: 'transfer', label: 'מאזני בוחן ודוחות רווח והפסד לשנה קודמת/נוכחית', status: 'pending' });
      docs.push({ id: 't3', category: 'transfer', label: 'דוחות מע"מ ומקדמות מהחצי שנה האחרונה', status: 'pending' });
      
      if (entityType === 'company' || entityType === 'npo') {
        docs.push({ id: 't4', category: 'transfer', label: 'דוחות כספיים רשמיים ומאושרים', description: 'שנתיים אחרונות', status: 'pending' });
      }
    }

    // Apply specific saved statuses
    docs = docs.map(doc => ({
      ...doc,
      status: docStatuses[doc.id] || 'pending'
    }));

    return {
      clientName,
      entityType,
      isTransfer,
      documents: docs
    };
  }, [clientName, entityType, isTransfer, docStatuses]);

  const updateClientInfo = (name: string, type: EntityType, transfer: boolean) => {
    setClientName(name);
    setEntityType(type);
    setIsTransfer(transfer);
  };

  const toggleDocStatus = (docId: string, newStatus: DocumentItem['status']) => {
    setDocStatuses(prev => ({
      ...prev,
      [docId]: newStatus
    }));
  };

  return { state, updateClientInfo, toggleDocStatus };
}
// #endregion
