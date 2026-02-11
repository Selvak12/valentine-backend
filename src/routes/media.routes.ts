import { Router, Request, Response } from 'express';
import { auth, admin } from '../middleware/auth.middleware';
import { upload } from '../services/storage.service';

const router = Router();

router.post('/upload', auth, admin, upload.single('file'), (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const file = req.file;
        res.json({
            success: true,
            data: {
                url: file.path,
                publicId: file.filename,
                format: file.mimetype.split('/')[1],
                size: file.size
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
