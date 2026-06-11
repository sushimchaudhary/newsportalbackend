import { Router } from "express";
import authCheck from "../middlewares/Auth";
import Uploader from "../middlewares/Uploader";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import AboutController from "../controller/aboutUsController";
import { AboutValidationSchema } from "../validation-schema/aboutUsValidation";

const aboutRouter = Router();
const aboutCtrl = new AboutController();

aboutRouter.get("/", aboutCtrl.getAbouts);
aboutRouter.get("/:id", aboutCtrl.getAboutById);

aboutRouter.post("/", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]),
    bodyValidator(AboutValidationSchema),
    aboutCtrl.createAbout
);

aboutRouter.put("/:id", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]), 
    aboutCtrl.updateAbout
);

aboutRouter.delete("/:id", authCheck(), aboutCtrl.deleteAbout);

export default aboutRouter;