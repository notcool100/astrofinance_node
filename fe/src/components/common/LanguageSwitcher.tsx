import React from 'react';
import { useRouter } from 'next/router';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const LanguageSwitcher: React.FC = () => {
    const router = useRouter();
    const { locale, pathname, asPath, query } = router;

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

    const changeLanguage = (newLocale: string) => {
        // Store language preference in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredLanguage', newLocale);
        }

        // Change the language using Next.js router
        router.push({ pathname, query }, asPath, { locale: newLocale });
    };

    return (
        <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                <span className="sr-only">Change language</span>
                <GlobeAltIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                <span className="hidden lg:flex lg:items-center">
                    <span className="ml-2 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                        {currentLanguage.flag} {currentLanguage.name}
                    </span>
                </span>
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {languages.map((language) => (
                        <Menu.Item key={language.code}>
                            {({ active }) => (
                                <button
                                    onClick={() => changeLanguage(language.code)}
                                    className={classNames(
                                        active ? 'bg-gray-50' : '',
                                        locale === language.code ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-900',
                                        'block w-full text-left px-3 py-2 text-sm leading-6'
                                    )}
                                >
                                    <span className="mr-2">{language.flag}</span>
                                    {language.name}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default LanguageSwitcher;
