import { Router } from 'express';
import { getPublicInvitation, trackPageView, trackInteraction, trackAccept } from '../controllers/tracking.controller';
import { auth, admin } from '../middleware/auth.middleware';

const router = Router();

// Public invitation view (recipients can view without login)
router.get('/:shortCode', getPublicInvitation);

// Admin-only tracking endpoints
router.post('/pageview', auth, admin, trackPageView);
router.post('/interaction', auth, admin, trackInteraction);
router.post('/accept', auth, admin, trackAccept);

export default router;
