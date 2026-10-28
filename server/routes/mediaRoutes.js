import { Router } from 'express';
import {
  uploadMedia,
  getMedia,
  toggleFavorite,
  toggleTrash,
  getTrash,
  deleteMediaPermanently,
  emptyTrash,
  getStorageStats,
} from '../controllers/mediaController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Protect all media endpoints with JWT auth
router.use(requireAuth);

router.post('/upload', upload.array('media', 20), uploadMedia);
router.get('/', getMedia);
router.get('/trash', getTrash);
router.delete('/trash/empty', emptyTrash);
router.get('/stats', getStorageStats);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/trash', toggleTrash);
router.delete('/:id', deleteMediaPermanently);

export default router;