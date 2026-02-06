import type { Request, Response, NextFunction } from "express"

export interface IAuthController {
  getHealthCheck(req: Request, res: Response, next: NextFunction): void;
  userLogin(req: Request, res: Response, next: NextFunction): void;
}