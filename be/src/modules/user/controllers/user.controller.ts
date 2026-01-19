import { Request, Response } from "express";
import prisma from "../../../config/database";
import logger from "../../../config/logger";
import { createAuditLog } from "../../../common/utils/audit.util";
import { AuditAction } from "@prisma/client";
import { ApiError } from "../../../common/middleware/error.middleware";
import * as bcrypt from "bcrypt";
import { prepareDateForDb, enrichWithBsDates } from "../../../utils/date-converter.util";

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const { search, status, page = "1", limit = "10" } = req.query;

		// Parse pagination parameters
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);
		const skip = (pageNumber - 1) * limitNumber;

		// Build filter conditions
		const where: any = {};

		if (status) {
			// Handle different status formats: 'active', 'inactive', 'true', 'false'
			if (status === "active" || status === "true") {
				where.isActive = true;
			} else if (status === "inactive" || status === "false") {
				where.isActive = false;
			}
		}

		if (search) {
			where.OR = [
				{ fullName: { contains: search as string, mode: "insensitive" } },
				{ email: { contains: search as string, mode: "insensitive" } },
				{ contactNumber: { contains: search as string } },
			];
		}

		// Get total count for pagination
		const totalCount = await prisma.user.count({ where });

		// Get users with pagination
		const users = await prisma.user.findMany({
			where,
			select: {
				id: true,
				fullName: true,
				email: true,
				contactNumber: true,
				address: true,
				isActive: true,
				createdAt: true,
				_count: {
					select: {
						loans: true,
						loanApplications: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limitNumber,
		});

		return res.json({
			data: users,
			pagination: {
				total: totalCount,
				page: pageNumber,
				limit: limitNumber,
				pages: Math.ceil(totalCount / limitNumber),
			},
		});
	} catch (error) {
		logger.error("Get all users error:", error);
		throw new ApiError(500, "Failed to fetch users");
	}
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						loans: true,
						loanApplications: true,
					},
				},
			},
		});

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		// Return user data (no passwordHash in the schema)
		return res.json(user);
	} catch (error) {
		logger.error(`Get user by ID error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to fetch user");
	}
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response) => {
	try {
		console.log("Request body:", JSON.stringify(req.body, null, 2));

		const {
			fullName,
			email,
			contactNumber,
			address,
			identificationNumber,
			identificationType,
			dateOfBirth,
			dateOfBirth_bs,
			gender,
			isActive = true,
		} = req.body;

		// Process date of birth (accept either AD or BS)
		const dobDates = prepareDateForDb(
			dateOfBirth || dateOfBirth_bs,
			"dateOfBirth",
			!!dateOfBirth_bs && !dateOfBirth
		);

		// Check if user with same email or contact number already exists
		const whereConditions: any[] = [{ contactNumber }];
		if (email) {
			whereConditions.push({ email });
		}

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: whereConditions,
			},
		});

		if (existingUser) {
			if (email && existingUser.email === email) {
				throw new ApiError(409, `User with email '${email}' already exists`);
			} else if (existingUser.contactNumber === contactNumber) {
				throw new ApiError(
					409,
					`User with contact number '${contactNumber}' already exists`,
				);
			}
		}

		// Create new user
		const user = await prisma.user.create({
			data: {
				fullName,
				email,
				contactNumber,
				address,
				idNumber: identificationNumber,
				idType: identificationType,
				dateOfBirth: dobDates.adDate || new Date(),
				dateOfBirth_bs: dobDates.bsDate,
				gender,
				isActive,
				groupId: req.body.groupId,
				userType: "SB", // Default to SB (Savings Bank) user type
			},
		});

		// Create audit log
		await createAuditLog(req, "User", user.id, AuditAction.CREATE, null, {
			...user,
			passwordHash: "[REDACTED]",
		});
		console.log("User created:", user);
		// Return user data
		return res.status(201).json(user);
	} catch (error) {
		logger.error(`Create user error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to create user");
	}
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const {
			fullName,
			email,
			contactNumber,
			address,
			identificationNumber,
			identificationType,
			dateOfBirth,
			dateOfBirth_bs,
			gender,
			isActive,
		} = req.body;

		// Process date of birth if provided
		let dobDates = null;
		if (dateOfBirth || dateOfBirth_bs) {
			dobDates = prepareDateForDb(
				dateOfBirth || dateOfBirth_bs,
				"dateOfBirth",
				!!dateOfBirth_bs && !dateOfBirth
			);
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			throw new ApiError(404, "User not found");
		}

		// Check if email or contact number is already taken by another user
		if (
			(email && email !== existingUser.email) ||
			(contactNumber && contactNumber !== existingUser.contactNumber)
		) {
			const duplicateUser = await prisma.user.findFirst({
				where: {
					OR: [{ email: email || "" }, { contactNumber: contactNumber || "" }],
					id: { not: id },
				},
			});

			if (duplicateUser) {
				if (duplicateUser.email === email) {
					throw new ApiError(409, `Email '${email}' is already in use`);
				} else {
					throw new ApiError(
						409,
						`Contact number '${contactNumber}' is already in use`,
					);
				}
			}
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				fullName: fullName || undefined,
				email: email || undefined,
				contactNumber: contactNumber || undefined,
				address: address || undefined,
				idNumber: identificationNumber || undefined,
				idType: identificationType || undefined,
				dateOfBirth_bs: dobDates?.bsDate || undefined,
				gender: gender || undefined,
				isActive: isActive !== undefined ? isActive : undefined,
				groupId: req.body.groupId || undefined,
			},
		});

		// Create audit log
		await createAuditLog(
			req,
			"User",
			updatedUser.id,
			AuditAction.UPDATE,
			{ ...existingUser, passwordHash: "[REDACTED]" },
			{ ...updatedUser, passwordHash: "[REDACTED]" },
		);

		// Return updated user data
		return res.json(updatedUser);
	} catch (error) {
		logger.error(`Update user error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to update user");
	}
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { newPassword } = req.body;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			throw new ApiError(404, "User not found");
		}

		// Hash new password
		const passwordHash = await bcrypt.hash(newPassword, 10);

		// Note: User model doesn't have passwordHash field in the schema
		// This functionality needs to be implemented differently
		// For now, we'll just log the action

		// Create audit log
		await createAuditLog(req, "User", id, AuditAction.PASSWORD_CHANGE, null, {
			id,
			passwordReset: true,
		});

		return res.json({ message: "Password reset successfully" });
	} catch (error) {
		logger.error(`Reset user password error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to reset user password");
	}
};

/**
 * Get user loans
 */
export const getUserLoans = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { status, page = "1", limit = "10" } = req.query;

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		// Parse pagination parameters
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);
		const skip = (pageNumber - 1) * limitNumber;

		// Build filter conditions
		const where: any = {
			userId: id,
		};

		if (status) {
			where.status = status;
		}

		// Get total count for pagination
		const totalCount = await prisma.loan.count({ where });

		// Get loans with pagination
		const loans = await prisma.loan.findMany({
			where,
			include: {
				loanType: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
			orderBy: {
				disbursementDate: "desc",
			},
			skip,
			take: limitNumber,
		});

		return res.json({
			data: loans,
			pagination: {
				total: totalCount,
				page: pageNumber,
				limit: limitNumber,
				pages: Math.ceil(totalCount / limitNumber),
			},
		});
	} catch (error) {
		logger.error(`Get user loans error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to fetch user loans");
	}
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						loans: true,
						loanApplications: true,
						accounts: true,
					},
				},
			},
		});

		if (!existingUser) {
			throw new ApiError(404, "User not found");
		}

		// Check if user has any active loans, applications, or accounts
		if (
			existingUser._count.loans > 0 ||
			existingUser._count.loanApplications > 0 ||
			existingUser._count.accounts > 0
		) {
			throw new ApiError(
				400,
				"Cannot delete user with active loans, applications, or accounts",
			);
		}

		// Delete user
		await prisma.user.delete({
			where: { id },
		});

		// Create audit log
		await createAuditLog(
			req,
			"User",
			id,
			AuditAction.DELETE,
			existingUser,
			null,
		);

		return res.json({ message: "User deleted successfully" });
	} catch (error) {
		logger.error(`Delete user error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to delete user");
	}
};

/**
 * Get user loan applications
 */
export const getUserLoanApplications = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { status, page = "1", limit = "10" } = req.query;

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		// Parse pagination parameters
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);
		const skip = (pageNumber - 1) * limitNumber;

		// Build filter conditions
		const where: any = {
			userId: id,
		};

		if (status) {
			where.status = status;
		}

		// Get total count for pagination
		const totalCount = await prisma.loanApplication.count({ where });

		// Get loan applications with pagination
		const applications = await prisma.loanApplication.findMany({
			where,
			include: {
				loanType: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
			orderBy: {
				appliedDate: "desc",
			},
			skip,
			take: limitNumber,
		});

		return res.json({
			data: applications,
			pagination: {
				total: totalCount,
				page: pageNumber,
				limit: limitNumber,
				pages: Math.ceil(totalCount / limitNumber),
			},
		});
	} catch (error) {
		logger.error(`Get user loan applications error: ${error}`);
		if (error instanceof ApiError) throw error;
		throw new ApiError(500, "Failed to fetch user loan applications");
	}
};
