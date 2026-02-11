import mongoose from "mongoose";
// by default mongoose will add '_id': ObjectID, '__v': number column add to each model

const UserSchema = new mongoose.Schema(
  {
    // data structure or properties defined
    name: {
      type: String,
      min: 2,
      max: 50,
      required: true,
    },
    email: {
      type: String,
      required: true,
      max: 100,
      unique: true, // indexing for making table/document unique
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 50,
      unique: true,
    },
    password: {
      type: String, 
      required: true
    },
    bio: String,
    gender: {
      type: String, 
      enum: ['male','female','other']
    },
    address: {
      type: String
    },
    phone: String,
    image: {
      id: String, 
      url: String, 
      thumb: String
    },
  },
  {
    // config for the table
    timestamps: true, 
    autoCreate: true, 
    autoIndex: true
  },
);

const UserModel = mongoose.model("User", UserSchema)
export default UserModel