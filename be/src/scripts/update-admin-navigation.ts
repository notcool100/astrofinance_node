import prisma from '../config/database';
import logger from '../config/logger';

async function ensureAdminNavItem(label: string, icon: string, url: string, order: number, groupId: string) {
  const existing = await prisma.navigationItem.findFirst({ where: { label, groupId } });
  if (existing) {
    if (existing.url !== url) {
      await prisma.navigationItem.update({ where: { id: existing.id }, data: { url } });
      logger.info(`Updated nav '${label}' url to ${url}`);
    }
    return existing.id;
  }
  const created = await prisma.navigationItem.create({ data: { label, icon, url, order, groupId } });
  logger.info(`Created nav item '${label}' at ${url}`);
  return created.id;
}

async function run() {
  try {
    const adminGroup = await prisma.navigationGroup.findFirst({ where: { name: 'Administration' } });
    if (!adminGroup) {
      logger.error('Administration group not found');
      return;
    }

    // Normalize existing items
    await ensureAdminNavItem('Staff', 'people', '/admin/staff', 1, adminGroup.id);
    await ensureAdminNavItem('Roles & Permissions', 'security', '/admin/roles', 2, adminGroup.id);
    await ensureAdminNavItem('Navigation Management', 'menu', '/admin/navigation', 3, adminGroup.id);
    await ensureAdminNavItem('System Settings', 'settings', '/admin/settings', 4, adminGroup.id);
    await ensureAdminNavItem('SMS Templates', 'mail', '/admin/sms', 5, adminGroup.id);
    await ensureAdminNavItem('Tax Settings', 'tax', '/admin/tax', 6, adminGroup.id);
  } catch (err) {
    logger.error('Error updating admin navigation', err);
  } finally {
    await prisma.$disconnect();
  }
}

run().then(() => logger.info('Admin navigation update completed'));
