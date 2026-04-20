/* ============================================
// #region Module

   FILE: useKycChecklist.ts
   PURPOSE: Hook for computing dynamic required documents for new clients
   DEPENDENCIES: ../types
   EXPORTS: useKycChecklist
   ============================================ */

import { useState, useMemo } from 'react';
import { EntityType, DocumentItem, KycState } from '../types';
import { useBrainStore } from '../../../store/brainStore';

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
  /** ת.ז. — used to match employee signals from external system */
  idNumber?: string;
}

export function useKycChecklist(initial?: InitialParams): Result {
  const employeeSignals = useBrainStore(s => s.employeeSignals);
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
      // CPA-generated letters (generate_send — CPA produces and sends, not uploaded by client)
      docs.push({ id: 'prev_accountant', category: 'transfer', label: 'מכתב שחרור ממייצג קודם', description: 'מופק ונשלח על ידי המשרד למייצג הקודם', status: 'pending', actionType: 'generate_send', required: true, priority: 'high' });
      docs.push({ id: 'prev_accountant_docs_req', category: 'transfer', label: 'מכתב בקשת מסמכים ממייצג קודם', description: 'מופק ונשלח על ידי המשרד למייצג הקודם', status: 'pending', actionType: 'generate_send', required: true, priority: 'high' });

      // VAT certificate for authorized dealers only
      if (entityType === 'authorized') {
        docs.push({ id: 'vat_certificate', category: 'transfer', label: 'תעודת עוסק מורשה (מע"מ)', description: 'עותק מהמייצג הקודם או מרשויות המס', status: 'pending', actionType: 'upload', required: true, priority: 'high' });
      }

      // Client-uploaded transfer documents
      docs.push({ id: 't2', category: 'transfer', label: 'מאזני בוחן ודוחות רווח והפסד לשנה קודמת/נוכחית', status: 'pending', actionType: 'upload', required: true, priority: 'high' });
      docs.push({ id: 't3', category: 'transfer', label: 'דוחות מע"מ ומקדמות מהחצי שנה האחרונה', status: 'pending', actionType: 'upload', required: true, priority: 'medium' });
      
      if (entityType === 'company' || entityType === 'npo') {
        docs.push({ id: 't4', category: 'transfer', label: 'דוחות כספיים רשמיים ומאושרים', description: 'שנתיים אחרונות', status: 'pending', actionType: 'upload', required: true, priority: 'high' });
      }
    }

    // Apply specific saved statuses
    docs = docs.map(doc => ({
      ...doc,
      status: docStatuses[doc.id] || 'pending'
    }));

    // ═══ Employee Signal → Document Injection ═══
    // Only when idNumber is provided and matches
    if (initial?.idNumber) {
      const matchedSignals = employeeSignals.filter(
        s => s.employeeIdNumber === initial.idNumber && !s.acknowledged
      );

      // form101_approved → doc item with status 'verified'
      const has101 = matchedSignals.find(s => s.signalName === 'form101_approved');
      docs.push({
        id: 'emp_form101',
        category: 'employee',
        label: 'טופס 101 (מערכת עובדים)',
        description: has101 ? `אושר ${new Date(has101.occurredAt).toLocaleDateString('he-IL')}` : 'ממתין לאישור מהמערכת החיצונית',
        status: has101 ? 'verified' : 'pending',
      });

      // form130_uploaded → doc item
      const has130 = matchedSignals.find(s => s.signalName === 'form130_uploaded');
      docs.push({
        id: 'emp_form130',
        category: 'employee',
        label: 'טופס 130 (מערכת עובדים)',
        description: has130 ? `הועלה ${new Date(has130.occurredAt).toLocaleDateString('he-IL')}` : 'ממתין להעלאה מהמערכת החיצונית',
        status: has130 ? 'uploaded' : 'pending',
      });

      // employment_agreement_signed → doc item
      const hasSigned = matchedSignals.find(s => s.signalName === 'employment_agreement_signed');
      docs.push({
        id: 'emp_agreement',
        category: 'employee',
        label: 'הסכם העסקה חתום (מערכת עובדים)',
        description: hasSigned ? `נחתם ${new Date(hasSigned.occurredAt).toLocaleDateString('he-IL')}` : 'ממתין לחתימה',
        status: hasSigned ? 'verified' : 'pending',
      });

      // missing_documents → alert doc
      const hasMissing = matchedSignals.find(s => s.signalName === 'missing_documents');
      if (hasMissing) {
        const missingList = hasMissing.payload?.missingDocIds?.join(', ') || 'מסמכים לא מזוהים';
        docs.push({
          id: 'emp_missing_alert',
          category: 'employee',
          label: `⚠️ חסרים מסמכים: ${missingList}`,
          description: 'דורש טיפול במערכת העובדים החיצונית',
          status: 'rejected',
          required: true,
          priority: 'high',
        });
      }

      // employee_deactivated → alert doc
      const hasDeactivated = matchedSignals.find(s => s.signalName === 'employee_deactivated');
      if (hasDeactivated) {
        docs.push({
          id: 'emp_deactivated_alert',
          category: 'employee',
          label: '🔴 עובד סומן כלא פעיל במערכת החיצונית',
          description: hasDeactivated.payload?.reason || 'סיבה לא צוינה',
          status: 'rejected',
          required: true,
          priority: 'high',
        });
      }
    }

    return {
      clientName,
      entityType,
      isTransfer,
      documents: docs
    };
  }, [clientName, entityType, isTransfer, docStatuses, employeeSignals, initial?.idNumber]);

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
