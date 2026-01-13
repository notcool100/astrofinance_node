import fs from "fs";
import path from "path";
import logger from "../../config/logger";

/**
 * Create user-specific directory for document uploads
 * @param userId - User ID
 * @param category - Document category: 'profile' or 'loan'
 * @returns Created directory path
 */
export const createUserDirectory = (
    userId: string,
    category: "profile" | "loan",
): string => {
    const baseUploadDir = path.join(__dirname, "../../../uploads");
    const userDir = path.join(baseUploadDir, userId);
    const categoryDir = path.join(userDir, category);

    try {
        // Create base uploads directory if it doesn't exist
        if (!fs.existsSync(baseUploadDir)) {
            fs.mkdirSync(baseUploadDir, { recursive: true });
        }

        // Create user directory if it doesn't exist
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Create category directory if it doesn't exist
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        logger.info(`Created directory: ${categoryDir}`);
        return categoryDir;
    } catch (error) {
        logger.error(`Error creating user directory: ${error}`);
        throw new Error(`Failed to create user directory: ${error}`);
    }
};

/**
 * Delete a user document from the file system
 * @param filePath - Relative path to the file from uploads directory
 * @returns Success status
 */
export const deleteUserDocument = async (filePath: string): Promise<boolean> => {
    try {
        const baseUploadDir = path.join(__dirname, "../../../uploads");
        const absolutePath = path.join(baseUploadDir, filePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            logger.info(`Deleted file: ${absolutePath}`);
            return true;
        } else {
            logger.warn(`File not found for deletion: ${absolutePath}`);
            return false;
        }
    } catch (error) {
        logger.error(`Error deleting user document: ${error}`);
        throw new Error(`Failed to delete user document: ${error}`);
    }
};

/**
 * Get the relative path for a user document
 * @param userId - User ID
 * @param category - Document category: 'profile' or 'loan'
 * @param filename - File name
 * @returns Relative path from uploads directory
 */
export const getUserDocumentPath = (
    userId: string,
    category: "profile" | "loan",
    filename: string,
): string => {
    return path.join(userId, category, filename);
};

/**
 * Get the full URL for a user document
 * @param filePath - Relative path from uploads directory
 * @returns Full URL to access the file
 */
export const getUserDocumentUrl = (filePath: string): string => {
    return `/uploads/${filePath.replace(/\\/g, "/")}`;
};

/**
 * Check if file exists
 * @param filePath - Relative path from uploads directory
 * @returns True if file exists
 */
export const fileExists = (filePath: string): boolean => {
    const baseUploadDir = path.join(__dirname, "../../../uploads");
    const absolutePath = path.join(baseUploadDir, filePath);
    return fs.existsSync(absolutePath);
};
