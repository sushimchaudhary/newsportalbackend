import type { Request, Response, NextFunction } from "express";
import { IAuthController } from "../types/AuthType";

class AuthController implements IAuthController {
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

    res.json({
      data: data,
      message: "Your account created successfully",
      status: true
    })
  }
}

export default AuthController
