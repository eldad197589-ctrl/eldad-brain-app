/* ============================================
   FILE: paymentsData.ts
   PURPOSE: Mock data for home payments (Arnona, Water, Electricity)
   DEPENDENCIES: None
   EXPORTS: HomeBill, mockBills
   ============================================ */
// #region Interfaces

/**
 * Interface representing a household bill (Arnona, Water, Electricity)
 */
export interface HomeBill {
  id: string;
  provider: string;
  type: 'מים' | 'חשמל' | 'ארנונה' | 'אגרת מקצוע';
  amount: number;
  dueDate: string;
  status: 'ממתין' | 'שולם';
  hasAnomaly: boolean;
  previousAmount?: number;
  paidVia?: string;
  filedUnder?: string;
  // Gmail Integration Fields
  sourceEmailId?: string;
  paymentLink?: string;
  confirmationNumber?: string;
}

// #endregion

// #region Mock Data

/**
 * Mock data representing Eldad's pending bills
 */
export const mockBills: HomeBill[] = [
  {
    id: 'bill-1',
    provider: 'תאגיד מי אשקלון',
    type: 'מים',
    amount: 145.50,
    dueDate: '2026-04-10',
    status: 'ממתין',
    hasAnomaly: false,
    previousAmount: 140.00,
    sourceEmailId: 'gmail_msg_8291a',
    paymentLink: 'https://www.mast.co.il/71/pay/payments'
  },
  {
    id: 'bill-2',
    provider: 'עיריית אשקלון',
    type: 'ארנונה',
    amount: 850.00,
    dueDate: '2026-04-15',
    status: 'ממתין',
    hasAnomaly: false,
    previousAmount: 850.00
  },
  {
    id: 'bill-3',
    provider: 'חברת החשמל',
    type: 'חשמל',
    amount: 1250.00,
    dueDate: '2026-04-20',
    status: 'ממתין',
    hasAnomaly: true,
    previousAmount: 950.00,
    sourceEmailId: 'gmail_msg_1048b',
    paymentLink: 'https://www.iec.co.il/pay'
  },
  {
    id: 'bill-4',
    provider: 'מועצת רואי חשבון בישראל',
    type: 'אגרת מקצוע',
    amount: 1450.00,
    dueDate: '2026-05-01',
    status: 'ממתין',
    hasAnomaly: false,
    sourceEmailId: 'gmail_msg_cpa_199',
    paymentLink: 'https://www.gov.il/he/departments/general/cpa_fees'
  }
];

// #endregion
