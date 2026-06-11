import { Router } from "express";
import SubscriberController from "../controller/subscriberController";
import authCheck from "../middlewares/Auth";

const subscriberRouter = Router();
const subCtrl = new SubscriberController();

// GET: लिस्ट हेर्ने (Admin मात्र)
subscriberRouter.get("/", authCheck(), subCtrl.getAllSubscribers);

// POST: नयाँ सब्सक्राइब (पब्लिक)
subscriberRouter.post("/", subCtrl.subscribe);

// DELETE: डिलिट गर्ने (Admin मात्र)
subscriberRouter.delete("/:id", authCheck(), subCtrl.deleteSubscriber);

export default subscriberRouter;