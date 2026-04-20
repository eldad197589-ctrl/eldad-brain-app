/**
 * FILE: QuickPayrollCalculator.tsx
 * PURPOSE: Isolated, read-only UI consumer for the Payroll Service.
 * DEPENDENCIES: react, lucide-react, brainStore
 * 
 * RULES:
 * - Domain logic is strictly forbidden here.
 * - Store orchestration handles all mapping and validation safety.
 * - This component only dispatches intents and visualizes resulting state.
 */

import React, { useState } from 'react';
import { Calculator, AlertCircle, Info } from 'lucide-react';
import { useBrainStore } from '../../../store/brainStore';

export default function QuickPayrollCalculator() {
  const [grossInput, setGrossInput] = useState<string>('');
  const [taxYear, setTaxYear] = useState<number>(2026);

  // Store Selectors
  const payrollResult = useBrainStore(s => s.payrollResult);
  const payrollError = useBrainStore(s => s.payrollError);
  const calculateEmployeePayroll = useBrainStore(s => s.calculateEmployeePayroll);

  const handleCalculate = () => {
    const grossNum = parseFloat(grossInput);
    if (isNaN(grossNum)) return;
    
    calculateEmployeePayroll({
      grossSalary: grossNum,
      taxYear: taxYear
    });
  };

  const formatILS = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '24px',
      color: '#f8fafc',
      fontFamily: 'Heebo, sans-serif',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Calculator size={20} color="#60a5fa" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>מחשבון שכר מהיר (סימולציה)</h2>
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '6px' }}>שכר ברוטו</label>
          <input 
            type="number"
            value={grossInput}
            onChange={(e) => setGrossInput(e.target.value)}
            placeholder="הכנס סכום (₪)..."
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '10px 12px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '6px' }}>שנת מס</label>
          <select 
            value={taxYear}
            onChange={(e) => setTaxYear(parseInt(e.target.value))}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '10px 32px 10px 12px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
        <button 
          onClick={handleCalculate}
          disabled={!grossInput}
          style={{
            background: grossInput ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 24px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: grossInput ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          חשב
        </button>
      </div>

      {/* Error State */}
      {payrollError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '6px',
          padding: '12px',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>שגיאת חישוב</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{payrollError}</div>
          </div>
        </div>
      )}

      {/* Success Result State */}
      {payrollResult && !payrollError && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.1)', 
              border: '1px solid rgba(34, 197, 94, 0.2)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#86efac', marginBottom: '4px' }}>שכר נטו לעובד</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#4ade80' }}>
                {formatILS(payrollResult.netSalary)}
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(249, 115, 22, 0.1)', 
              border: '1px solid rgba(249, 115, 22, 0.2)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#fdba74', marginBottom: '4px' }}>עלות מעסיק כוללת</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fb923c' }}>
                {formatILS(payrollResult.totalCostToEmployer)}
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            borderRadius: '8px', 
            padding: '16px',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#94a3b8', fontWeight: 600 }}>
              <Info size={16} />
              <span>פירוט ניכויים (עובד)</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#cbd5e1' }}>מס הכנסה</span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{formatILS(payrollResult.incomeTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#cbd5e1' }}>ביטוח לאומי</span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{formatILS(payrollResult.nationalInsurance)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#cbd5e1' }}>מס בריאות</span>
              <span style={{ color: '#f8fafc', fontWeight: 500 }}>{formatILS(payrollResult.healthTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>סך ניכויים חובה</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatILS(payrollResult.totalDeductions)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
