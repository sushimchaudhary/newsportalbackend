import {type NextFunction, type Request, type Response, Router} from "express";
import AuthController from "../controller/AuthController";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";

// import { getHealthCheck, userLogin } from "../controller/AuthController";

const authCtrl = new AuthController()
const authRouter = Router();



authRouter.get("/", authCtrl.getHealthCheck);



authRouter.post("/auth/login", bodyValidator(), authCtrl.userLogin);
authRouter.post("/auth/register", bodyValidator(), authCtrl.userRegister);
// last end route 

export default authRouter