import {type NextFunction, type Request, type Response, Router} from "express";
import AuthController from "../controller/AuthController";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import { LoginSchema, RegisterSchema } from "../validation-schema/AuthValidation";
import Uploader from "../middlewares/Uploader";

// import { getHealthCheck, userLogin } from "../controller/AuthController";

const authCtrl = new AuthController()
const authRouter = Router();



authRouter.get("/", authCtrl.getHealthCheck);


authRouter.post("/auth/login", bodyValidator(LoginSchema), authCtrl.userLogin);
authRouter.post("/auth/register", Uploader().single('image'), bodyValidator(RegisterSchema), authCtrl.userRegister);

// last end route 

export default authRouter