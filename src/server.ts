
import express, {type NextFunction, type Express, type Request, type Response, response} from "express";
import authRouter from "./router/authRouter"

// express applocation
const app: Express = express();


// middlewares

app.use((req:Request, res:Response, next:NextFunction) => {
    //develop  ans implement some logic 
    
 console.log("I am for server.ts middleware")
 next()                   //passe to next immediate middleware call
})

// Routing
app.use(authRouter)                  // middleware => Specific routes


// not found
app.use((req:Request, res:Response, next:NextFunction) => {
    
  res.jsonp({
    error: null,
    messgae: "not found",
    status: false

  })
})






//-------------Sercer Execuiton------------------
const PORT = process.env.PORT || 9000;

const Host = process.env.HOST || "127.0.0.1";


//listen to the server

app.listen(Number(PORT), Host, (err) => {
    if (!err) {
        console.log(`Server is running on http://${Host}:${PORT}`);
        console.log("Press CTRL + C to stop the server");
    }
});

