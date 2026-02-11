import { Router } from 'express';
import {
    createInvitation,
    getInvitations,
    getInvitationById,
    deleteInvitation,
    sendInvitation
} from '../controllers/invitation.controller';
import { auth, admin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { validateInvitation } from '../utils/validators';

const router = Router();

// All invitation routes require admin authentication
router.use(auth);
router.use(admin);

router.post('/', validate(validateInvitation), createInvitation);
router.get('/', getInvitations);
router.get('/:id', getInvitationById);
router.delete('/:id', deleteInvitation);
router.post('/:id/send', sendInvitation);

export default router;
