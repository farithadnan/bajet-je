import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, changePassword } from '../../src/controllers/userController.js';
import { authenticateUser, isAdmin} from '../../src/middleware/auth.js';
import { handleValidation } from '../../src/middleware/handleValidation.js';

const router = express.Router();

router.put('/change-password', authenticateUser, handleValidation, changePassword);

router.get('/', authenticateUser, isAdmin, getAllUsers);
router.get('/:id', authenticateUser, isAdmin, getUserById);

router.put('/:id', authenticateUser, handleValidation, updateUser);
router.delete('/:id', authenticateUser, isAdmin, deleteUser);

export default router;