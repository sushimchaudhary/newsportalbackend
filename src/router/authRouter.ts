import {Router} from "express";
import { getHealthCheck, userLogin } from "../controller/AuthController";

const authRouter = Router();


authRouter.get("/",getHealthCheck);
authRouter.post("/auth/login",userLogin);




export default authRouter