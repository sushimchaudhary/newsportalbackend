import mongoose, { Schema, model, Document, Types } from 'mongoose';


export interface IOrganization extends Document {
  name: string;
  address: string;
  contact_no: string;
  email: string;
  fb_link?: string;
  insta_link?: string;
  linkedin_link?: string;
  x_link?: string;
  google_map?: string;
  logo?: string; 
  
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Official email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    address: {
      type: String,
      required: [true, 'Location address is required'],
    },
    contact_no: [{
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
  }],
    
    fb_link: { type: String, default: "" },
    insta_link: { type: String, default: "" },
    linkedin_link: { type: String, default: "" },
    x_link: { type: String, default: "" },
    google_map: { type: String, default: "" },
    
 
    logo: {
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

export const Organization = model<IOrganization>('Organization', organizationSchema);