import type { Request, Response, NextFunction } from "express";
import multer from "multer";

const ErrorHandlingMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("********* Global Error Handling Middleware: ********");
  console.log(error);
  console.log("----------------------------------------------------");

  // डिफोल्ट भ्यालुहरू
  let code: any = error?.status || error?.statusCode || 500;
  let detail = error?.detail || error?.details || null;
  let message = error?.message || "Server Error....";

  // १. Mongoose Validation Error (यो थप्नुहोस् - यसले नै 'contact_no' को एरर समात्छ)
  if (error.name === "ValidationError") {
    code = 400;
    message = "Validation Failed";
    detail = {};
    // सबै फिल्डका एररहरूलाई 'detail' अब्जेक्टमा राख्ने
    Object.keys(error.errors).forEach((key) => {
      detail[key] = error.errors[key].message;
    });
  }

  // २. Multer Error Check
  if (error instanceof multer.MulterError) {
    code = 400;
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected field or too many files. Please check field name.";
    }
  }

  // ३. Mongo Duplicate Key Error (Code 11000)
  if (error?.name === "MongoServerError" && error?.code === 11000) {
    code = 400;
    message = "Validation Failed";
    detail = {};
    const field = Object.keys(error.keyPattern).pop() as string;
    detail[field] = `${field} already exists. It should be unique.`;
  }

  // Final Status Code check
  const finalStatusCode = typeof code === "number" ? code : 500;

  res.status(finalStatusCode).json({
    error: detail,
    message: message,
    status: false,
  });
};

export default ErrorHandlingMiddleware;