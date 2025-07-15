import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  current: boolean;
}

const StaffNavigation: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Define navigation items
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: <HomeIcon className="h-6 w-6" />,
      current: router.pathname === '/staff/dashboard',
    },
    {
      name: 'Users',
      href: '/staff/users',
      icon: <UsersIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/users'),
    },
    {
      name: 'Loan Applications',
      href: '/staff/applications',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/applications'),
    },
    {
      name: 'Loans',
      href: '/staff/loans',
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/loans'),
    },
    {
      name: 'Reports',
      href: '/staff/reports',
      icon: <ChartBarIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/reports'),
    },
    {
      name: 'Notifications',
      href: '/staff/notifications',
      icon: <BellIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/notifications'),
    },
    {
      name: 'Settings',
      href: '/staff/settings',
      icon: <Cog6ToothIcon className="h-6 w-6" />,
      current: router.pathname.startsWith('/staff/settings'),
    },
    {
      name: 'Profile',
      href: '/staff/profile',
      icon: <UserCircleIcon className="h-6 w-6" />,
      current: router.pathname === '/staff/profile',
    },
  ];
  
  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`
            group flex items-center px-2 py-2 text-base font-medium rounded-md
            ${
              item.current
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <div
            className={`
              mr-4 flex-shrink-0 h-6 w-6
              ${item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}
          >
            {item.icon}
          </div>
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default StaffNavigation;