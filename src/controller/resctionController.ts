import { Request, Response, NextFunction } from "express";
import { Reaction } from "../models/reactionModel";

class ReactionController {
    // प्रतिक्रियाहरू र प्रतिशत हेर्न
    async getReactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;
            const reaction = await Reaction.findOne({ slug });
            
            const counts = reaction ? reaction.counts : { happy:0, sad:0, surprised:0, excited:0, angry:0 };
            const total = Object.values(counts).reduce((a, b) => a + b, 0);

            res.json({ counts, total, status: true });
        } catch (err) { next(err); }
    }

    // प्रतिक्रिया दर्ता गर्न (Atomic update)
    async updateReaction(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug, type, action } = req.body; // action: 'add' or 'remove'
            const field = `counts.${type}`;
            const value = action === 'add' ? 1 : -1;

            const updated = await Reaction.findOneAndUpdate(
                { slug },
                { $inc: { [field]: value } },
                { 
                    returnDocument: 'after', // 'new: true' को ठाउँमा यो राख्नुहोस्
                    upsert: true 
                }
            );

            res.json({ data: updated.counts, message: "Reaction updated", status: true });
        } catch (err) { next(err); }
    }
}
export default new ReactionController();