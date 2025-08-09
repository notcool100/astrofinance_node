const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRolesAndNavigation() {
  try {
    // Get all roles
    const roles = await prisma.role.findMany({
      include: {
        roleNavigation: {
          include: {
            navigationItem: true
          }
        }
      }
    });
    
    console.log('=== ROLES AND THEIR NAVIGATION ASSIGNMENTS ===');
    roles.forEach(role => {
      console.log(`\nRole: ${role.name} (${role.id})`);
      console.log(`Navigation items assigned: ${role.roleNavigation.length}`);
      
      if (role.roleNavigation.length > 0) {
        role.roleNavigation.forEach(rn => {
          console.log(`  - ${rn.navigationItem.label} (${rn.navigationItem.url})`);
        });
      }
    });
    
    // Get all navigation items
    const navigationItems = await prisma.navigationItem.findMany({
      where: { isActive: true },
      include: {
        group: true
      },
      orderBy: { order: 'asc' }
    });
    
    console.log('\n=== ALL ACTIVE NAVIGATION ITEMS ===');
    navigationItems.forEach(item => {
      console.log(`- ${item.label} (${item.url}) - Group: ${item.group?.name || 'No group'}`);
    });
    
    // Check if there's a user named Anjal
    const staffUsers = await prisma.staff.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    console.log('\n=== STAFF USERS AND THEIR ROLES ===');
    staffUsers.forEach(staff => {
      console.log(`- ${staff.firstName} ${staff.lastName} (${staff.email})`);
      console.log(`  Roles: ${staff.roles.map(r => r.role.name).join(', ')}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolesAndNavigation();
