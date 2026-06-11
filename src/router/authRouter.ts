import { Router } from "express";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import { LoginSchema } from "../validation-schema/UserValidation";
import UserController from "../controller/AuthController"; 
import authCheck from "../middlewares/Auth";
const authCtrl = new UserController();
const authRouter = Router();

// /api/v1/auth/
// authRouter.get("/", authCtrl.getHealthCheck);
authRouter.get("/me", authCheck(), authCtrl.getHealthCheck);

// /api/v1/auth/login
authRouter.post("/login", bodyValidator(LoginSchema), authCtrl.userLogin);

export default authRouter;