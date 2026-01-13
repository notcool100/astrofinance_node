import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../../components/layout/MainLayout";
import shareService, { ShareAccount } from "../../../services/share.service";
// import { formatCurrency } from "../../../utils/format.util"; // Assuming utility exists
import {
    UserGroupIcon,
    PlusIcon,
    MagnifyingGlassIcon, // Search icon
} from "@heroicons/react/24/outline";

const ShareDashboard = () => {
    const router = useRouter();
    const [shareAccounts, setShareAccounts] = useState<ShareAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchShareAccounts();
    }, []);

    const fetchShareAccounts = async () => {
        try {
            const data = await shareService.getAllShareAccounts();
            setShareAccounts(data);
        } catch (error) {
            console.error("Failed to fetch share accounts", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAccounts = shareAccounts.filter((account) =>
        account.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Share Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage member shares, issue new shares, and track capital.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            onClick={() => router.push("/admin/shares/issue")} // We'll create this page next
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Issue Shares
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6 flex justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Member Name
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Share Count
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Total Value
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4">Loading...</td>
                                            </tr>
                                        ) : filteredAccounts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-gray-500">No share accounts found.</td>
                                            </tr>
                                        ) : (
                                            filteredAccounts.map((account) => (
                                                <tr key={account.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {account.user?.fullName}
                                                        <div className="font-normal text-gray-500">{account.user?.email}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {account.shareCount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        NPR {account.totalAmount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {account.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={() => router.push(`/admin/shares/${account.userId}`)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View<span className="sr-only">, {account.user?.fullName}</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default ShareDashboard;
