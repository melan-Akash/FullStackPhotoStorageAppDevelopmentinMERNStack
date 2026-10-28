import mongoose, { Schema } from 'mongoose';

// Media Schema for photos and videos
const mediaSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    publicId: { type: String, required: true }, // Cloudinary Public ID
    size: { type: Number, default: 0 },
    format: { type: String, default: 'jpg' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    duration: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isFavorite: { type: Boolean, default: false, index: true },
    isTrash: { type: Boolean, default: false, index: true },
    trashedAt: { type: Date, default: null },
    objects: { type: [String], default: [] }, // Tags / Search keywords
  },
  { timestamps: true }
);

mediaSchema.index({ objects: 1 });

export const Media = mongoose.model('Media', mediaSchema);