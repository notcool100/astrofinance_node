import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../common/middleware/auth.middleware";
import * as interestController from "../controllers/interest.controller";

const router: ExpressRouter = Router();

// Trigger Daily Interest Calculation manually (or via cron webhook)
router.post(
    "/daily",
    authenticate,
    interestController.triggerDailyInterest,
);

// Trigger Quarterly Interest Posting manually
router.post(
    "/quarterly",
    authenticate,
    interestController.triggerQuarterlyPosting,
);

export default router;
