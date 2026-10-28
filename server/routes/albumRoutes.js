import { Router } from 'express';
import {
  createAlbum,
  getMyAlbums,
  getAlbumById,
  addPhotosToAlbum,
  removePhotoFromAlbum,
  deleteAlbum,
} from '../controllers/albumController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all album endpoints with JWT auth
router.use(requireAuth);

router.post('/', createAlbum);
router.get('/', getMyAlbums);
router.get('/:id', getAlbumById);
router.delete('/:id', deleteAlbum);
router.post('/:id/photos', addPhotosToAlbum);
router.delete('/:id/photos/:photoId', removePhotoFromAlbum);

export default router;