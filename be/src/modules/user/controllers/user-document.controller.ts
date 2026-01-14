import { Request, Response } from "express";
import prisma from "../../../config/database";
import logger from "../../../config/logger";
import { ApiError } from "../../../common/middleware/error.middleware";
import {
    deleteUserDocument as deleteUserDocumentFile,
    getUserDocumentPath,
    getUserDocumentUrl,
} from "../../../common/utils/file-upload.util";

/**
 * Upload a single user document
 */
export const uploadUserDocument = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { documentType } = req.body;
        const file = req.file;

        if (!file) {
            throw new ApiError(400, "No file uploaded");
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Get relative path from uploads folder
        const category = req.body.category || "profile";
        const filePath = getUserDocumentPath(userId, category, file.filename);
        const fileUrl = getUserDocumentUrl(filePath);

        // Save document metadata to database
        const userDocument = await prisma.userDocument.create({
            data: {
                userId,
                documentType,
                fileName: file.originalname,
                filePath,
                fileUrl,
            },
        });

        logger.info(`Document uploaded for user ${userId}: ${file.filename}`);

        return res.status(201).json({
            message: "Document uploaded successfully",
            document: userDocument,
        });
    } catch (error) {
        logger.error(`Upload user document error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to upload document");
    }
};

/**
 * Upload multiple user documents
 */
export const uploadMultipleUserDocuments = async (
    req: Request,
    res: Response,
) => {
    try {
        const { userId } = req.params;
        const files = req.files as Express.Multer.File[];

        console.log("=== Upload Multiple Documents Debug ===");
        console.log("userId:", userId);
        console.log("files:", files);
        console.log("req.body:", req.body);

        if (!files || files.length === 0) {
            throw new ApiError(400, "No files uploaded");
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Parse document types from body (sent as array)
        const documentTypes = Array.isArray(req.body.documentTypes)
            ? req.body.documentTypes
            : [req.body.documentTypes];

        console.log("Parsed documentTypes:", documentTypes);

        const category = req.body.category || "profile";
        const uploadedDocuments = [];

        // Create document records for each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const documentType = documentTypes[i] || "OTHER";

            const filePath = getUserDocumentPath(userId, category, file.filename);
            const fileUrl = getUserDocumentUrl(filePath);

            console.log(`Creating document record ${i + 1}:`, {
                userId,
                documentType,
                fileName: file.originalname,
                filePath,
                fileUrl,
            });

            const userDocument = await prisma.userDocument.create({
                data: {
                    userId,
                    documentType,
                    fileName: file.originalname,
                    filePath,
                    fileUrl,
                },
            });

            console.log("Created document:", userDocument);
            uploadedDocuments.push(userDocument);
        }

        logger.info(
            `${uploadedDocuments.length} documents uploaded for user ${userId}`,
        );

        return res.status(201).json({
            message: "Documents uploaded successfully",
            documents: uploadedDocuments,
        });
    } catch (error) {
        console.error("Upload multiple user documents error:", error);
        logger.error(`Upload multiple user documents error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to upload documents");
    }
};

/**
 * Get all documents for a user
 */
export const getUserDocuments = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const documents = await prisma.userDocument.findMany({
            where: { userId },
            orderBy: { uploadDate: "desc" },
        });

        return res.json({
            documents,
        });
    } catch (error) {
        logger.error(`Get user documents error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to fetch user documents");
    }
};

/**
 * Delete a user document
 */
export const deleteUserDocument = async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params;

        // Find the document
        const document = await prisma.userDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            throw new ApiError(404, "Document not found");
        }

        // Delete file from file system
        await deleteUserDocumentFile(document.filePath);

        // Delete document record from database
        await prisma.userDocument.delete({
            where: { id: documentId },
        });

        logger.info(`Document deleted: ${documentId}`);

        return res.json({
            message: "Document deleted successfully",
        });
    } catch (error) {
        logger.error(`Delete user document error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to delete document");
    }
};
