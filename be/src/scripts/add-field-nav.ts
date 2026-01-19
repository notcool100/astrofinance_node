import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Adding Field Operations navigation...');

    let fieldGroup = await prisma.navigationGroup.findFirst({
        where: { name: 'Field Operations' }
    });

    if (!fieldGroup) {
        fieldGroup = await prisma.navigationGroup.create({
            data: {
                name: 'Field Operations',
                description: 'Mobile Field Application',
                order: 7
            }
        });
        console.log('Created Field Operations group');
    }

    const items = [
        { label: 'Field Dashboard', url: '/field', icon: 'smartphone' },
        { label: 'Field Sync', url: '/field/sync', icon: 'sync' }
    ];

    for (const item of items) {
        const existingItem = await prisma.navigationItem.findFirst({
            where: { url: item.url, groupId: fieldGroup.id }
        });

        let navItem;
        if (existingItem) {
            navItem = await prisma.navigationItem.update({
                where: { id: existingItem.id },
                data: {
                    label: item.label,
                    icon: item.icon,
                    order: items.indexOf(item) + 1,
                    groupId: fieldGroup.id
                }
            });
            console.log(`Updated nav item: ${item.label}`);
        } else {
            navItem = await prisma.navigationItem.create({
                data: {
                    label: item.label,
                    url: item.url,
                    icon: item.icon,
                    order: items.indexOf(item) + 1,
                    groupId: fieldGroup.id
                }
            });
            console.log(`Created nav item: ${item.label}`);
        }
        await assignToSuperAdmin(navItem.id);
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
        console.log(`Assigned ${itemId} to Super Admin`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
