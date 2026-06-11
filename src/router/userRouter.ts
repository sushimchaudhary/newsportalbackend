import { Router } from "express";
import authCheck from "../middlewares/Auth";
import Uploader from "../middlewares/Uploader";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import UserController from "../controller/AuthController";
import { UserValidationSchema } from "../validation-schema/UserValidation";

const userRouter = Router();
const userCtrl = new UserController();

// List all users with search/filter
userRouter.get("/", authCheck(), userCtrl.getUsers);

// Create new staff/user
userRouter.post("/", 
    //  authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]),
    bodyValidator(UserValidationSchema),
    userCtrl.createUser
);

// Update user details
userRouter.put("/:id", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]), 
    userCtrl.updateUser
);

// Delete user
userRouter.delete("/:id", authCheck(), userCtrl.deleteUser);

export default userRouter;