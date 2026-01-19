// import prisma from '../../config/database';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const createCenter = async (data: any) => {
    return await prisma.center.create({
        data,
    });
};

export const getCenters = async () => {
    return await prisma.center.findMany({
        include: {
            _count: {
                select: { groups: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getCenterById = async (id: string) => {
    return await prisma.center.findUnique({
        where: { id },
        include: {
            groups: true,
            staff: true,
        },
    });
};

export const updateCenter = async (id: string, data: any) => {
    return await prisma.center.update({
        where: { id },
        data,
    });
};

export const deleteCenter = async (id: string) => {
    return await prisma.center.delete({
        where: { id },
    });
};
