import prisma from '../../../../config/database';
import { FiscalYear } from '@prisma/client';

export class FiscalYearService {
    /**
     * Create a new fiscal year
     */
    async createFiscalYear(data: {
        name: string;
        startDateBS: string;
        endDateBS: string;
        startDateAD: Date | string;
        endDateAD: Date | string;
        isCurrent?: boolean;
        isActive?: boolean;
    }): Promise<FiscalYear> {
        const { isCurrent } = data;

        // Use a transaction to ensure data integrity if setting as current
        return prisma.$transaction(async (tx) => {
            if (isCurrent) {
                // Unset any existing current fiscal year
                await tx.fiscalYear.updateMany({
                    where: { isCurrent: true },
                    data: { isCurrent: false },
                });
            }

            const fiscalYear = await tx.fiscalYear.create({
                data: {
                    name: data.name,
                    startDateBS: data.startDateBS,
                    endDateBS: data.endDateBS,
                    startDateAD: new Date(data.startDateAD),
                    endDateAD: new Date(data.endDateAD),
                    isCurrent: data.isCurrent || false,
                    isActive: data.isActive ?? true,
                },
            });

            return fiscalYear;
        });
    }

    /**
     * Get all fiscal years
     */
    async getAllFiscalYears(): Promise<FiscalYear[]> {
        return prisma.fiscalYear.findMany({
            orderBy: { startDateAD: 'desc' },
        });
    }

    /**
     * Get single fiscal year by ID
     */
    async getFiscalYearById(id: string): Promise<FiscalYear | null> {
        return prisma.fiscalYear.findUnique({
            where: { id },
        });
    }

    /**
     * Update fiscal year
     */
    async updateFiscalYear(
        id: string,
        data: {
            name?: string;
            startDateBS?: string;
            endDateBS?: string;
            startDateAD?: Date | string;
            endDateAD?: Date | string;
            isCurrent?: boolean;
            isActive?: boolean;
        }
    ): Promise<FiscalYear> {
        const { isCurrent } = data;

        return prisma.$transaction(async (tx) => {
            if (isCurrent) {
                // Unset any existing current fiscal year if we are setting this one to current
                await tx.fiscalYear.updateMany({
                    where: { isCurrent: true, id: { not: id } },
                    data: { isCurrent: false },
                });
            }

            const updateData: any = { ...data };
            if (data.startDateAD) updateData.startDateAD = new Date(data.startDateAD);
            if (data.endDateAD) updateData.endDateAD = new Date(data.endDateAD);

            const fiscalYear = await tx.fiscalYear.update({
                where: { id },
                data: updateData,
            });

            return fiscalYear;
        });
    }

    /**
     * Delete fiscal year
     */
    async deleteFiscalYear(id: string): Promise<FiscalYear> {
        return prisma.fiscalYear.delete({
            where: { id },
        });
    }

    /**
     * Get current fiscal year
     */
    async getCurrentFiscalYear(): Promise<FiscalYear | null> {
        return prisma.fiscalYear.findFirst({
            where: { isCurrent: true },
        });
    }
}

export const fiscalYearService = new FiscalYearService();
