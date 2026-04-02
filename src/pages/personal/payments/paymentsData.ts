// #region Types

export interface HomeBill {
  id: string;
  type: string;
  provider: string;
  amount: number;
  previousAmount?: number;
  hasAnomaly: boolean;
  status: 'שולם' | 'ממתין';
  sourceEmailId?: string;
  paidVia?: string;
  filedUnder?: string;
  confirmationNumber?: string;
  paymentLink?: string;
}

// #endregion

// #region Mock Data

export const mockBills: HomeBill[] = [
  {
    id: '1',
    type: 'חשמל',
    provider: 'חברת החשמל לישראל',
    amount: 850,
    previousAmount: 420,
    hasAnomaly: true,
    status: 'ממתין',
    paymentLink: 'https://payment.iec.co.il',
  },
  {
    id: '2',
    type: 'מים',
    provider: 'הגיחון',
    amount: 312,
    previousAmount: 305,
    hasAnomaly: false,
    status: 'ממתין',
    sourceEmailId: 'test_123',
    paymentLink: 'https://payment.hagihon.co.il',
  },
  {
    id: '3',
    type: 'אגרת מקצוע',
    provider: 'לשכת רואי החשבון בישראל',
    amount: 1250,
    hasAnomaly: false,
    status: 'שולם',
    paidVia: 'credit',
    filedUnder: 'חשבוניות שונים',
    confirmationNumber: '8391283',
  }
];

// #endregion
