
import type { Request, Response, NextFunction } from "express";

export  function getHealthCheck (req: Request, res:Response, next: NextFunction){
  res.json({
    data:"Call ok",
    message: "ok",
    status: true,
  })
}

export const  userLogin = (req: Request, res: Response, next: NextFunction)=>{
//   console.log(req.url, req.method);

  res.json({
    data: "Auth Login ok",
    message: "ok",
    status: true,
  });
};
