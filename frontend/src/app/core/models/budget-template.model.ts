import { AuditInfo } from "./audit-info.model";

export interface BudgetTemplate extends AuditInfo{
  _id: string,
  templateName: string,
  userId: string,
  formula: FormulaItem[],
  status: boolean,
}

export interface FormulaItem {
  label: string,
  percentage: number
}
