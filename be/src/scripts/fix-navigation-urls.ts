import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Script to fix navigation URLs for accounting section
 * This script checks and fixes navigation URLs
 */
async function fixNavigationUrls() {
  try {
    logger.info('Starting navigation URL fix...');

    // First, let's check all navigation items to see what we have
    const allItems = await prisma.navigationItem.findMany();
    logger.info(`Found ${allItems.length} total navigation items`);

    // Log all URLs to see what patterns we have
    allItems.forEach(item => {
      logger.info(`Item "${item.label}" has URL: ${item.url}`);
    });

    // Find items with accounting URLs
    const accountingItems = allItems.filter(item => 
      item.url?.includes('accounting') || 
      item.label?.toLowerCase().includes('account') ||
      item.label?.toLowerCase().includes('chart') ||
      item.label?.toLowerCase().includes('journal') ||
      item.label?.toLowerCase().includes('day book') ||
      item.label?.toLowerCase().includes('financial')
    );

    logger.info(`Found ${accountingItems.length} accounting-related items`);

    // Update accounting items to ensure they have the correct URL format
    for (const item of accountingItems) {
      let newUrl = item.url;
      
      // If URL starts with /admin/accounting, fix it
      if (item.url?.startsWith('/admin/accounting')) {
        newUrl = item.url.replace('/admin/accounting', '/accounting');
        logger.info(`Fixing admin prefix: "${item.label}" from ${item.url} to ${newUrl}`);
      }
      
      // Fix URLs that don't start with a slash
      if (item.url && !item.url.startsWith('/')) {
        newUrl = '/' + item.url;
        logger.info(`Adding leading slash: "${item.label}" from ${item.url} to ${newUrl}`);
      }
      
      // Only update if URL changed
      if (newUrl !== item.url) {
        await prisma.navigationItem.update({
          where: { id: item.id },
          data: { url: newUrl }
        });
        logger.info(`Updated item "${item.label}" URL to ${newUrl}`);
      }
    }

    logger.info('Navigation URLs check completed');
  } catch (error) {
    logger.error('Error fixing navigation URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixNavigationUrls().then(() => {
  logger.info('Script completed');
});