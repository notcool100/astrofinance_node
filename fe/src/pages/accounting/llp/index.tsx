import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import llpService, { LLPReport, LoanProvision } from "../../../services/llp.service";
// import { formatCurrency } from "../../../utils/format.util";
import { toast } from "react-toastify";
import {
    ChartPieIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const LLPDashboard = () => {
    const [report, setReport] = useState<LLPReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await llpService.getLLPReport();
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch LLP report", error);
            toast.error("Failed to load Loan Loss Provision report");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            await llpService.generateProvisions();
            toast.success("Provisions generated successfully. Reloading report...");
            await fetchReport();
        } catch (error) {
            toast.error("Failed to generate provisions");
        } finally {
            setGenerating(false);
        }
    };

    const getClassColor = (cls: string) => {
        switch (cls) {
            case 'GOOD': return 'bg-green-100 text-green-800';
            case 'SUBSTANDARD': return 'bg-yellow-100 text-yellow-800';
            case 'DOUBTFUL': return 'bg-orange-100 text-orange-800';
            case 'BAD': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && !report) return <MainLayout><div>Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Loan Loss Provisioning (LLP)</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Risk classification and provision requirements based on Sahakari regulations.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
                        >
                            {generating ? (
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            ) : (
                                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                            )}
                            {generating ? "Generating..." : "Generate/Update Provisions"}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {report && (
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Provision Required</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">NPR {report.summary.totalProvision.toLocaleString()}</dd>
                            </div>
                        </div>
                        {['GOOD', 'SUBSTANDARD', 'DOUBTFUL', 'BAD'].map((type) => {
                            const data = report.summary[type as keyof typeof report.summary];
                            return (
                                <div key={type} className="bg-white overflow-hidden shadow rounded-lg border-t-4 border-indigo-500">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassColor(type)}`}>
                                                    {type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-lg font-medium text-gray-900">{data.count} Loans</h3>
                                            <p className="text-sm text-gray-500">Vol: NPR {data.amount.toLocaleString()}</p>
                                            <p className="text-sm font-bold text-gray-700 mt-1">Prov: NPR {data.provision.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Detailed Table */}
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Loan Number</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Member</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Classification</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Overdue Days</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Provision Amt</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Uncovered Risk?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {report?.details.map((item) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {item.loan?.loanNumber}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.loan?.user?.fullName}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassColor(item.classification)}`}>
                                                        {item.classification} ({item.provisionPercent}%)
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.overdueDays} Days</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">NPR {Number(item.provisionAmount).toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {item.classification === 'BAD' ? (
                                                        <span className="flex items-center text-red-600"><ExclamationTriangleIcon className="h-4 w-4 mr-1" /> High Risk</span>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
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

export default LLPDashboard;
