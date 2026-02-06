import {type NextFunction, type Request, type Response} from "express";

// validation handle
const bodyValidator = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // custom middleware
    next()
  };
};

export default bodyValidator