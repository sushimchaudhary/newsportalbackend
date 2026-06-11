import {ZodError, ZodObject} from "zod";
import {type NextFunction, type Request, type Response} from "express";

// validation handle
const bodyValidator = (schmea: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("\n--- [DEBUG] BODY VALIDATOR MIDDLEWARE STARTED ---");
    try {
      console.log("1. Received Payload:", req.body);
      if(!req.body) {
        next({code:422, message: "Empty payload"})
      }
      console.log("2. Validation Passed");
      // validation pass
      await schmea.parseAsync(req.body)
      next()
    } catch(exception)  {
      console.log("!!! Error in Body Validator:", (exception as Error).message); 
      // validation failed
      if(exception instanceof ZodError) {
        let msgBag: Record<string, string>= {}
        exception.format((issue) => {
          let field = issue.path.pop() as string;
          msgBag[field] = issue.message
        })
        next({
          code: 400,
          status: false,
          message: "Validation failed",
          details: msgBag
        });
      } else {
        next(exception)
      }
    }
  };
};

export default bodyValidator