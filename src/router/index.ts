import { Router } from "express";
import authRouter from "./authRouter";
import organizationRouter from "./organizationRouter";

const mainRouter = Router();

mainRouter.use('/auth', authRouter)

mainRouter.use('/organization', organizationRouter)

export default mainRouter;