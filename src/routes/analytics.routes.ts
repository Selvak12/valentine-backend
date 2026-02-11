import { Router } from 'express';
import { getOverview, getActivities } from '../controllers/analytics.controller';
import { auth, admin } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', auth, admin, getOverview);
router.get('/activities', auth, admin, getActivities);

export default router;
