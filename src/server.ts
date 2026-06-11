import 'dotenv/config';
import express, {
  type NextFunction,
  type Express,
  type Request,
  type Response,
} from "express";

import ErrorHandlingMiddleware from "./middlewares/ErrorHandlingMiddleware";
import path from "node:path";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mainRouter from "./router";

import connectDb from "./config/MongodbConfig";
import organizationRouter from "./router/organizationRouter";
import categoryRouter from "./router/categoryRouter";
import aboutRouter from "./router/aboutUsRouter";
import userRouter from "./router/userRouter";
import authRouter from "./router/authRouter";
import adsRouter from "./router/adsRouter";
import tagRouter from "./router/tagRouter";
import newsRouter from "./router/newsRouter";
import photoFeatureRouter from "./router/photoRouter";
import reactionRouter from "./router/reactionRouter";
import subscriberRouter from "./router/subscriberRouter";



const app: Express = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Token'], 
  credentials: true 
}));
app.use(helmet());

const limiter = rateLimit({
  windowMs: 60000, // १ मिनेट
  limit: 200, // ३० बाट बढाएर २०० वा ३०० मा पुर्‍याउनुहोस्
  message: "धेरै रिक्वेस्ट भयो, कृपया केही समय पछि प्रयास गर्नुहोस्!",
  standardHeaders: true,
  legacyHeaders: false,

  // डेभलपमेन्टको लागि लिमिटर स्किप गर्ने (सबैभन्दा राम्रो तरिका)
  skip: () => process.env.NODE_ENV === 'development'
});

app.use(limiter);

// builtin middlewares
// parsers/body parsers
app.use(
  express.json({
    limit: "5mb",
  }),
); // content-type: application/json
app.use(
  express.urlencoded({
    limit: "5mb",
  }),
); // content-type: application/x-www-form-urlencoded

// static middleware
app.use("/assets", express.static(path.join(__dirname, "../public/")));

// Routing
// app.use(authRouter); // milddeware => Specific routes
app.use("/api/v1/", mainRouter); // milddeware => Specific routes
app.use("/api/v1/organization", organizationRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/about-us", aboutRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/ads", adsRouter);
app.use("/api/v1/tag", tagRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/photo-features", photoFeatureRouter);
app.use("/api/v1/reaction", reactionRouter);
app.use("/api/v1/subscriber", subscriberRouter);

// not found
app.use((req: Request, res: Response, next: NextFunction) => {
  next({ code: 404, message: "Not found" });
});

// Exception or Error-handling middleware
app.use(ErrorHandlingMiddleware);

// Server Execution
const PORT = 9000;
const HOST = "127.0.0.1";

// listen to the server
const startServer = async () => {
  try {
    
    await connectDb();


    app.listen(PORT, HOST, () => {
      console.log(`Server is running on url http://${HOST}:${PORT}`);
      console.log("Press CTRL+C to discontinue server ...");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();