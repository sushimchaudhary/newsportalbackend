import type { Request, Response, NextFunction } from "express";
import { IAuthController } from "../types/AuthType";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "../config/AppConfig";

class AuthController implements IAuthController {
  constructor() {
    cloudinary.config(cloudinaryConfig)
  }

  getHealthCheck(req: Request, res: Response, next: NextFunction) {
    //
    res.json({
      data: "Call ok",
      message: "OK",
      status: true,
    });
  }

  userLogin = (req: Request, res: Response, next: NextFunction) => {
    // form send data /body data 
    const data = req.body; 
    
    res.json({
      data: data,
      message: "OK",
      status: true,
    });
  };

  userRegister(req: Request, res: Response, next: NextFunction) {
    // user register here 
    const data = req.body;

    // req.files = {image: [{}], gallery: [{},{},{},{},{}]}

    if(req.file) {
      data.image = {
        id: req.file.filename,
        url: req.file.path,
        thumb: cloudinary.url(req.file.filename, {
          transformation: [{aspect_ratio: "1.0", crop: "thumb", gravity: "face", width: "400"}]
        })
      }
    }


    // Store in db


    res.json({
      data: data,
      message: "Your account created successfully",
      status: true
    })
  }
}

export default AuthController