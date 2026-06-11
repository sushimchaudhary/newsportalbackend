import { Router } from "express";
import authCheck from "../middlewares/Auth";
import Uploader from "../middlewares/Uploader";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import CategoryController from "../controller/categoryController";
import { CreateCategorySchema } from "../validation-schema/CategoryValidation";

const categoryRouter = Router();
const categoryCtrl = new CategoryController();

categoryRouter.get("/", categoryCtrl.getAllCategories);

categoryRouter.post("/", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]),
    bodyValidator(CreateCategorySchema),
    categoryCtrl.createCategory
);

categoryRouter.put("/:id", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]), 
    categoryCtrl.updateCategory
);

categoryRouter.delete("/:id", authCheck(), categoryCtrl.deleteCategory);

export default categoryRouter;