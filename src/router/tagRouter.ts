import { Router } from "express";
import authCheck from "../middlewares/Auth";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import { CreateTagSchema } from "../validation-schema/tagValidation";
import TagController from "../controller/tagController";


const tagRouter = Router();
const tagCtrl = new TagController();

tagRouter.get("/", tagCtrl.getAllTags);

tagRouter.post("/", 
    authCheck(), 
    bodyValidator(CreateTagSchema),
    tagCtrl.createTag
);

tagRouter.put("/:id", 
    authCheck(), 
    bodyValidator(CreateTagSchema), 
    tagCtrl.updateTag
);

tagRouter.delete("/:id", authCheck(), tagCtrl.deleteTag);

export default tagRouter;