import { Router, type Router as ExpressRouter } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserLoanApplications,
  getUserLoans,
  resetUserPassword,
  updateUser,
} from "../controllers/user.controller";
import userDocumentRoutes from "./user-document.routes";
import {
  authenticate,
  hasPermission,
} from "../../../common/middleware/auth.middleware";
import { validate } from "../../../common/middleware/validation.middleware";
import {
  getUsersValidation,
  getUserLoansValidation,
  getUserLoanApplicationsValidation,
  createUserValidation,
  updateUserValidation,
  resetUserPasswordValidation,
} from "../validations/user.validation.updated";

const router: ExpressRouter = Router();

// Log all requests to this router
router.use((req, res, next) => {
  console.log(`[USER ROUTES] ${req.method} ${req.path}`);
  next();
});

// All routes require authentication
router.use(authenticate);

// Register document routes (they already have /:userId/documents in their definition)
router.use(userDocumentRoutes);

// Get all users
router.get("/", hasPermission("users.view"), validate(getUsersValidation), getAllUsers);

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

// Delete user
router.delete("/:id", hasPermission("users.delete"), deleteUser);

export default router;