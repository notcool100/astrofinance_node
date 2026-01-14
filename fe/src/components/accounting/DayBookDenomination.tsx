import React, { useEffect, useState } from "react";

interface DayBookDenominationProps {
    initialDenominations?: Record<string, number>;
    onTotalChange: (total: number, denominations: Record<string, number>) => void;
    disabled?: boolean;
}

const NOTES = [1000, 500, 100, 50, 20, 10, 5, 2, 1];

export const DayBookDenomination: React.FC<DayBookDenominationProps> = ({
    initialDenominations = {},
    onTotalChange,
    disabled = false,
}) => {
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [coins, setCoins] = useState<number>(0);

    useEffect(() => {
        if (initialDenominations) {
            const newCounts: Record<number, number> = {};
            NOTES.forEach(note => {
                if (initialDenominations[`note_${note}`]) {
                    newCounts[note] = initialDenominations[`note_${note}`];
                }
            });
            setCounts(newCounts);
            if (initialDenominations['coins']) {
                setCoins(initialDenominations['coins']);
            }
        }
    }, [initialDenominations]);

    const calculateTotal = (currentCounts: Record<number, number>, currentCoins: number) => {
        let total = 0;
        NOTES.forEach((note) => {
            total += note * (currentCounts[note] || 0);
        });
        total += currentCoins;
        return total;
    };

    const handleCountChange = (note: number, value: string) => {
        const count = parseInt(value) || 0;
        const newCounts = { ...counts, [note]: count };
        setCounts(newCounts);

        // Prepare parent payload
        const payload: Record<string, number> = {};
        NOTES.forEach(n => {
            if (newCounts[n]) payload[`note_${n}`] = newCounts[n];
        });
        if (coins > 0) payload['coins'] = coins;

        onTotalChange(calculateTotal(newCounts, coins), payload);
    };

    const handleCoinsChange = (value: string) => {
        const newCoins = parseFloat(value) || 0;
        setCoins(newCoins);

        // Prepare parent payload
        const payload: Record<string, number> = {};
        NOTES.forEach(n => {
            if (counts[n]) payload[`note_${n}`] = counts[n];
        });
        if (newCoins > 0) payload['coins'] = newCoins;

        onTotalChange(calculateTotal(counts, newCoins), payload);
    };

    const totalAmount = calculateTotal(counts, coins);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Denominations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {NOTES.map((note) => (
                    <div key={note} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700 w-24">Rs. {note}</span>
                        <span className="text-gray-400 mx-2">x</span>
                        <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={counts[note] || ""}
                            onChange={(e) => handleCountChange(note, e.target.value)}
                            className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="0"
                        />
                        <span className="text-sm font-medium text-gray-900 w-24 text-right">
                            = Rs. {(note * (counts[note] || 0)).toLocaleString()}
                        </span>
                    </div>
                ))}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 font-medium">
                    <span className="text-sm text-gray-700 w-24">Coins/Other</span>
                    <span className="text-gray-400 mx-2"> </span>
                    <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={coins || ""}
                        onChange={(e) => handleCoinsChange(e.target.value)}
                        className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="0"
                    />
                    <span className="text-sm text-gray-900 w-24 text-right">
                        = Rs. {coins.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center bg-gray-50 p-3 rounded">
                <span className="text-base font-bold text-gray-900">Total Physical Cash</span>
                <span className="text-xl font-bold text-blue-600">
                    Rs. {totalAmount.toLocaleString()}
                </span>
            </div>
        </div>
    );
};
