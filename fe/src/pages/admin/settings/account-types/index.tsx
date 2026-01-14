import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import MainLayout from "@/components/layout/MainLayout";
import Button from "@/components/common/Button";
import accountTypeService, { AccountType } from "@/services/account-type.service";

const AccountTypesPage = () => {
    const router = useRouter();
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
    const [loading, setLoading] = useState(true);
    const [includeInactive, setIncludeInactive] = useState(false);

    useEffect(() => {
        loadAccountTypes();
    }, [includeInactive]);

    const loadAccountTypes = async () => {
        try {
            setLoading(true);
            const data = await accountTypeService.getAllAccountTypes(includeInactive);
            setAccountTypes(data);
        } catch (error) {
            console.error("Error loading account types:", error);
            toast.error("Failed to load account types");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete the account type "${code}"?`)) {
            return;
        }

        try {
            await accountTypeService.deleteAccountType(id);
            toast.success("Account type deleted successfully");
            loadAccountTypes();
        } catch (error: any) {
            console.error("Error deleting account type:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to delete account type. It may be in use by existing accounts.",
            );
        }
    };

    return (
        <MainLayout title="Account Types">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Account Types
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage account types that can be used when creating user accounts.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link href="/admin/settings/account-types/new">
                            <Button>Create Account Type</Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={includeInactive}
                            onChange={(e) => setIncludeInactive(e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            Show inactive account types
                        </span>
                    </label>
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Loading account types...</p>
                                    </div>
                                ) : accountTypes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No account types found</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                    Code
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Name
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Description
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {accountTypes.map((accountType) => (
                                                <tr key={accountType.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {accountType.code}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                        {accountType.name}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500">
                                                        {accountType.description || "-"}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        {accountType.isActive ? (
                                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <Link
                                                            href={`/admin/settings/account-types/${accountType.id}/edit`}
                                                            className="text-primary-600 hover:text-primary-900 mr-4"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(accountType.id, accountType.code)
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AccountTypesPage;
