/* ============================================
// #region Module

   FILE: QuotePreview.tsx
   PURPOSE: PDF-like preview for the generated quote
   DEPENDENCIES: ../types
   EXPORTS: QuotePreview
   ============================================ */

import React from 'react';
import { QuoteState } from '../types';

interface Props {
  state: QuoteState;
}

export const QuotePreview: React.FC<Props> = ({ state }) => {
  const currentDate = new Date().toLocaleDateString('he-IL');

  return (
    <div className="bg-white text-gray-900 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden min-h-[600px] border border-gray-200">
      {/* Letterhead Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">David Eldad & Co.</h1>
          <p className="text-sm font-medium text-gray-600">Certified Public Accountants</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>Tel: 03-1234567 | Fax: 03-7654321</p>
            <p>123 Business Center, Ramat Gan</p>
          </div>
        </div>
        <div className="text-left">
          <p className="font-bold text-xl text-gray-800">הצעת מחיר ושכר טרחה</p>
          <p className="text-sm mt-1 text-gray-600">תאריך: {currentDate}</p>
          <p className="text-sm mt-1 text-gray-600">סימוכין: SB-QT-{Math.floor(Math.random() * 90000) + 10000}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="mb-8 text-sm leading-relaxed">
        <p>לכבוד,</p>
        <p className="font-bold text-lg">{state.clientName || '_______________'}</p>
        <p className="mt-4">
          בהמשך לפנייתכם, הרינו מתכבדים להגיש לכם הצעת מחיר לשירותי הראיית חשבון הנדרשים. משרדנו, Smart Bareau, מתמחה במתן שירותי הנהלת חשבונות, ייעוץ מס וליווי עסקי מקיף.
        </p>
      </div>

      {/* Pricing Table */}
      <div className="mb-10">
        <h3 className="font-bold text-md mb-3 border-b border-gray-300 pb-1">פירוט שכר טרחה:</h3>
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3">תיאור השירות</th>
              <th className="py-2 px-3 text-center">סוג חיוב</th>
              <th className="py-2 px-3 text-left">תעריף</th>
            </tr>
          </thead>
          <tbody>
            {/* Core Services based on rule extraction */}
            {state.clientType !== 'employee' && (
              <>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3">שירותי הנהלת חשבונות חודשיים שוטפים (לפי סיווג: {state.clientType})</td>
                  <td className="py-3 px-3 text-center text-gray-500">חודשי (ריטיינר)</td>
                  <td className="py-3 px-3 font-bold text-left">₪{state.baseMonthlyFee}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3">עריכת דוח שנתי אישי / למס הכנסה</td>
                  <td className="py-3 px-3 text-center text-gray-500">שנתי (פעם בשנה)</td>
                  <td className="py-3 px-3 font-bold text-left">₪{state.annualReportFee}</td>
                </tr>
              </>
            )}

            {state.clientType === 'employee' && (
              <>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3">דמי תפעול ופתיחת תיק לבדיקת זכאות</td>
                  <td className="py-3 px-3 text-center text-gray-500">חד פעמי</td>
                  <td className="py-3 px-3 font-bold text-left">₪{state.setupFee}</td>
                </tr>
                <tr className="border-b border-gray-100 bg-green-50">
                  <td className="py-3 px-3 text-green-800 font-medium">עמלת הצלחה בגין החזרי מס מרשויות המס (מתוך סכום ההחזר בפועל)</td>
                  <td className="py-3 px-3 text-center text-green-700">עמלת הצלחה</td>
                  <td className="py-3 px-3 font-bold text-green-700 text-left">{state.successFeePercent}%</td>
                </tr>
              </>
            )}

            {/* Additional Services */}
            {state.additionalServices.map(service => (
              <tr key={service.id} className="border-b border-gray-100">
                <td className="py-3 px-3 text-gray-700">
                  {service.name} <span className="text-xs text-gray-400 block">{service.description}</span>
                </td>
                <td className="py-3 px-3 text-center text-gray-500">{service.isMonthly ? 'חודשי' : 'חד פעמי'}</td>
                <td className="py-3 px-3 font-bold text-left">₪{service.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      {state.clientType !== 'employee' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-end text-sm mb-10">
          <div className="flex justify-between w-64 mb-2">
            <span className="text-gray-600">סה״כ חיוב חודשי ממוצע:</span>
            <span className="font-bold">₪{state.totalMonthly}</span>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-gray-200">
            <span className="text-gray-800 font-bold">סה״כ חד פעמי / שנתי:</span>
            <span className="font-bold text-lg text-[#10b981]">₪{state.totalOneTime + state.annualReportFee}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">* הסכומים אינם כוללים מע"מ כחוק</p>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="text-xs text-gray-500 space-y-2 mt-auto">
        <h4 className="font-bold text-gray-700 mb-1">תנאי התקשרות (Terms & Conditions)</h4>
        <p>1. ההצעה בתוקף ל-30 יום ממועד שליחתה.</p>
        <p>2. שכר הטרחה החודשי ישולם עד ה-1 לכל חודש מראש באמצעות הוראת קבע.</p>
        <p>3. במקרה של עמלת הצלחה התשלום מבוצע מתוך הכספים שהתקבלו בפועל והופקדו בחשבונו של הלקוח.</p>
        <p>4. סיום התקשרות יבוצע בכתב בהתראה של 30 יום מראש. המשרד ידאג להמצאת חומרי עבודה ומאזן בוחן למייצג החדש (בכפוף להסדרת חובות).</p>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-12 pt-6 border-t font-semibold border-gray-200 text-sm pb-8">
        <div className="text-center w-40">
          <p className="mb-8">חתימת הלקוח</p>
          <div className="border-b border-gray-400"></div>
        </div>
        <div className="text-center w-40">
          <p className="mb-8">דוד אלדד, רו"ח</p>
          <div className="border-b border-gray-400"></div>
        </div>
      </div>
    </div>
  );
};
// #endregion
