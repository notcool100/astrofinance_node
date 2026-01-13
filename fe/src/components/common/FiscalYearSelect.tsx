import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import fiscalYearService from "@/services/fiscalYearService";
import { FiscalYear } from "@/types/fiscal-year";

interface FiscalYearSelectProps {
    value?: string;
    onChange: (fiscalYearId: string | undefined) => void;
    className?: string;
    label?: string;
    placeholder?: string;
    showActiveOnly?: boolean;
}

const FiscalYearSelect: React.FC<FiscalYearSelectProps> = ({
    value,
    onChange,
    className = "",
    label = "Fiscal Year",
    placeholder = "Select Fiscal Year",
    showActiveOnly = true,
}) => {
    const { data: fiscalYears, isLoading } = useQuery(
        "fiscalYears",
        () => fiscalYearService.getAllFiscalYears(),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );

    const [options, setOptions] = useState<FiscalYear[]>([]);

    useEffect(() => {
        if (fiscalYears) {
            let filtered = fiscalYears;
            if (showActiveOnly) {
                filtered = fiscalYears.filter((fy) => fy.isActive);
            }
            // Sort by start date descending (newest first)
            filtered.sort((a, b) => new Date(b.startDateAD).getTime() - new Date(a.startDateAD).getTime());
            setOptions(filtered);
        }
    }, [fiscalYears, showActiveOnly]);

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                value={value || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val === "" ? undefined : val);
                }}
                className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                disabled={isLoading}
            >
                <option value="">{placeholder}</option>
                {options.map((fy) => (
                    <option key={fy.id} value={fy.id}>
                        {fy.name} {fy.isCurrent ? "(Current)" : ""}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default FiscalYearSelect;
