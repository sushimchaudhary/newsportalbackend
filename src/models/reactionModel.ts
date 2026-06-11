import mongoose, { Schema, Document } from "mongoose";

interface IReaction extends Document {
  slug: string;
  counts: {
    happy: number;
    sad: number;
    surprised: number;
    excited: number;
    angry: number;
  };
}

const ReactionSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  counts: {
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    surprised: { type: Number, default: 0 },
    excited: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  }
});

export const Reaction = mongoose.model<IReaction>("Reaction", ReactionSchema);