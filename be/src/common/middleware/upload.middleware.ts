import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

// Create upload directories if they don't exist
const createDirectories = () => {
	const baseDir = path.join(__dirname, "../../../uploads");
	const loansDir = path.join(baseDir, "loans");
	const documentsDir = path.join(loansDir, "documents");

	if (!fs.existsSync(baseDir)) {
		fs.mkdirSync(baseDir, { recursive: true });
	}

	if (!fs.existsSync(loansDir)) {
		fs.mkdirSync(loansDir, { recursive: true });
	}

	if (!fs.existsSync(documentsDir)) {
		fs.mkdirSync(documentsDir, { recursive: true });
	}
};

// Create directories on startup
try {
	createDirectories();
} catch (error) {
	console.error("Error creating upload directories:", error);
}

// Configure storage
const storage = multer.diskStorage({
	destination: (req: Request, file: Express.Multer.File, cb) => {
		// Determine destination based on file type or route
		let uploadPath = path.join(__dirname, "../../../uploads");

		// Check for user document uploads - extract userId from URL path
		// Path format: /api/user/users/:userId/documents or /:userId/documents/multiple
		if (req.path.includes("/documents")) {
			// Extract userId from the URL path
			const pathParts = req.path.split("/");
			const documentsIndex = pathParts.findIndex((part) => part === "documents");

			if (documentsIndex > 0) {
				// The userId should be the part before "documents"
				const userId = pathParts[documentsIndex - 1];

				// Validate that it looks like a UUID
				const uuidRegex =
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
				if (uuidRegex.test(userId)) {
					// Default to profile category for user documents
					const category = "profile";
					const userCategoryPath = path.join(userId, category);
					uploadPath = path.join(uploadPath, userCategoryPath);

					// Create directory if it doesn't exist
					if (!fs.existsSync(uploadPath)) {
						fs.mkdirSync(uploadPath, { recursive: true });
						console.log(`Created upload directory: ${uploadPath}`);
					}
				}
			}
		}
		// Check for loan document uploads
		else if (req.path.includes("/loan/") && req.path.includes("/documents/")) {
			uploadPath = path.join(uploadPath, "loans/documents");
			if (!fs.existsSync(uploadPath)) {
				fs.mkdirSync(uploadPath, { recursive: true });
			}
		}

		cb(null, uploadPath);
	},
	filename: (req: Request, file: Express.Multer.File, cb) => {
		// Generate unique filename
		const uniqueId = uuidv4();
		const fileExt = path.extname(file.originalname);
		// Try to get documentType from query or default to "document"
		const documentType = "document";
		const timestamp = Date.now();
		const fileName = `${documentType}_${timestamp}_${uniqueId}${fileExt}`;
		cb(null, fileName);
	},
});

// File filter
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	// Allow only certain file types
	const allowedFileTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/jpg",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];

	if (allowedFileTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Invalid file type. Only PDF, JPEG, PNG, and DOC/DOCX files are allowed.",
			),
		);
	}
};

// Configure multer
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
		files: 10, // Max 10 files
	},
});

// Export function to get file URL
export const getFileUrl = (
	filename: string,
	type: "document" | "profile" = "document",
): string => {
	let basePath = "/uploads";

	if (type === "document") {
		basePath = `${basePath}/loans/documents`;
	} else if (type === "profile") {
		basePath = `${basePath}/profiles`;
	}

	return `${basePath}/${filename}`;
};
