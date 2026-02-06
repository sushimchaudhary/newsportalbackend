import type {Request, Response, NextFunction} from "express"

const ErrorHandlingMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  
  console.log("********* Global Error Handling Middleware: ********")
  console.log(error)
  console.log("------------------------------------------------------------");

  let code = error?.code || 500;
  let detail = error?.detail || error?.details || null;
  let message = error?.message || "Server Error...."

  res.status(code).json({
    error: detail,
    message: message,
    status: false,
  });
}

export default ErrorHandlingMiddleware