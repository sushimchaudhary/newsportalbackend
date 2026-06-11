import { Router } from "express";

import authCheck from "../middlewares/Auth";
import OrganizationController from "../controller/organizationController";
import Uploader from "../middlewares/Uploader";
import bodyValidator from "../middlewares/BodyValidatorMiddleware";
import { CreateOrganizationSchema } from "../validation-schema/OrganizationValidation";

const organizationRouter = Router();

const organizationCtrl = new OrganizationController();

organizationRouter.get("/", organizationCtrl.OrganizationGet);
organizationRouter.post("/", authCheck(),Uploader().fields([
    {name: "logo", maxCount: 1}
]),bodyValidator(CreateOrganizationSchema),
 organizationCtrl.createOrganization);


organizationRouter.delete("/:id", authCheck(), organizationCtrl.deleteOrganization);

organizationRouter.put("/:id",authCheck(),Uploader().fields([{ name: "logo", maxCount: 1 }]), 
    organizationCtrl.updateOrganization
);

export default organizationRouter;