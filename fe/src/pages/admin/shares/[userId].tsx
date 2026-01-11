import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "../../../components/layout/MainLayout";
import shareService, { ShareAccount, ShareTransaction, ShareCertificate } from "../../../services/share.service";
import ShareCertificatePrint from "../../../components/accounting/ShareCertificatePrint";
import { format } from "date-fns";

const MemberShareDetail = () => {
    const router = useRouter();
    const { userId } = router.query;
    const [account, setAccount] = useState<ShareAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState<ShareCertificate | null>(null);

    useEffect(() => {
        if (userId) {
            fetchAccount();
        }
    }, [userId]);

    const fetchAccount = async () => {
        try {
            const data = await shareService.getShareAccount(userId as string);
            setAccount(data);
        } catch (error) {
            console.error("Failed to fetch share account", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
    if (!account) return <MainLayout><div>Account not found</div></MainLayout>;

    return (
        <MainLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{account.user?.fullName}</h1>
                        <p className="text-sm text-gray-500">Share Account Details</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Shares</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{account.shareCount}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                            <dd className="mt-1 text-3xl font-semibold text-indigo-600">NPR {account.totalAmount}</dd>
                        </div>
                    </div>
                </div>

                {/* Certificates Section */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Share Certificates</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {account.certificates?.map((cert) => (
                                <li key={cert.id} className="flex items-center justify-between px-4 py-4 sm:px-6">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-indigo-600 truncate">
                                            {cert.certificateNumber}
                                        </p>
                                        <div className="mt-2 flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="truncate">
                                                    {cert.shareCount} Shares (NPR {cert.amount})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cert.status === 'GENERATED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {cert.status}
                                        </span>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => setSelectedCertificate(cert)}
                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Print
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {(!account.certificates || account.certificates.length === 0) && (
                                <li className="px-4 py-4 text-sm text-gray-500 text-center">No certificates issued.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Transactions History */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {account.transactions?.map((tx) => (
                                <li key={tx.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-900">
                                            {tx.transactionType}
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.transactionType === 'PURCHASE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {tx.shareCount > 0 ? '+' : ''}{tx.shareCount} Shares
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                        <span>{tx.description}</span>
                                        <span>{format(new Date(tx.transactionDate), "yyyy-MM-dd HH:mm")}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Print Modal */}
                {selectedCertificate && (
                    <ShareCertificatePrint
                        certificate={selectedCertificate}
                        account={account}
                        onClose={() => setSelectedCertificate(null)}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default MemberShareDetail;
