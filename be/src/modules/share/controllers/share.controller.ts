import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import logger from "../../../config/logger";

const prisma = new PrismaClient();

// Get All Share Accounts
export const getAllShareAccounts = async (req: Request, res: Response) => {
    try {
        const shareAccounts = await prisma.shareAccount.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        contactNumber: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json({
            success: true,
            data: shareAccounts,
        });
    } catch (error) {
        logger.error(`Error getting all share accounts: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to get share accounts",
        });
    }
};

// Get Share Account by User ID
export const getShareAccount = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const shareAccount = await prisma.shareAccount.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { transactionDate: "desc" },
                    take: 10,
                },
                certificates: {
                    orderBy: { issuedDate: "desc" },
                },
            },
        });

        if (!shareAccount) {
            return res.status(404).json({
                success: false,
                message: "Share account not found for this user",
            });
        }

        res.status(200).json({
            success: true,
            data: shareAccount,
        });
    } catch (error) {
        logger.error(`Error getting share account: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to get share account details",
        });
    }
};

// Issue Shares
export const issueShares = async (req: Request, res: Response) => {
    try {
        const { userId, shareCount, amount, sharePrice, description } = req.body;
        const adminId = req.user?.id;

        // 1. Get or Create Share Account
        let shareAccount = await prisma.shareAccount.findUnique({
            where: { userId },
        });

        if (!shareAccount) {
            shareAccount = await prisma.shareAccount.create({
                data: { userId },
            });
        }

        // 2. Create Certificate
        // Generate a simple certificate number (e.g., SC-TIMESTAMP-RANDOM)
        const certNum = `SC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const certificate = await prisma.shareCertificate.create({
            data: {
                certificateNumber: certNum,
                shareAccountId: shareAccount.id,
                shareCount: Number(shareCount),
                amount: Number(amount),
                issuedById: adminId,
                status: "GENERATED",
            },
        });

        // 3. Create Transaction
        const transaction = await prisma.shareTransaction.create({
            data: {
                shareAccountId: shareAccount.id,
                transactionType: "PURCHASE",
                shareCount: Number(shareCount),
                amount: Number(amount),
                sharePrice: Number(sharePrice) || 100,
                description: description || "Initial Share Issuance",
                certificateId: certificate.id,
                createdById: adminId,
            },
        });

        // 4. Update Account Balance
        const updatedAccount = await prisma.shareAccount.update({
            where: { id: shareAccount.id },
            data: {
                shareCount: { increment: Number(shareCount) },
                totalAmount: { increment: Number(amount) },
            },
        });

        res.status(201).json({
            success: true,
            message: "Shares issued successfully",
            data: {
                account: updatedAccount,
                certificate,
                transaction,
            },
        });
    } catch (error) {
        logger.error(`Error issuing shares: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to issue shares",
        });
    }
};

// Return Shares
export const returnShares = async (req: Request, res: Response) => {
    try {
        const { userId, shareCount, amount, description } = req.body;
        const adminId = req.user?.id;

        const shareAccount = await prisma.shareAccount.findUnique({
            where: { userId },
        });

        if (!shareAccount) {
            return res.status(404).json({
                success: false,
                message: "Share account not found",
            });
        }

        if (shareAccount.shareCount < shareCount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient shares to return",
            });
        }

        // Create Transaction
        await prisma.shareTransaction.create({
            data: {
                shareAccountId: shareAccount.id,
                transactionType: "RETURN",
                shareCount: -Number(shareCount),
                amount: -Number(amount),
                sharePrice: 100, // Assuming standard price or retrieve from config
                description: description || "Share Return",
                createdById: adminId,
            },
        });

        // Update Account
        const updatedAccount = await prisma.shareAccount.update({
            where: { id: shareAccount.id },
            data: {
                shareCount: { decrement: Number(shareCount) },
                totalAmount: { decrement: Number(amount) },
            },
        });

        res.status(200).json({
            success: true,
            message: "Shares returned successfully",
            data: updatedAccount,
        });
    } catch (error) {
        logger.error(`Error returning shares: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to return shares",
        });
    }
};
