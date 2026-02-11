import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { validateRegister, validateLogin } from '../utils/validators';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Admin registration (for creating admin accounts)
router.post('/register', validate(validateRegister), register);
// Admin login
router.post('/login', validate(validateLogin), login);
// Admin logout
router.post('/logout', auth, logout);

export default router;
