import { AuditInfo } from "./audit-info.model";

export interface MonthlyBudgetFormulatItem {
  label: string,
  percentage: number,
  allocatedAmount: number,
}

export interface MonthlyBudgetExpenses {
  name: string,
  amount: number,
  label: string,
  expensedDate: Date,
}

export interface BudgetTemplateReference {
  _id: string,
  templateName: string
}

export interface MonthlyBudget extends AuditInfo {
  _id: string,
  userId: string,
  budgetTemplateId: string | BudgetTemplateReference,
  month: number,
  year: number,
  totalIncome: number,
  totalExpenses: number,
  remainingAmount: number,
  overBudgetAmount: number,
  formula: MonthlyBudgetFormulatItem[],
  expenses: MonthlyBudgetExpenses[],
  status: boolean
}
