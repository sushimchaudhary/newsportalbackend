import { Request, Response, NextFunction } from "express";
import { Subscriber } from "../models/subscribeModel";

class SubscriberController {
    // १. सब्सक्राइब गर्ने (POST)
    async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                return next({ code: 400, message: "Email is required" });
            }

            const existing = await Subscriber.findOne({ email });
            if (existing) {
                return next({ code: 400, message: "You are already subscribed!" });
            }

            const newSubscriber = new Subscriber({ email });
            await newSubscriber.save();

            res.status(201).json({ message: "Successfully subscribed!", status: true });
        } catch (exception) {
            next(exception);
        }
    }

    // २. सबै सब्स्क्राइबरहरू हेर्ने (GET)
    async getAllSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const subscribers = await Subscriber.find().sort({ createdAt: -1 });
            res.status(200).json({ data: subscribers, status: true });
        } catch (exception) {
            next(exception);
        }
    }

    // ३. सब्स्क्राइबर डिलिट गर्ने (DELETE)
    async deleteSubscriber(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await Subscriber.findByIdAndDelete(id);
            res.status(200).json({ message: "Deleted successfully", status: true });
        } catch (exception) {
            next(exception);
        }
    }
}
export default SubscriberController;