import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Script to update the staff navigation item to point to admin staff management
 */
async function updateStaffNavigation() {
  try {
    // Find the staff navigation item
    const staffNavItem = await prisma.navigationItem.findFirst({
      where: {
        label: 'Staff',
        url: '/staff'
      }
    });

    if (staffNavItem) {
      // Update the URL to point to admin staff management
      await prisma.navigationItem.update({
        where: { id: staffNavItem.id },
        data: {
          url: '/admin/staff'
        }
      });
      
      logger.info('Updated staff navigation item URL from /staff to /admin/staff');
    } else {
      logger.info('Staff navigation item not found with URL /staff');
    }

    // Also check if there's a staff item in the Administration group
    const adminGroup = await prisma.navigationGroup.findFirst({
      where: { name: 'Administration' }
    });

    if (adminGroup) {
      const adminStaffItem = await prisma.navigationItem.findFirst({
        where: {
          label: 'Staff',
          groupId: adminGroup.id
        }
      });

      if (adminStaffItem) {
        await prisma.navigationItem.update({
          where: { id: adminStaffItem.id },
          data: {
            url: '/admin/staff'
          }
        });
        
        logger.info('Updated admin staff navigation item URL to /admin/staff');
      }
    }
    
  } catch (error) {
    logger.error('Error updating staff navigation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateStaffNavigation().then(() => {
  logger.info('Staff navigation update completed');
});
