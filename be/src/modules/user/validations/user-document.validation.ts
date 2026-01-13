import { body, param } from "express-validator";

export const uploadUserDocumentValidation = [
    param("userId").isUUID().withMessage("Invalid user ID"),
    body("documentType")
        .isIn(["NATIONAL_ID", "PASSPORT", "DRIVING_LICENSE", "OTHER"])
        .withMessage(
            "Invalid document type. Must be one of: NATIONAL_ID, PASSPORT, DRIVING_LICENSE, OTHER",
        ),
];

export const uploadMultipleDocumentsValidation = [
    param("userId").isUUID().withMessage("Invalid user ID"),
];

export const deleteDocumentValidation = [
    param("documentId").isUUID().withMessage("Invalid document ID"),
];
