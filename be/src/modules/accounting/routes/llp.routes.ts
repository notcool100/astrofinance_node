import { Router, type Router as ExpressRouter } from "express";
import { authenticateAdmin } from "../../../common/middleware/auth.middleware";
import * as llpController from "../controllers/llp.controller";

const router: ExpressRouter = Router();

// Generate Provisions (Run manual job)
router.post(
    "/generate",
    authenticateAdmin,
    llpController.generateProvisions,
);

// Get Report
router.get(
    "/report",
    authenticateAdmin,
    llpController.getProvisionReport,
);

export default router;
