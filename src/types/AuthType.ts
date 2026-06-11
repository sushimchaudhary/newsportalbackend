import type { Request, Response, NextFunction } from "express";

export interface IAuthController {
  getHealthCheck(req: Request, res: Response, next: NextFunction): void;
  userLogin(req: Request, res: Response, next: NextFunction): void;
}

export interface IUser {
  _id: any;
  username:string;
  fullName: string;
  email: string;
  contact?: string;
  role: string;
  address?: string;
 
  image?: string; 
}

export interface IAuthRequest extends Request {
  loggedInUser?: IUser;
}