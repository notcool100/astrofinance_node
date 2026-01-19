import { Router, type Router as ExpressRouter } from "express";
import {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	resetUserPassword,
	getUserLoans,
	getUserLoanApplications,
	deleteUser,
} from "../controllers/user.controller";
import { getUserAccounts } from "../controllers/account.controller";
import {
	authenticate,
	hasPermission,
} from "../../../common/middleware/auth.middleware";
import { validate } from "../../../common/middleware/validation.middleware";
import {
	createUserValidation,
	updateUserValidation,
	resetUserPasswordValidation,
	getUsersValidation,
	getUserLoansValidation,
	getUserLoanApplicationsValidation,
} from "../validations/user.validation.fixed";
import { getUserAccountsValidation } from "../validations/account.validation";

const router: ExpressRouter = Router();

// Enable authentication for admin operations
router.use(authenticate);

// Get all users
router.get(
	"/",
	hasPermission("users.view"),
	validate(getUsersValidation),
	getAllUsers,
);

// Get user by ID
router.get("/:id", hasPermission("users.view"), getUserById);

// Create new user
router.post(
	"/",
	hasPermission("users.create"),
	validate(createUserValidation),
	createUser,
);

// Update user
router.put(
	"/:id",
	hasPermission("users.edit"),
	validate(updateUserValidation),
	updateUser,
);

// Reset user password
router.post(
	"/:id/reset-password",
	hasPermission("users.edit"),
	validate(resetUserPasswordValidation),
	resetUserPassword,
);

// Get user loans
router.get(
	"/:id/loans",
	hasPermission("users.view"),
	validate(getUserLoansValidation),
	getUserLoans,
);

// Get user loan applications
router.get(
	"/:id/loan-applications",
	hasPermission("users.view"),
	validate(getUserLoanApplicationsValidation),
	getUserLoanApplications,
);

// Get user accounts
router.get(
	"/:userId/accounts",
	hasPermission("users.view"),
	validate(getUserAccountsValidation),
	getUserAccounts,
);

// Delete user
router.delete("/:id", hasPermission("users.delete"), deleteUser);

export default router;
