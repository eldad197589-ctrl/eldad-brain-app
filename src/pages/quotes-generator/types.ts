/* ============================================
// #region Module

   FILE: types.ts
   PURPOSE: Interfaces and types for the Smart Bareau Quote Generator
   DEPENDENCIES: None
   EXPORTS: ClientType, ServiceItem, QuoteState
   ============================================ */

export type ClientType = 'exempt' | 'authorized_small' | 'authorized_medium' | 'company' | 'employee';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isMonthly: boolean;
  isPercentage?: boolean;
}

export interface QuoteState {
  clientName: string;
  clientType: ClientType;
  baseMonthlyFee: number;
  annualReportFee: number;
  setupFee: number;
  successFeePercent: number;
  additionalServices: ServiceItem[];
  totalMonthly: number;
  totalOneTime: number;
}
// #endregion
