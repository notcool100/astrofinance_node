import { body, param, query } from "express-validator";

/**
 * Validation schema for creating user
 */
export const createUserValidation = [
	body("fullName")
		.notEmpty()
		.withMessage("Full name is required")
		.isLength({ min: 3, max: 100 })
		.withMessage("Full name must be between 3 and 100 characters"),

	body("email")
		.optional()
		.isEmail()
		.withMessage("Invalid email format")
		.normalizeEmail(),

	body("contactNumber")
		.notEmpty()
		.withMessage("Contact number is required")
		.matches(/^\+?[0-9]{10,15}$/)
		.withMessage("Contact number must be a valid phone number"),

	body("address")
		.optional()
		.isLength({ max: 200 })
		.withMessage("Address cannot exceed 200 characters"),

	body("identificationNumber")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Identification number cannot exceed 50 characters"),

	body("identificationType")
		.optional()
		.isIn(["NATIONAL_ID", "PASSPORT", "DRIVING_LICENSE", "OTHER"])
		.withMessage("Invalid identification type"),

	body("dateOfBirth")
		.optional()
		.isISO8601()
		.withMessage("Date of birth must be a valid date")
		.custom((value) => {
			if (!value) return true; // Skip validation if not provided

			const dob = new Date(value);
			const now = new Date();

			// More accurate age calculation that accounts for month and day
			let age = now.getFullYear() - dob.getFullYear();
			const monthDiff = now.getMonth() - dob.getMonth();

			if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
				age--;
			}

			if (age < 0) {
				throw new Error("Date of birth cannot be in the future");
			}

			return true;
		}),

	body("gender")
		.optional()
		.isIn(["MALE", "FEMALE", "OTHER"])
		.withMessage("Invalid gender"),

	body("occupation")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Occupation cannot exceed 100 characters"),

	body("employerName")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Employer name cannot exceed 100 characters"),

	body("monthlyIncome")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Monthly income must be a positive number"),

	body("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive must be a boolean"),
];

/**
 * Validation schema for updating user
 */
export const updateUserValidation = [
	param("id")
		.notEmpty()
		.withMessage("User ID is required")
		.isUUID()
		.withMessage("User ID must be a valid UUID"),

	body("fullName")
		.optional()
		.isLength({ min: 3, max: 100 })
		.withMessage("Full name must be between 3 and 100 characters"),

	body("email")
		.optional()
		.isEmail()
		.withMessage("Invalid email format")
		.normalizeEmail(),

	body("contactNumber")
		.optional()
		.matches(/^\+?[0-9]{10,15}$/)
		.withMessage("Contact number must be a valid phone number"),

	body("address")
		.optional()
		.isLength({ max: 200 })
		.withMessage("Address cannot exceed 200 characters"),

	body("identificationNumber")
		.optional()
		.isLength({ max: 50 })
		.withMessage("Identification number cannot exceed 50 characters"),

	body("identificationType")
		.optional()
		.isIn(["NATIONAL_ID", "PASSPORT", "DRIVING_LICENSE", "OTHER"])
		.withMessage("Invalid identification type"),

	body("dateOfBirth")
		.optional()
		.isISO8601()
		.withMessage("Date of birth must be a valid date")
		.custom((value) => {
			if (!value) return true; // Skip validation if not provided

			const dob = new Date(value);
			const now = new Date();

			// More accurate age calculation that accounts for month and day
			let age = now.getFullYear() - dob.getFullYear();
			const monthDiff = now.getMonth() - dob.getMonth();

			if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
				age--;
			}

			if (age < 0) {
				throw new Error("Date of birth cannot be in the future");
			}

			return true;
		}),

	body("gender")
		.optional()
		.isIn(["MALE", "FEMALE", "OTHER"])
		.withMessage("Invalid gender"),

	body("occupation")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Occupation cannot exceed 100 characters"),

	body("employerName")
		.optional()
		.isLength({ max: 100 })
		.withMessage("Employer name cannot exceed 100 characters"),

	body("monthlyIncome")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Monthly income must be a positive number"),

	body("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive must be a boolean"),
];

/**
 * Validation schema for resetting user password
 */
export const resetUserPasswordValidation = [
	param("id")
		.notEmpty()
		.withMessage("User ID is required")
		.isUUID()
		.withMessage("User ID must be a valid UUID"),

	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 8 })
		.withMessage("New password must be at least 8 characters long")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
		.withMessage(
			"New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
		),
];

/**
 * Validation schema for getting users
 */
export const getUsersValidation = [
	query("search")
		.optional()
		.isLength({ min: 2 })
		.withMessage("Search term must be at least 2 characters"),

	query("status")
		.optional()
		.custom((value) => {
			// Accept 'active', 'inactive', 'true', 'false', true, false
			const validValues = ["active", "inactive", "true", "false", true, false];
			return (
				validValues.includes(value) ||
				validValues.includes(String(value).toLowerCase())
			);
		})
		.withMessage("Status must be either active, inactive, true, or false"),

	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation schema for getting user loans
 */
export const getUserLoansValidation = [
	param("id")
		.notEmpty()
		.withMessage("User ID is required")
		.isUUID()
		.withMessage("User ID must be a valid UUID"),

	query("status")
		.optional()
		.isIn(["ACTIVE", "CLOSED", "DEFAULTED", "WRITTEN_OFF"])
		.withMessage("Invalid status"),

	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation schema for getting user loan applications
 */
export const getUserLoanApplicationsValidation = [
	param("id")
		.notEmpty()
		.withMessage("User ID is required")
		.isUUID()
		.withMessage("User ID must be a valid UUID"),

	query("status")
		.optional()
		.isIn(["PENDING", "APPROVED", "REJECTED", "DISBURSED"])
		.withMessage("Invalid status"),

	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];
