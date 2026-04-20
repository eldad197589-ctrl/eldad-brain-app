/* ============================================
   FILE: index.ts
   PURPOSE: Barrel export for domain/attendance knowledge
   DEPENDENCIES: israelLaborLaw, sectorAgreements, israelHolidays
   ============================================ */

export { ISRAEL_LABOR_LAW, OVERTIME_RATES } from './israelLaborLaw';
export {
  ATTENDANCE_AGREEMENTS,
  SECTORS,
  getAttendanceAgreement,
  getAgreementsBySector,
} from './sectorAgreements';
export type { AttendanceAgreement } from './sectorAgreements';
export {
  ISRAEL_HOLIDAYS,
  CHOL_HAMOED,
  HOLIDAY_EVES,
  MEMORIAL_DAYS,
  ELECTION_DAYS,
  OTHER_HOLIDAYS,
  isHoliday,
  isHolidayEve,
  isCholHamoed,
  isMemorialDay,
  isElectionDay,
  isSpecialDay,
  getSpecialDayName,
  getSpecialDayType,
} from './israelHolidays';
export type { SpecialDayType } from './israelHolidays';
export type { EmployeeSignal, EmployeeSignalName } from './employeeSignalTypes';
