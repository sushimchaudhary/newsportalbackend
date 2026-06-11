import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IAd extends Document {
  link?: string;
  adType: 'horizontal_1' | 'horizontal_2' | 'horizontal_3' | 'vertical_1' | 'vertical_2' | 'vertical_3' | 'popup';
  image: string;
  startDate: Date;
  endDate: Date;
  is_active: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

const adSchema = new Schema<IAd>(
  {
   
    link: {
      type: String,
      trim: true,
      default: "",
    },
    adType: {
      type: String,
      enum: ['horizontal_1', 'horizontal_2', 'horizontal_3', 'vertical_1', 'vertical_2', 'vertical_3', 'popup'],
      required: [true, 'Placement type is required'],
      unique: true,
    },
    image: {
      type: String,
      required: [true, 'Ad banner image is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Ad = model<IAd>('Ad', adSchema);