import { Schema, model, Document, Types } from 'mongoose';

export interface IPhoto {
  _id: Types.ObjectId;
  url: string;
  publicId: string;
  thumbnail: string;
  caption?: string;
  order: number;
}

export interface IPhotoFeature extends Document {
  title: string;
  slug: string; // यो थप्नुहोस्
  description?: string;
  images: Types.DocumentArray<IPhoto & Document>;
  isPublished: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const photoFeatureSchema = new Schema<IPhotoFeature>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true }, // यहाँ slug थपियो
    description: { type: String, default: '', trim: true },
    images: { type: [photoSchema], default: [] },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

// Slug Pre-save Hook
photoFeatureSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const timestamp = Date.now().toString().slice(-4);
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0900-\u097f]+/g, '-') // नेपाली र अंग्रेजी अक्षर राख्ने
      .replace(/(^-|-$)+/g, '') + '-' + timestamp;
  }
});

export const PhotoFeature = model<IPhotoFeature>('PhotoFeature', photoFeatureSchema);