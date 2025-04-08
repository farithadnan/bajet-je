import express from 'express';
import { getBudgetTemplateById, getAllBudgetTemplates, createBudgetTemplate, updateBudgetTemplateById, softDeleteBudgetTemplateById } from '../../src/controllers/budgetTemplateController.js';
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

router.get('/:id', authenticateUser, getBudgetTemplateById);
router.get('/', authenticateUser, getAllBudgetTemplates);
router.post('/', authenticateUser, handleValidation, createBudgetTemplate);
router.put('/:id', authenticateUser, handleValidation, updateBudgetTemplateById);
router.delete('/:id', authenticateUser, softDeleteBudgetTemplateById);

export default router;