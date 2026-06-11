import { Router } from "express";
import authCheck from "../middlewares/Auth";
import Uploader from "../middlewares/Uploader";
import AdController from "../controller/adsController";

const adRouter = Router();
const adCtrl = new AdController();

adRouter.get("/", adCtrl.getAllAds);

adRouter.post("/", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]),
    adCtrl.createAd
);

adRouter.put("/:id", 
    authCheck(), 
    Uploader().fields([{ name: "image", maxCount: 1 }]), 
    adCtrl.updateAd
);

adRouter.delete("/:id", authCheck(), adCtrl.deleteAd);

export default adRouter;