import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../../../common/middleware/error.middleware";
import logger from "../../../config/logger";

const prisma = new PrismaClient();

/**
 * Get all account types
 */
export const getAllAccountTypes = async (req: Request, res: Response) => {
    try {
        const { includeInactive } = req.query;

        const where: any = {};

        // By default, only return active account types
        if (includeInactive !== "true") {
            where.isActive = true;
        }

        const accountTypes = await prisma.accountTypeConfig.findMany({
            where,
            orderBy: { code: "asc" },
        });

        return res.status(200).json(accountTypes);
    } catch (error) {
        logger.error(`Get all account types error: ${error}`);
        throw new ApiError(500, "Failed to fetch account types");
    }
};

/**
 * Get account type by ID
 */
export const getAccountTypeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const accountType = await prisma.accountTypeConfig.findUnique({
            where: { id },
        });

        if (!accountType) {
            throw new ApiError(404, `Account type with ID ${id} not found`);
        }

        return res.status(200).json(accountType);
    } catch (error) {
        logger.error(`Get account type by ID error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to fetch account type");
    }
};

/**
 * Create new account type
 */
export const createAccountType = async (req: Request, res: Response) => {
    try {
        const { code, name, description, isActive = true } = req.body;

        // Check if code already exists
        const existing = await prisma.accountTypeConfig.findUnique({
            where: { code },
        });

        if (existing) {
            throw new ApiError(400, `Account type with code "${code}" already exists`);
        }

        const accountType = await prisma.accountTypeConfig.create({
            data: {
                code,
                name,
                description,
                isActive,
            },
        });

        logger.info(`Created account type: ${accountType.name} (${accountType.code})`);
        return res.status(201).json(accountType);
    } catch (error) {
        logger.error(`Create account type error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to create account type");
    }
};

/**
 * Update account type
 */
export const updateAccountType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        // Check if account type exists
        const existing = await prisma.accountTypeConfig.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new ApiError(404, `Account type with ID ${id} not found`);
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const accountType = await prisma.accountTypeConfig.update({
            where: { id },
            data: updateData,
        });

        logger.info(`Updated account type: ${accountType.name} (${accountType.code})`);
        return res.status(200).json(accountType);
    } catch (error) {
        logger.error(`Update account type error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to update account type");
    }
};

/**
 * Delete account type (soft delete)
 */
export const deleteAccountType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if account type exists
        const existing = await prisma.accountTypeConfig.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new ApiError(404, `Account type with ID ${id} not found`);
        }

        // Check if any accounts are using this type
        const accountsCount = await prisma.userAccount.count({
            where: { accountType: existing.code as any },
        });

        if (accountsCount > 0) {
            throw new ApiError(
                400,
                `Cannot delete account type "${existing.code}" because ${accountsCount} account(s) are using it. Please deactivate it instead.`,
            );
        }

        // Soft delete by setting isActive to false
        const accountType = await prisma.accountTypeConfig.update({
            where: { id },
            data: { isActive: false },
        });

        logger.info(`Deleted account type: ${accountType.name} (${accountType.code})`);
        return res.status(200).json(accountType);
    } catch (error) {
        logger.error(`Delete account type error: ${error}`);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Failed to delete account type");
    }
};
