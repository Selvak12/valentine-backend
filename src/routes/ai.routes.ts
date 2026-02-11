import { Router } from 'express';
import { generateMessage } from '../controllers/ai.controller';
import { auth, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { validateAI } from '../utils/validators';

const router = Router();

router.post('/generate-message', auth, admin, validate(validateAI), generateMessage);

export default router;
