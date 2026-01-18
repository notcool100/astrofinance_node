import prisma from '../../config/database';

export const createGroup = async (data: any) => {
    return await prisma.group.create({
        data,
    });
};

export const getGroups = async (centerId?: string) => {
    const where = centerId ? { centerId } : {};
    return await prisma.group.findMany({
        where,
        include: {
            center: true,
            _count: {
                select: { users: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getGroupById = async (id: string) => {
    return await prisma.group.findUnique({
        where: { id },
        include: {
            center: true,
            users: true,
        },
    });
};

export const updateGroup = async (id: string, data: any) => {
    return await prisma.group.update({
        where: { id },
        data,
    });
};

export const deleteGroup = async (id: string) => {
    return await prisma.group.delete({
        where: { id },
    });
};
