import express from 'express';
import { body, param } from 'express-validator';
import { getBudgetTemplateById, getAllBudgetTemplates, createBudgetTemplate, updateBudgetTemplateById, softDeleteBudgetTemplateById } from '../../src/controllers/budgetTemplateController.js';
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

const validateBudgetTemplate = [
    body('templateName')
        .isString().withMessage('Template name must be a string')
        .isLength({ min: 3 }).withMessage('Template name must be at least 3 characters long'),
    body('formula').isArray().withMessage('Formula must be an array'),
    body('formula.*.label').isString().withMessage('Each formula item must have a label'),
    body('formula.*.percentage')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Percentage must be between 0 and 100'),
];

const validateObjectId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

router.get('/:id', authenticateUser, validateObjectId, getBudgetTemplateById);
router.get('/', authenticateUser, getAllBudgetTemplates);
router.post('/', authenticateUser, validateBudgetTemplate, handleValidation, createBudgetTemplate);
router.put('/:id', authenticateUser, validateObjectId, validateBudgetTemplate, handleValidation, updateBudgetTemplateById);
router.delete('/:id', authenticateUser, validateObjectId, softDeleteBudgetTemplateById);

export default router;