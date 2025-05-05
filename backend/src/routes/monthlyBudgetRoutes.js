import express from 'express';
import { body, param } from 'express-validator';
import { getMonthlyBudgetById, getAllMonthlyBudgets, createMonthlyBudget, updateMonthlyBudgetById, softDeleteMonthlyBudgetById } from '../../src/controllers/monthlyBudgetController.js';
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

const validateMonthlyBudget = [
  body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("Year must be between 2000 and 2100"),
  body("totalIncome").isFloat({ min: 0 }).withMessage("Total income must be a positive number"),
  body("formula").isArray().withMessage("Formula must be an array"),
  body("formula.*.label").isString().withMessage("Each formula item must have a label"),
  body("formula.*.percentage").isFloat({ min: 0, max: 100 }).withMessage("Percentage must be between 0 and 100"),
  body("expenses").isArray().withMessage("Expenses must be an array"),
  body("expenses.*.name").isString().withMessage("Each expense must have a name"),
  body("expenses.*.label").isString().withMessage("Each expense must have a label"),
  body("expenses.*.amount").isFloat({ min: 0 }).withMessage("Each expense amount must be positive"),
  body("expenses.*.expensedDate").optional().isString().withMessage("Expense date must be a valid date string"),
];

const validateObjectId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

router.get('/:id', authenticateUser, validateObjectId, getMonthlyBudgetById);
router.get('/', authenticateUser, getAllMonthlyBudgets);
router.post('/', authenticateUser, validateMonthlyBudget, handleValidation, createMonthlyBudget);
router.put('/:id', authenticateUser, validateObjectId, validateMonthlyBudget, handleValidation, updateMonthlyBudgetById);
router.delete('/:id', authenticateUser, validateObjectId, softDeleteMonthlyBudgetById);


export default router;