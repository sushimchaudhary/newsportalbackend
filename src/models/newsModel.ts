import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  type: string[]; // e.g., ['Trending', 'Featured', 'Breaking']
  tags: Types.ObjectId[]; // Multiple select
  image: string;
  description: string;
  content: string; // Editor content
  is_published: 'Draft' | 'Pending' | 'Published';
  viewCount: number;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    type: [{ type: String }], 
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    image: { type: String, required: true },
    
    content: { type: String }, // For rich text editor
    is_published: { 
      type: String, 
      enum: ['Draft', 'Pending', 'Published'], 
      default: 'Draft' 
    },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);




newsSchema.pre('validate', function (next) {
  if (this.title) {
    // १. ट्रिम गर्ने
    let slug = this.title.trim();

    // २. स्ल्यास (/) र अन्य विशेष चिन्हहरूलाई ड्यास (-) ले रिप्लेस गर्ने
    // नेपालीमा \w ले काम नगर्ने हुनाले हामीले म्यानुअली स्पेस र स्ल्यासलाई मात्र टार्गेट गर्छौँ
    slug = slug
      .replace(/[\/\s_-]+/g, '-') // स्पेस, अन्डरस्कोर, स्ल्यास वा ड्यासलाई एउटा ड्यासमा बदल्ने
      .replace(/^-+|-+$/g, '');   // सुरु र अन्त्यमा ड्यास भए हटाउने

    // ३. स्लगमा सेट गर्ने (नेपाली अक्षरहरू सुरक्षित रहन्छन्)
    // Date.now() नराख्ने हो भने नाम मात्रै स्लग हुन्छ, राख्ने हो भने तलको जस्तो गर्ने
    this.slug = `${slug.toLowerCase()}-${Date.now()}`;
  }
});

export const News = model<INews>('News', newsSchema);