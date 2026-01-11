import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ShareCertificate, ShareAccount } from "../../services/share.service";
import { format } from "date-fns";

interface ShareCertificatePrintProps {
    certificate: ShareCertificate;
    account: ShareAccount;
    onClose: () => void;
}

const ShareCertificatePrint: React.FC<ShareCertificatePrintProps> = ({
    certificate,
    account,
    onClose,
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: onClose,
    });

    // Auto-trigger print when mounted or manually via button
    // We'll show a preview first

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex justify-between mb-4 no-print">
                    <h2 className="text-xl font-bold">Certificate Preview</h2>
                    <div className="space-x-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Print Certificate
                        </button>
                    </div>
                </div>

                {/* The Printable Area */}
                <div ref={componentRef} className="border-8 border-double border-gray-800 p-12 bg-white text-center relative print-content">
                    {/* Background Decorations could go here */}

                    <div className="absolute top-4 right-4 text-sm font-mono text-gray-500">
                        No: {certificate.certificateNumber}
                    </div>

                    <div className="mb-8">
                        <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-wider uppercase mb-2">
                            Share Certificate
                        </h1>
                        <h2 className="text-2xl font-serif text-gray-700">
                            Astro Microfinance Cooperative Ltd.
                        </h2>
                        <p className="text-gray-500">Kathmandu, Nepal</p>
                    </div>

                    <div className="my-12 font-serif text-lg leading-relaxed space-y-6">
                        <p>
                            This is to certify that
                        </p>
                        <h3 className="text-3xl font-bold font-cursive text-blue-900 border-b-2 border-dashed border-gray-300 inline-block px-12 py-2">
                            {account.user?.fullName}
                        </h3>
                        <p>
                            is the registered holder of
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {certificate.shareCount} ( {numberToWords(certificate.shareCount)} ) Shares
                        </h3>
                        <p>
                            of <strong>NPR 100</strong> each, fully paid up.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-20 mt-24 text-center">
                        <div className="border-t border-gray-400 pt-4">
                            <p className="font-bold">Authorized Signatory</p>
                            <p className="text-sm text-gray-500">Manager</p>
                        </div>
                        <div className="border-t border-gray-400 pt-4">
                            <p className="font-bold">Authorized Signatory</p>
                            <p className="text-sm text-gray-500">Chairman</p>
                        </div>
                    </div>

                    <div className="mt-12 text-sm text-gray-400">
                        Issued Date: {format(new Date(certificate.issuedDate), "MMMM do, yyyy")}
                    </div>
                </div>

                <style jsx global>{`
            @media print {
                .no-print {
                    display: none;
                }
                body {
                    background: white;
                }
                .print-content {
                    border: 8px double #000 !important;
                    margin: 20px;
                }
            }
            .font-cursive {
                font-family: 'Times New Roman', serif; /* Fallback */
            }
        `}</style>
            </div>
        </div>
    );
};

// Helper function to convert number to words (Simplified)
function numberToWords(num: number): string {
    // Basic implementation or placeholder. A real one would be recursive.
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    // ... complete logic needs a library or full function
    return num.toString();
}

export default ShareCertificatePrint;
