import express from 'express';
import { getMonthlyBudgetById, getAllMonthlyBudgets, createMonthlyBudget, updateMonthlyBudgetById, softDeleteMonthlyBudgetById } from '../../src/controllers/monthlyBudgetController.js';
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

router.get('/:id', authenticateUser, getMonthlyBudgetById);
router.get('/', authenticateUser, getAllMonthlyBudgets);
router.post('/', authenticateUser, handleValidation, createMonthlyBudget);
router.put('/:id', authenticateUser, handleValidation, updateMonthlyBudgetById);
router.delete('/:id', authenticateUser, softDeleteMonthlyBudgetById);


export default router;