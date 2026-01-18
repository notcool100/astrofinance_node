import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiHome, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import OfflineIndicator from '@/components/OfflineIndicator';
import { useAuth } from '@/contexts/AuthContext';

interface FieldLayoutProps {
    children: ReactNode;
    title?: string;
}

const FieldLayout = ({ children, title = 'AstroField' }: FieldLayoutProps) => {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 pb-16">
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* Header */}
            <header className="bg-[#1a365d] text-white p-4 shadow-md fixed top-0 w-full z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold font-heading">{title}</h1>
                    <button onClick={logout} className="text-white">
                        <FiLogOut size={24} />
                    </button>
                </div>
            </header>

            {/* Offline Indicator */}
            <OfflineIndicator />

            {/* Main Content */}
            <main className="pt-20 px-4">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 z-10 pb-safe">
                <button
                    onClick={() => router.push('/field')}
                    className={`flex flex-col items-center ${router.pathname === '/field' ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <FiHome size={24} />
                    <span className="text-xs mt-1">Home</span>
                </button>
                <button
                    onClick={() => router.push('/field/sync')}
                    className={`flex flex-col items-center ${router.pathname === '/field/sync' ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <FiRefreshCw size={24} />
                    <span className="text-xs mt-1">Sync</span>
                </button>
            </nav>
        </div>
    );
};

export default FieldLayout;
