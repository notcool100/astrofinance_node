import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../common/middleware/auth.middleware";
import * as llpController from "../controllers/llp.controller";

const router: ExpressRouter = Router();

// Generate Provisions (Run manual job)
router.post(
    "/generate",
    authenticate,
    llpController.generateProvisions,
);

// Get Report
router.get(
    "/report",
    authenticate,
    llpController.getProvisionReport,
);

export default router;
