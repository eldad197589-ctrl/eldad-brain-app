/* ============================================
// #region Module

   FILE: useQuoteCalculator.ts
   PURPOSE: Hook for computing real-time pricing according to full Smart Bareau matrix
   DEPENDENCIES: ../types, ../services/pricingService
   EXPORTS: useQuoteCalculator
   ============================================ */

import { useState, useMemo, useEffect } from 'react';
import { ClientType, QuoteState, ServiceItem } from '../types';
import { getPricingMatrix, SmartBareauPricing } from '../services/pricingService';

interface Result {
  state: QuoteState;
  updateClientInfo: (name: string, type: ClientType) => void;
  toggleService: (service: ServiceItem) => void;
}

/**
 * Hook to manage and compute quote calculations based on Eldad's pricing rules
 * @returns {Result} The current state and mutators for the quote
 */
export function useQuoteCalculator(): Result {
  const [clientName, setClientName] = useState<string>('');
  const [clientType, setClientType] = useState<ClientType>('exempt');
  const [additionalServices, setAdditionalServices] = useState<ServiceItem[]>([]);
  const [pricingMatrix, setPricingMatrix] = useState<SmartBareauPricing | null>(null);

  // Load pricing matrix once on mount
  useEffect(() => {
    setPricingMatrix(getPricingMatrix());
  }, []);

  const state = useMemo<QuoteState>(() => {
    let baseMonthlyFee = 0;
    let annualReportFee = 0;
    let setupFee = 0;
    let successFeePercent = 0;

    // Apply dynamic rules from the pricing matrix
    if (pricingMatrix && pricingMatrix.retainers[clientType]) {
      const config = pricingMatrix.retainers[clientType];
      baseMonthlyFee = config.baseMonthlyFee || 0;
      annualReportFee = config.annualReportFee || 0;
      setupFee = config.setupFee || 0;
      successFeePercent = config.successFeePercent || 0;
    }

    // Accumulate additional services
    let addonsMonthly = 0;
    let addonsOneTime = 0;
    additionalServices.forEach(s => {
      if (s.isMonthly) {
        addonsMonthly += s.price;
      } else {
        addonsOneTime += s.price;
      }
    });

    return {
      clientName,
      clientType,
      baseMonthlyFee,
      annualReportFee,
      setupFee,
      successFeePercent,
      additionalServices,
      totalMonthly: baseMonthlyFee + addonsMonthly,
      totalOneTime: setupFee + addonsOneTime
    };
  }, [clientName, clientType, additionalServices, pricingMatrix]);

  const updateClientInfo = (name: string, type: ClientType) => {
    setClientName(name);
    setClientType(type);
  };

  const toggleService = (service: ServiceItem) => {
    setAdditionalServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  return { state, updateClientInfo, toggleService };
}
// #endregion
