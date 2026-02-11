import express, { type NextFunction, type Express, type Request, type Response } from "express";
import authRouter from "./router/authRouter";
import ErrorHandlingMiddleware from "./middlewares/ErrorHandlingMiddleware";
import path from "node:path";

// express application 
const app: Express = express()


// builtin middlewares
// parsers/body parsers
app.use(express.json({
  limit: "5mb"
}));      // content-type: application/json
app.use(express.urlencoded({
  limit: "5mb"
}))   // content-type: application/x-www-form-urlencoded


// static middleware
app.use("/assets", express.static(path.join(__dirname, "../public/")))

// Routing 
// app.use(authRouter); // milddeware => Specific routes
app.use("/api/v1/", authRouter);           // milddeware => Specific routes

// not found 
app.use((req: Request, res: Response, next: NextFunction) => {
  next({ code: 404, message: "Not found" });
})

// Exception or Error-handling middleware 
app.use(ErrorHandlingMiddleware)


// Server Execution 
const PORT = 9000
const HOST = "127.0.0.1"

// listen to the server 
app.listen(PORT, HOST, (err) => {
  if(!err) {
    console.log(`Server is running on url http://${HOST}:${PORT}`)
    console.log("Press CTRL+C to discontinue server ...")
  }
})
