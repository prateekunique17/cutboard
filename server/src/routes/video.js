import express from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import { uploadVideo, getVideos, updateVideoStatus, getVideoMarkers, getVideoComments, getDashboardStats, deleteVideo } from '../controllers/videoController.js';

const router = express.Router();

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/', getVideos);
router.get('/stats', getDashboardStats);
router.patch('/status', updateVideoStatus);

router.get('/:id/markers', getVideoMarkers);
router.get('/:id/comments', getVideoComments);
router.delete('/:id', deleteVideo);

export default router;
