import React, { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import navigationService from '@/services/navigationService';
import {
  HomeIcon,
  UsersIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CogIcon,
  DocumentIcon,
  EnvelopeIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// Map of icon names to icon components
const iconMap: Record<string, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>> = {
  'dashboard': HomeIcon,
  'home': HomeIcon,
  'users': UsersIcon,
  'people': UsersIcon,
  'user': UserCircleIcon,
  'profile': UserCircleIcon,
  'loans': BanknotesIcon,
  'loan': BanknotesIcon,
  'monetization_on': BanknotesIcon,
  'accounting': CalculatorIcon,
  'calculator': CalculatorIcon,
  'applications': DocumentTextIcon,
  'description': DocumentTextIcon,
  'document': DocumentIcon,
  'expenses': CurrencyDollarIcon,
  'currency_dollar': CurrencyDollarIcon,
  'money': CurrencyDollarIcon,
  'reports': ChartBarIcon,
  'analytics': ChartBarIcon,
  'chart': ChartBarIcon,
  'settings': Cog6ToothIcon,
  'cog': CogIcon,
  'notifications': BellIcon,
  'bell': BellIcon,
  'help': QuestionMarkCircleIcon,
  'question': QuestionMarkCircleIcon,
  'education': AcademicCapIcon,
  'bank': BuildingLibraryIcon,
  'account_balance': BuildingLibraryIcon,
  'list': ClipboardDocumentListIcon,
  'clock': ClockIcon,
  'schedule': ClockIcon,
  'mail': EnvelopeIcon,
  'email': EnvelopeIcon,
  'tax': ReceiptPercentIcon,
  'receipt': ReceiptPercentIcon,
  'security': ShieldCheckIcon,
  'admin_panel_settings': ShieldCheckIcon,
  'staff': UserGroupIcon,
  'team': UserGroupIcon,
  'tools': WrenchScrewdriverIcon,
  'maintenance': WrenchScrewdriverIcon,
};

// Default icon to use if the icon name is not found in the map
const DefaultIcon = QuestionMarkCircleIcon;

interface ApiNavigationItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  order: number;
  parentId?: string;
  groupId?: string;
  groupName?: string;
  groupOrder?: number;
  children?: ApiNavigationItem[];
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const DynamicNavigation: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [apiNavItems, setApiNavItems] = useState<ApiNavigationItem[]>([]);
  
  // Fetch navigation items directly from API
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        // First try to get from auth context
        const navFromAuth = user?.navigation || [];
        
        if (navFromAuth && navFromAuth.length > 0) {
          console.log('Using navigation from auth context:', navFromAuth);
          setApiNavItems(navFromAuth);
        } else {
          // If not available, fetch directly from API
          console.log('Fetching navigation from API...');
          const navFromApi = await navigationService.getUserNavigation();
          console.log('Navigation fetched from API:', navFromApi);
          setApiNavItems(navFromApi);
        }
      } catch (error) {
        console.error('Error fetching navigation:', error);
      }
    };
    
    fetchNavigation();
  }, [user?.id]);
  
  // Convert API navigation items to our format
  const navigation = useMemo(() => {
    console.log('Processing navigation items:', apiNavItems);
    
    if (!apiNavItems || apiNavItems.length === 0) {
      console.log('No navigation items found, using fallback');
      // Fallback navigation items
      return [
        { 
          name: 'Dashboard', 
          href: '/office/dashboard', 
          icon: HomeIcon, 
          current: router.pathname === '/office/dashboard',
        },
        { 
          name: 'Profile', 
          href: '/office/profile', 
          icon: UserCircleIcon, 
          current: router.pathname === '/office/profile',
        },
      ];
    }
    
    // Group items by group name for better organization
    const groupedItems = apiNavItems.reduce((acc: Record<string, ApiNavigationItem[]>, item: ApiNavigationItem) => {
      const groupName = item.groupName || 'Other';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(item);
      return acc;
    }, {});
    
    // Sort groups by groupOrder
    const sortedGroups = Object.entries(groupedItems)
      .sort(([groupNameA, itemsA], [groupNameB, itemsB]) => {
        const groupOrderA = itemsA[0]?.groupOrder || 999;
        const groupOrderB = itemsB[0]?.groupOrder || 999;
        return groupOrderA - groupOrderB;
      });
    
    // Flatten the sorted groups back into a single array
    const sortedItems = sortedGroups.flatMap(([groupName, items]) => {
      // Sort items within each group by order
      return items.sort((a, b) => a.order - b.order);
    });
    
    console.log('Sorted navigation items:', sortedItems);
    
    return sortedItems.map((item: ApiNavigationItem) => {
      // Convert API URL to our format (e.g., '/dashboard' to '/office/dashboard')
      let href = item.url || '#';
      if (href.startsWith('/') && !href.startsWith('/office/')) {
        href = `/office${href}`;
      }
      
      // Get icon component from map or use default
      const iconName = item.icon?.toLowerCase() || '';
      const IconComponent = iconMap[iconName] || DefaultIcon;
      
      console.log(`Processing nav item: ${item.label}, icon: ${iconName}, url: ${href}`);
      
      return {
        name: item.label,
        href,
        icon: IconComponent,
        current: router.pathname === href || router.pathname.startsWith(`${href}/`),
        // Add additional properties for debugging
        _original: {
          id: item.id,
          groupName: item.groupName,
          groupOrder: item.groupOrder,
          order: item.order
        }
      };
    });
  }, [apiNavItems, router.pathname]);

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-200 hover:text-white hover:bg-primary-800',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-white' : 'text-primary-200 group-hover:text-white',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li className="mt-auto">
          <Link
            href="/office/help"
            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200 hover:bg-primary-800 hover:text-white"
          >
            <QuestionMarkCircleIcon className="h-6 w-6 shrink-0 text-primary-200 group-hover:text-white" />
            Help
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default DynamicNavigation;