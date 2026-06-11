import mongoose, { Schema, model, Document, Types } from 'mongoose';
import slugify from 'slugify'; // वा `import slugify = require('slugify');`

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
  description?: string;
  is_active: boolean;
  image?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Updated by is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.pre('validate', function (next) {
  if (this.name) {
    // १. नामको वरिपरिको स्पेस हटाउने
    let str = this.name.trim();

    // २. स्ल्यास (/) लाई ड्यास (-) ले बदल्ने
    str = str.replace(/\//g, '-'); 
    
    // ३. स्पेसहरूलाई ड्यास (-) ले बदल्ने
    str = str.replace(/\s+/g, '-');

    // ४. स्लगमा सेट गर्ने (यसले नेपाली अक्षरहरूलाई जस्ताको तस्तै राख्छ)
    this.slug = str.toLowerCase();
  }
  
});

export const Category = model<ICategory>('Category', categorySchema);