import { Router } from "express";
import authCheck from "../middlewares/Auth";
import Uploader from "../middlewares/Uploader";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import { CreateNewsSchema } from "../validation-schema/NewsValidation";
import NewsController from "../controller/newsConteoller";
import { UserRole } from "../models/UserModel";

const newsRouter = Router();
const newsCtrl = new NewsController();

newsRouter.get("/", newsCtrl.getAllNews);
newsRouter.get("/:slug", newsCtrl.getNewsBySlug);

newsRouter.post("/", 
    authCheck([UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.JOURNALIST]), 
    Uploader().fields([{ name: "image", maxCount: 2 }]),
    bodyValidator(CreateNewsSchema),
    newsCtrl.createNews
);



// Update News: Superadmin, Editor ra Journalist le matra
newsRouter.put("/:id", 
    authCheck([UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.JOURNALIST]), 
    Uploader().fields([{ name: "image", maxCount: 2 }]), 
    newsCtrl.updateNews
);

// Delete News: Superadmin ra Editor le matra (e.g. Journalist lai nidine ho vane)
newsRouter.delete("/:id", 
    authCheck([UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.JOURNALIST]), 
    newsCtrl.deleteNews
);

// Delete/Update routes pani yesari nai thapna sakincha...

export default newsRouter;