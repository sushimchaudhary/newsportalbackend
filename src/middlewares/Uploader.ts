import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { cloudinaryConfig } from "../config/AppConfig"

const Uploader = () => {
  // cloudinary configuration
  cloudinary.config(cloudinaryConfig)

  // storage configure
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "/api-58",
      unique_filename: true
    } as Record<string,string|boolean>
  })

  // multer configure 
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  })
}

export default Uploader