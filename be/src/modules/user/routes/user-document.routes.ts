import { Router, Request, Response, NextFunction, type Router as ExpressRouter } from "express";
import { upload } from "../../../common/middleware/upload.middleware";
import { validate } from "../../../common/middleware/validation.middleware";
import {
	uploadUserDocument,
	uploadMultipleUserDocuments,
	getUserDocuments,
	deleteUserDocument,
} from "../controllers/user-document.controller";
import {
	uploadUserDocumentValidation,
	uploadMultipleDocumentsValidation,
	deleteDocumentValidation,
} from "../validations/user-document.validation";

const router: ExpressRouter = Router();

/**
 * @route   POST /api/user/users/:userId/documents
 * @desc    Upload a single user document
 * @access  Private
 */
router.post(
	"/:userId/documents",
	upload.single("document"),
	validate(uploadUserDocumentValidation),
	uploadUserDocument,
);

/**
 * @route   POST /api/user/users/:userId/documents/multiple
 * @desc    Upload multiple user documents
 * @access  Private
 */
router.post(
	"/:userId/documents/multiple",
	(req: Request, res: Response, next: NextFunction) => {
		console.log("[DOC ROUTE] Before multer");
		next();
	},
	upload.array("documents", 10), // Max 10 files
	(req: Request, res: Response, next: NextFunction) => {
		console.log("[DOC ROUTE] After multer, before validation");
		next();
	},
	validate(uploadMultipleDocumentsValidation),
	(req: Request, res: Response, next: NextFunction) => {
		console.log("[DOC ROUTE] After validation, before controller");
		next();
	},
	uploadMultipleUserDocuments,
);

/**
 * @route   GET /api/user/users/:userId/documents
 * @desc    Get all documents for a user
 * @access  Private
 */
router.get("/:userId/documents", getUserDocuments);

/**
 * @route   DELETE /api/user/documents/:documentId
 * @desc    Delete a user document
 * @access  Private
 */
router.delete(
	"/documents/:documentId",
	validate(deleteDocumentValidation),
	deleteUserDocument,
);

export default router;
