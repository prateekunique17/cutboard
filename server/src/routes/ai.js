import express from 'express';
import { auditVideo } from '../controllers/aiController.js';

const router = express.Router();

router.post('/scan', auditVideo);

export default router;
