import { Router, type Router as ExpressRouter } from "express";
import { authenticateAdmin } from "../../../common/middleware/auth.middleware";
import * as interestController from "../controllers/interest.controller";

const router: ExpressRouter = Router();

// Trigger Daily Interest Calculation manually (or via cron webhook)
router.post(
    "/daily",
    authenticateAdmin,
    interestController.triggerDailyInterest,
);

// Trigger Quarterly Interest Posting manually
router.post(
    "/quarterly",
    authenticateAdmin,
    interestController.triggerQuarterlyPosting,
);

export default router;
