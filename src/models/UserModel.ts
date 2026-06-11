import { Schema, model, Document, Types } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = "SuperAdmin",
  EDITOR = "Editor",
  JOURNALIST = "Journalist",
  READER = "Reader"
}

export interface IUser extends Document {
  username:string;
  fullName: string;
  email: string;
  contact?: string;
  image?: string;
  address?: string;
  role: UserRole;

  password?: string; 
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    username: {type: String, required:true, unique: true},
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contact: { type: String, required: true, unique: true, trim: true },
    image: { type: String, default: null },
    address: { type: String, default: null },
   
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.READER 
    },
    password: { type: String, select: false }, 
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>('User', userSchema);