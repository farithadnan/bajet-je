import express from 'express';
import { body, param } from 'express-validator';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, changePassword } from '../../src/controllers/userController.js';
import { authenticateUser, isAdmin} from '../../src/middleware/auth.js';
import { handleValidation } from '../../src/middleware/handleValidation.js';

const router = express.Router();

// Validation rules
const validateChangePassword = [
    body('oldPassword')
        .isString().withMessage('Old password must be a string')
        .isLength({ min: 8 }).withMessage('Old password must be at least 8 characters long'),
    body('newPassword')
        .isString().withMessage('New password must be a string')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
        .custom((value, { req }) => value !== req.body.oldPassword)
        .withMessage('New password must be different from old password'),
];

const validateCreateUser = [
  body("username").isString().withMessage("Username must be a string").isLength({ min: 5 }).withMessage("Username must be at least 5 characters long"),
  body("email").isEmail().withMessage("Email must be valid"),
  body("role").isIn(["admin", "user"]).withMessage("Role must be either admin or user"),
  body("status").isBoolean().withMessage("Status must be a boolean"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value, { req }) => value !== req.body.oldPassword)
    .withMessage("Password must be different from old password"),
];

const validateUpdateUser = [
    body('username')
        .optional()
        .isString().withMessage('Username must be a string')
        .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
    body('email')
        .optional()
        .isEmail().withMessage('Email must be valid'),
    body('role')
        .optional()
        .isIn(['admin', 'user']).withMessage('Role must be either admin or user'),
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be a boolean'),
        body('newPassword')
        .isString().withMessage('New password must be a string')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
        .custom((value, { req }) => value !== req.body.oldPassword)
        .withMessage('New password must be different from old password'),
];

const validateObjectId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

router.put('/change-password', authenticateUser, validateChangePassword, handleValidation, changePassword);

router.get('/', authenticateUser, isAdmin, getAllUsers);
router.get('/:id', authenticateUser, validateObjectId, isAdmin, getUserById);

router.post('create', authenticateUser, isAdmin, validateCreateUser, handleValidation, createUser);
router.put('/:id', authenticateUser, validateObjectId, validateUpdateUser, handleValidation, updateUser);
router.delete('/:id', authenticateUser, validateObjectId, isAdmin, deleteUser);

export default router;