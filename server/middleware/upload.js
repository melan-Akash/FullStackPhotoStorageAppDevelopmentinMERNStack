import multer from 'multer';

// Multer memory storage configuration for multi-file uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max limit
    files: 20, // Max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname?.split('.').pop()?.toLowerCase();
    const isHeic =
      ext === 'heic' ||
      ext === 'heif' ||
      file.mimetype === 'image/heic' ||
      file.mimetype === 'image/heif';

    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || isHeic) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and HEIC files are allowed'), false);
    }
  },
});
