import { Router, type Router as ExpressRouter } from "express";
import { check } from "express-validator";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { validate } from "../../../common/middleware/validation.middleware";
import * as shareController from "../controllers/share.controller";

const router: ExpressRouter = Router();

// Get All Share Accounts
router.get(
    "/",
    authenticate,
    shareController.getAllShareAccounts,
);

// Get Share Account
router.get(
    "/:userId",
    authenticate,
    shareController.getShareAccount,
);

// Issue Shares
router.post(
    "/issue",
    authenticate,
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
    authenticate,
    [
        check("userId", "User ID is required").not().isEmpty(),
        check("shareCount", "Share count must be a positive integer").isInt({ min: 1 }),
        check("amount", "Amount must be a positive number").isFloat({ min: 0 }),
    ],
    validate,
    shareController.returnShares,
);

export default router;
