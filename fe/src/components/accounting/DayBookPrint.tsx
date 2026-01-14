import React from "react";
import { format } from "date-fns";
import { DayBook, DayBookSummary, DayBookTransaction } from "../../services/day-book.service";

interface DayBookPrintProps {
    dayBook: DayBook;
    summary: DayBookSummary;
    onClose: () => void;
}

const DayBookPrint: React.FC<DayBookPrintProps> = ({ dayBook, summary, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number) => {
        return `Rs. ${new Intl.NumberFormat("en-NP", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <div className="p-8 max-w-5xl mx-auto print:p-0 print:max-w-full">
                {/* No-Print Header */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <h1 className="text-2xl font-bold">Print Preview</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handlePrint}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="print:block">
                    {/* Header */}
                    <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
                        <h1 className="text-3xl font-bold uppercase tracking-wider">Astro Microfinance</h1>
                        <p className="text-gray-600">Kathmandu, Nepal</p>
                        <h2 className="text-xl font-semibold mt-4">Day Book Report</h2>
                        <p className="text-sm mt-1">
                            Date: <span className="font-bold">{format(new Date(dayBook.transactionDate), "MMMM dd, yyyy")}</span>
                        </p>
                        <p className="text-sm">
                            Book No: <span className="font-mono">{dayBook.bookNumber}</span>
                        </p>
                    </div>

                    {/* Opening Balance */}
                    <div className="mb-6">
                        <div className="flex justify-between border-b border-gray-300 py-2">
                            <span className="font-bold">Opening Balance:</span>
                            <span className="font-bold">{formatCurrency(dayBook.openingBalance)}</span>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-400">Transactions</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="text-left py-2 font-bold w-16">Trans No</th>
                                    <th className="text-left py-2 font-bold">Description</th>
                                    <th className="text-left py-2 font-bold w-24">Type</th>
                                    <th className="text-right py-2 font-bold w-32">Debit (Rs)</th>
                                    <th className="text-right py-2 font-bold w-32">Credit (Rs)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {summary.journalEntries.map((entry) => {
                                    const debitLine = entry.journalEntryLines.find(l => Number(l.debitAmount) > 0);
                                    const creditLine = entry.journalEntryLines.find(l => Number(l.creditAmount) > 0);
                                    const amount = debitLine ? Number(debitLine.debitAmount) : 0;

                                    return (
                                        <tr key={entry.id}>
                                            <td className="py-2 align-top">{entry.entryNumber}</td>
                                            <td className="py-2 align-top">{entry.narration}</td>
                                            <td className="py-2 align-top text-xs uppercase">{entry.status}</td>
                                            <td className="py-2 text-right align-top">{debitLine ? formatCurrency(amount) : "-"}</td>
                                            <td className="py-2 text-right align-top">{creditLine ? formatCurrency(amount) : "-"}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-400">Cash Summary</h3>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span>Opening Balance</span>
                                <span>{formatCurrency(dayBook.openingBalance)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span>Total Debits (In)</span>
                                <span className="text-green-600">+{formatCurrency(summary.summary.totalDebits)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span>Total Credits (Out)</span>
                                <span className="text-red-600">-{formatCurrency(summary.summary.totalCredits)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-800 font-bold mt-2">
                                <span>System Closing Balance</span>
                                <span>{formatCurrency(dayBook.systemCashBalance)}</span>
                            </div>
                        </div>

                        {/* Denomination / Physical Cash */}
                        <div>
                            <h3 className="text-lg font-bold mb-2 uppercase border-b border-gray-400">Physical Cash Verification</h3>
                            {dayBook.isReconciled ? (
                                <div className="space-y-1">
                                    {/* {dayBook.denominations && Object.entries(dayBook.denominations).map(([key, count]) => (
                             <div key={key} className="flex justify-between text-xs text-gray-600">
                                <span>{key.replace('note_', 'Rs. ')} x {count}</span>
                                <span>{formatCurrency(parseInt(key.replace('note_', '')) * (count as number))}</span>
                             </div>
                        ))} */}
                                    <div className="flex justify-between py-1 border-b border-gray-100 font-medium">
                                        <span>Physical Cash Count</span>
                                        <span>{formatCurrency(dayBook.physicalCashBalance || 0)}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-gray-100">
                                        <span>Discrepancy</span>
                                        <span className={dayBook.discrepancyAmount && dayBook.discrepancyAmount < 0 ? "text-red-600" : "text-green-600"}>
                                            {dayBook.discrepancyAmount ? formatCurrency(dayBook.discrepancyAmount) : "Rs. 0.00"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500 italic py-4 text-center border border-dashed border-gray-300 rounded">
                                    Not Reconciled Yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-16 grid grid-cols-3 gap-8">
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="font-medium">Prepared By</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="font-medium">Accountant</p>
                        </div>
                        <div className="border-t border-gray-400 pt-2 text-center">
                            <p className="font-medium">Manager</p>
                        </div>
                    </div>

                    <div className="mt-8 text-xs text-center text-gray-400">
                        Generated from Astro Finance System on {format(new Date(), "PPpp")}
                    </div>
                </div>
            </div>
            <style type="text/css" media="print">{`
        @page { size: portrait; margin: 10mm; }
        body { -webkit-print-color-adjust: exact; }
      `}</style>
        </div>
    );
};

export default DayBookPrint;
