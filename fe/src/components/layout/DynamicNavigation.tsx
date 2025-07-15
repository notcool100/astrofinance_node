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
  children?: ApiNavigationItem[];
}

interface ApiNavigationGroup {
  id: string;
  name: string;
  order: number;
  items: ApiNavigationItem[];
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
  const [apiNavGroups, setApiNavGroups] = useState<ApiNavigationGroup[]>([]);
  
  // Fetch navigation items directly from API
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        // First try to get from auth context
        const navFromAuth = user?.navigation || [];
        
        if (navFromAuth && navFromAuth.length > 0) {
          console.log('Using navigation from auth context:', navFromAuth);
          setApiNavGroups(navFromAuth);
        } else {
          // If not available, fetch directly from API
          console.log('Fetching navigation from API...');
          const navFromApi = await navigationService.getUserNavigation();
          console.log('Navigation fetched from API:', navFromApi);
          setApiNavGroups(navFromApi);
        }
      } catch (error) {
        console.error('Error fetching navigation:', error);
      }
    };
    
    fetchNavigation();
  }, [user?.id]);
  
  // Convert API navigation groups to our format
  const navigationGroups = useMemo(() => {
    console.log('Processing navigation groups:', apiNavGroups);
    
    if (!apiNavGroups || apiNavGroups.length === 0) {
      console.log('No navigation groups found, using fallback');
      // Fallback navigation groups
      return [
        {
          id: 'fallback-group',
          name: 'Main Menu',
          items: [
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
          ]
        }
      ];
    }
    
    // Process each navigation group
    return apiNavGroups.map(group => {
      // Process items in this group
      const processedItems = group.items.map(item => {
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
          id: item.id,
          name: item.label,
          href,
          icon: IconComponent,
          current: router.pathname === href || router.pathname.startsWith(`${href}/`),
          children: item.children?.map(child => {
            // Process child items
            let childHref = child.url || '#';
            if (childHref.startsWith('/') && !childHref.startsWith('/office/')) {
              childHref = `/office${childHref}`;
            }
            
            const childIconName = child.icon?.toLowerCase() || '';
            const ChildIconComponent = iconMap[childIconName] || DefaultIcon;
            
            return {
              id: child.id,
              name: child.label,
              href: childHref,
              icon: ChildIconComponent,
              current: router.pathname === childHref || router.pathname.startsWith(`${childHref}/`),
            };
          })
        };
      });
      
      return {
        id: group.id,
        name: group.name,
        items: processedItems
      };
    });
  }, [apiNavGroups, router.pathname]);

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {navigationGroups.map((group) => (
          <li key={group.id}>
            <div className="text-xs font-semibold leading-6 text-primary-400 uppercase px-2 mb-1">
              {group.name}
            </div>
            <ul role="list" className="-mx-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  {!item.children || item.children.length === 0 ? (
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
                  ) : (
                    <div>
                      <button
                        type="button"
                        className={classNames(
                          item.current
                            ? 'bg-primary-800 text-white'
                            : 'text-primary-200 hover:text-white hover:bg-primary-800',
                          'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
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
                      </button>
                      {/* Submenu for children */}
                      <ul className="mt-1 pl-8 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              className={classNames(
                                child.current
                                  ? 'bg-primary-700 text-white'
                                  : 'text-primary-300 hover:text-white hover:bg-primary-700',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6'
                              )}
                            >
                              <child.icon
                                className={classNames(
                                  child.current ? 'text-white' : 'text-primary-300 group-hover:text-white',
                                  'h-5 w-5 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
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