import mongoose from "mongoose";
import { MongodbConfig } from "./AppConfig";

// IIFE 
(async () => {
  try {
    await mongoose.connect(MongodbConfig.url, {
      dbName: MongodbConfig.dbName,
      autoCreate: true, 
      autoIndex: true
    })
    console.log("************ Mongodb connected successfully ************");
  } catch(exception) {
    console.log("*******************************")
    console.error(exception)
    console.log("************ Mongodb Connection Error ************");
  }
})()