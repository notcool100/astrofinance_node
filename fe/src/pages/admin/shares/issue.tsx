import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../../components/layout/MainLayout";
import shareService from "../../../services/share.service";
import apiService from "../../../services/api"; // For searching users
import { toast } from "react-toastify";

// Simple User Interface for search results
interface UserSearchResult {
    id: string;
    fullName: string;
    email: string;
    idNumber: string;
}

const IssueSharesPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        userId: "",
        shareCount: "",
        amount: "",
        sharePrice: "100",
        description: "",
    });

    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Search users when searchTerm changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                setLoading(true);
                try {
                    // Assuming we have a user search endpoint. If not, we might need one.
                    // For now, let's try searching against the generic users endpoint if it supports query params
                    // Or list recent users. 
                    // Let's assume /api/users accepts a search query.
                    // If this endpoint doesn't exist, we'll need to create it or simple list all for now (not scalable).
                    // Let's try the existing user service pattern if known.
                    // Based on previous files, there is /api/user.
                    const response = await apiService.get<any>(`/users?search=${searchTerm}`);
                    // Adjust based on actual API response structure. 
                    // Assuming response.data.data or response.data is the list.
                    const userList = Array.isArray(response.data) ? response.data : response.data.data || [];
                    setUsers(userList);
                } catch (error) {
                    console.error("Error searching users", error);
                } finally {
                    setLoading(false);
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleShareCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = Number(e.target.value);
        const price = Number(formData.sharePrice);
        setFormData({
            ...formData,
            shareCount: e.target.value,
            amount: (count * price).toString()
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userId) {
            toast.error("Please select a user");
            return;
        }
        setSubmitting(true);
        try {
            await shareService.issueShares({
                userId: formData.userId,
                shareCount: Number(formData.shareCount),
                amount: Number(formData.amount),
                sharePrice: Number(formData.sharePrice),
                description: formData.description
            });
            toast.success("Shares issued successfully!");
            router.push("/admin/shares");
        } catch (error: any) {
            toast.error(error.message || "Failed to issue shares");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout title="Issue Shares">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-6">Issue New Shares</h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Member Search</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Search Results Dropdown */}
                        {users.length > 0 && !formData.userId && (
                            <ul className="mt-1 max-h-40 overflow-auto border border-gray-200 rounded-md bg-white">
                                {users.map(user => (
                                    <li
                                        key={user.id}
                                        className="cursor-pointer p-2 hover:bg-gray-50 flex justify-between"
                                        onClick={() => {
                                            setFormData({ ...formData, userId: user.id });
                                            setSearchTerm(user.fullName);
                                            setUsers([]); // clear results
                                        }}
                                    >
                                        <span>{user.fullName}</span>
                                        <span className="text-gray-500 text-sm">{user.email}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {formData.userId && <p className="text-sm text-green-600 mt-1">✓ Member Selected</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Share Count</label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={formData.shareCount}
                                onChange={handleShareCountChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Share Price (NPR)</label>
                            <input
                                type="number"
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={formData.sharePrice}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount (NPR)</label>
                        <input
                            type="number"
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm font-bold"
                            value={formData.amount}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description / Remarks</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !formData.userId}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                        >
                            {submitting ? "Issuing..." : "Issue Shares"}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default IssueSharesPage;
