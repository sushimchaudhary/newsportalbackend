import { Schema, model, Document, Types } from 'mongoose';

export interface IPhotoFeature extends Document {
    title: string;
    slug: string; // Slug फिल्ड थप्नुहोस्
    description?: string;
    images: string[];
    is_published: boolean;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
}

const PhotoFeatureSchema = new Schema<IPhotoFeature>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true }, // Slug थपियो
        description: { type: String, trim: true },
        images: [{ type: String, required: true }],
        is_published: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true, versionKey: false }
);

// Slug जेनेरेट गर्ने लजिक (Pre-save hook)
PhotoFeatureSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\u0900-\u097f]+/g, '-') // नेपाली (Unicode) र अंग्रेजी अक्षर राख्ने
            .replace(/(^-|-$)+/g, '') + '-' + Date.now(); // युनिक बनाउन timestamp थपियो
    }

});

export const PhotoFeature = model<IPhotoFeature>('PhotoFeature', PhotoFeatureSchema);