import { Router } from "express";
import ReactionController from "../controller/resctionController"; 

const reactionRouter = Router();

reactionRouter.get("/:slug", ReactionController.getReactions);

reactionRouter.post("/update", ReactionController.updateReaction);

export default reactionRouter;