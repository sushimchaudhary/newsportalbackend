import { ZodError, ZodObject } from "zod";

import {type NextFunction, type Request, type Response} from "express";

// validation handle
const bodyValidator = (schmea:ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // custom middleware
    try {
      await schmea.parseAsync(req.body)
      next()
    } catch(exception){
      if(exception instanceof ZodError){
        let msgBag:Record<string, string> ={}
        exception.format((issue)=>{
          let field = issue.path.pop() as string;
          msgBag[field]= issue.message
        })
        
        next({
          code : 400,
          status: false,
          message: "Validation failed",
          details : msgBag
        });
      } else {
        next(exception)
      }
    }
    
  };
};

export default bodyValidator