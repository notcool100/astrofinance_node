import { body, param } from "express-validator";

/**
 * Validation schema for creating an account type
 */
export const createAccountTypeValidation = [
    body("code")
        .notEmpty()
        .withMessage("Account type code is required")
        .isString()
        .withMessage("Code must be a string")
        .matches(/^[A-Z_]+$/)
        .withMessage("Code must be uppercase letters and underscores only")
        .isLength({ min: 2, max: 10 })
        .withMessage("Code must be between 2 and 10 characters"),

    body("name")
        .notEmpty()
        .withMessage("Account type name is required")
        .isString()
        .withMessage("Name must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];

/**
 * Validation schema for updating an account type
 */
export const updateAccountTypeValidation = [
    param("id")
        .notEmpty()
        .withMessage("Account type ID is required")
        .isUUID()
        .withMessage("Account type ID must be a valid UUID"),

    body("name")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a string")
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];

/**
 * Validation schema for getting account type by ID
 */
export const getAccountTypeByIdValidation = [
    param("id")
        .notEmpty()
        .withMessage("Account type ID is required")
        .isUUID()
        .withMessage("Account type ID must be a valid UUID"),
];
