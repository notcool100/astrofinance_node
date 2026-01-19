import { Router, type Router as ExpressRouter } from "express";
import {
    getAllAccountTypes,
    getAccountTypeById,
    createAccountType,
    updateAccountType,
    deleteAccountType,
} from "../controllers/account-type.controller";
import {
    createAccountTypeValidation,
    updateAccountTypeValidation,
    getAccountTypeByIdValidation,
} from "../validations/account-type.validation";
import { validate } from "../../../common/middleware/validation.middleware";

const router: ExpressRouter = Router();

/**
 * @route GET /api/user/account-types
 * @desc Get all account types
 * @access Private
 */
router.get("/", getAllAccountTypes);

/**
 * @route GET /api/user/account-types/:id
 * @desc Get account type by ID
 * @access Private
 */
router.get(
    "/:id",
    validate(getAccountTypeByIdValidation),
    getAccountTypeById,
);

/**
 * @route POST /api/user/account-types
 * @desc Create new account type
 * @access Private (Admin only)
 */
router.post(
    "/",
    validate(createAccountTypeValidation),
    createAccountType,
);

/**
 * @route PUT /api/user/account-types/:id
 * @desc Update account type
 * @access Private (Admin only)
 */
router.put(
    "/:id",
    validate(updateAccountTypeValidation),
    updateAccountType,
);

/**
 * @route DELETE /api/user/account-types/:id
 * @desc Delete account type (soft delete)
 * @access Private (Admin only)
 */
router.delete(
    "/:id",
    validate(getAccountTypeByIdValidation),
    deleteAccountType,
);

export default router;
