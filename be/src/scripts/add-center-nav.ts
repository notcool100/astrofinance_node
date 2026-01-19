import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Adding Center/Group navigation...');

    const adminGroup = await prisma.navigationGroup.findFirst({
        where: { name: 'Administration' }
    });

    if (!adminGroup) {
        console.log('Admin group not found!');
        return;
    }

    // 1. Centers
    const centerItem = await prisma.navigationItem.findFirst({
        where: { url: '/admin/centers' }
    });

    if (!centerItem) {
        const item = await prisma.navigationItem.create({
            data: {
                label: 'Centers',
                icon: 'store',
                url: '/admin/centers',
                order: 6,
                groupId: adminGroup.id,
            }
        });
        console.log('Created Centers nav item');

        // Assign to Super Admin
        await assignToSuperAdmin(item.id);
    } else {
        console.log('Centers nav item already exists');
    }

    // 2. Groups
    const groupItem = await prisma.navigationItem.findFirst({
        where: { url: '/admin/groups' }
    });

    if (!groupItem) {
        const item = await prisma.navigationItem.create({
            data: {
                label: 'Groups',
                icon: 'groups',
                url: '/admin/groups',
                order: 7,
                groupId: adminGroup.id,
            }
        });
        console.log('Created Groups nav item');
        // Assign to Super Admin
        await assignToSuperAdmin(item.id);
    } else {
        console.log('Groups nav item already exists');
    }
}

async function assignToSuperAdmin(itemId: string) {
    const superAdmin = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
    if (superAdmin) {
        await prisma.roleNavigation.upsert({
            where: {
                roleId_navigationItemId: {
                    roleId: superAdmin.id,
                    navigationItemId: itemId
                }
            },
            update: {},
            create: {
                roleId: superAdmin.id,
                navigationItemId: itemId
            }
        });
        console.log('Assigned to Super Admin');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
