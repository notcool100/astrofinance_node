import { Router, type Router as ExpressRouter } from "express";
import { check } from "express-validator";
import { authenticateAdmin } from "../../../common/middleware/auth.middleware";
import { validate } from "../../../common/middleware/validation.middleware";
import * as shareController from "../controllers/share.controller";

const router: ExpressRouter = Router();

// Get All Share Accounts
router.get(
    "/",
    authenticateAdmin,
    shareController.getAllShareAccounts,
);

// Get Share Account
router.get(
    "/:userId",
    authenticateAdmin,
    shareController.getShareAccount,
);

// Issue Shares
router.post(
    "/issue",
    authenticateAdmin,
    [
        check("userId", "User ID is required").not().isEmpty(),
        check("shareCount", "Share count must be a positive integer").isInt({ min: 1 }),
        check("amount", "Amount must be a positive number").isFloat({ min: 0 }),
    ],
    validate,
    shareController.issueShares,
);

// Return Shares
router.post(
    "/return",
    authenticateAdmin,
    [
        check("userId", "User ID is required").not().isEmpty(),
        check("shareCount", "Share count must be a positive integer").isInt({ min: 1 }),
        check("amount", "Amount must be a positive number").isFloat({ min: 0 }),
    ],
    validate,
    shareController.returnShares,
);

export default router;
