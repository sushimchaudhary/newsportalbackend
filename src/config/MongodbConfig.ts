import mongoose from "mongoose";
import { MongodbConfig } from "./AppConfig";

const connectDb = async () => {
  try {
    await mongoose.connect(MongodbConfig.url, {
      dbName: MongodbConfig.dbName,
      autoCreate: true, 
      autoIndex: true
    });
    console.log("************ Mongodb connected successfully ************");
  } catch(exception) {
    console.error("************ Mongodb Connection Error ************", exception);
    throw exception; 
  }
};

export default connectDb;