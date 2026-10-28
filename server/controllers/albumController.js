import { Album } from '../models/album.js';

// Create a new album
export const createAlbum = async (req, res) => {
  try {
    const { title, description, photoIds } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Album title is required' });
    }

    const validPhotos = Array.isArray(photoIds) ? photoIds : [];

    const album = await Album.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: req.user.id,
      photos: validPhotos,
    });

    const populated = await Album.findById(album._id)
      .populate('owner', 'name email')
      .populate({
        path: 'photos',
        match: { isTrash: false },
        select: 'thumbnailUrl url mediaType title',
      });

    res.status(201).json({ album: populated || album });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create album' });
  }
};

// Retrieve all albums for the authenticated user
export const getMyAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ owner: req.user.id })
      .populate({
        path: 'photos',
        match: { isTrash: false },
        select: 'thumbnailUrl url mediaType title',
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ albums });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch albums' });
  }
};

// Fetch a single album by ID
export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.id, owner: req.user.id })
      .populate('owner', 'name email')
      .populate({
        path: 'photos',
        match: { isTrash: false },
        options: { sort: { createdAt: -1 } },
      });

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.status(200).json({ album });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch album' });
  }
};

// Add photos to an existing album
export const addPhotosToAlbum = async (req, res) => {
  try {
    const { photoIds } = req.body;
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ message: 'Photo IDs array is required' });
    }

    const album = await Album.findOne({ _id: req.params.id, owner: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Merge photo IDs without duplicates
    const updatedPhotos = Array.from(new Set([...album.photos.map((p) => p.toString()), ...photoIds]));
    album.photos = updatedPhotos;
    await album.save();

    const populated = await Album.findById(album._id).populate({
      path: 'photos',
      match: { isTrash: false },
    });

    res.status(200).json({ album: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add photos to album' });
  }
};

// Remove a photo from an album
export const removePhotoFromAlbum = async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const album = await Album.findOne({ _id: id, owner: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    album.photos = album.photos.filter((p) => p.toString() !== photoId);
    await album.save();

    res.status(200).json({ message: 'Photo removed from album', album });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove photo' });
  }
};

// Delete an album
export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    res.status(200).json({ message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete album' });
  }
};