import React, { useState, useEffect, forwardRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { convertAdToBsString, convertBsToAdDate, formatBsForDisplay, BsDate } from '@/utils/dateUtils';
import { parseBsDate, getMonthNames, getDaysInBsMonth, formatBsDate } from '@notcool100/nepali-date-converter';

interface DualDatePickerProps {
    id?: string;
    selectedAd: Date | null;
    selectedBs?: string | null;
    onChange: (adDate: Date | null, bsDate: string | null) => void;
    minDate?: Date;
    maxDate?: Date;
    placeholderText?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    defaultCalendar?: 'ad' | 'bs';
    showBothDates?: boolean;
}

const DualDatePicker: React.FC<DualDatePickerProps> = ({
    id,
    selectedAd,
    selectedBs,
    onChange,
    minDate,
    maxDate,
    placeholderText = 'Select date',
    className = '',
    disabled = false,
    error,
    defaultCalendar = 'bs',
    showBothDates = true,
}) => {
    const [calendarMode, setCalendarMode] = useState<'ad' | 'bs'>(defaultCalendar);
    const [adDate, setAdDate] = useState<Date | null>(selectedAd);
    const [bsDate, setBsDate] = useState<string | null>(selectedBs || null);

    // AD date components
    const [adYear, setAdYear] = useState<number>(selectedAd ? selectedAd.getFullYear() : new Date().getFullYear());
    const [adMonth, setAdMonth] = useState<number>(selectedAd ? selectedAd.getMonth() + 1 : new Date().getMonth() + 1);
    const [adDay, setAdDay] = useState<number>(selectedAd ? selectedAd.getDate() : new Date().getDate());

    // BS date components
    const [bsYear, setBsYear] = useState<number>(2081);
    const [bsMonth, setBsMonth] = useState<number>(1);
    const [bsDay, setBsDay] = useState<number>(1);

    // Sync dates when props change
    useEffect(() => {
        setAdDate(selectedAd);
        if (selectedAd) {
            setAdYear(selectedAd.getFullYear());
            setAdMonth(selectedAd.getMonth() + 1);
            setAdDay(selectedAd.getDate());
        }
        if (selectedBs) {
            setBsDate(selectedBs);
            const parsed = parseBsDate(selectedBs);
            if (parsed) {
                setBsYear(parsed.year);
                setBsMonth(parsed.month);
                setBsDay(parsed.day);
            }
        } else if (selectedAd) {
            const calculatedBs = convertAdToBsString(selectedAd);
            setBsDate(calculatedBs || null);
            if (calculatedBs) {
                const parsed = parseBsDate(calculatedBs);
                if (parsed) {
                    setBsYear(parsed.year);
                    setBsMonth(parsed.month);
                    setBsDay(parsed.day);
                }
            }
        }
    }, [selectedAd, selectedBs]);

    // Handle AD date change
    const handleAdDateChange = (date: Date | null) => {
        setAdDate(date);
        if (date) {
            const bsString = convertAdToBsString(date);
            setBsDate(bsString);
            onChange(date, bsString);
        } else {
            setBsDate(null);
            onChange(null, null);
        }
    };

    // Handle BS date component change
    const handleBsDateComponentChange = (year: number, month: number, day: number) => {
        setBsYear(year);
        setBsMonth(month);
        setBsDay(day);

        try {
            const bsString = formatBsDate({ year, month, day });
            setBsDate(bsString);
            const adDateConverted = convertBsToAdDate(bsString);
            if (adDateConverted) {
                setAdDate(adDateConverted);
                onChange(adDateConverted, bsString);
            }
        } catch (error) {
            console.error('Error converting BS date:', error);
        }
    };

    // Handle AD date component change
    const handleAdDateComponentChange = (year: number, month: number, day: number) => {
        setAdYear(year);
        setAdMonth(month);
        setAdDay(day);

        const newDate = new Date(year, month - 1, day);
        if (!isNaN(newDate.getTime())) {
            setAdDate(newDate);
            const bsString = convertAdToBsString(newDate);
            setBsDate(bsString);
            onChange(newDate, bsString);
        }
    };

    // Toggle between AD and BS calendar
    const toggleCalendar = () => {
        setCalendarMode(calendarMode === 'ad' ? 'bs' : 'ad');
    };

    // BS mode with dropdowns
    if (calendarMode === 'bs') {
        const monthNames = getMonthNames('en');
        const years = Array.from({ length: 101 }, (_, i) => 2000 + i); // 2000-2100
        const daysInMonth = getDaysInBsMonth(bsYear, bsMonth);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div>
                <div className="grid grid-cols-3 gap-2">
                    {/* Year Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                        <select
                            id={id}
                            value={bsYear}
                            onChange={(e) => handleBsDateComponentChange(parseInt(e.target.value), bsMonth, bsDay)}
                            disabled={disabled}
                            className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                        <select
                            value={bsMonth}
                            onChange={(e) => {
                                const newMonth = parseInt(e.target.value);
                                const maxDays = getDaysInBsMonth(bsYear, newMonth);
                                const newDay = bsDay > maxDays ? maxDays : bsDay;
                                handleBsDateComponentChange(bsYear, newMonth, newDay);
                            }}
                            disabled={disabled}
                            className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                            {monthNames.map((month, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Day Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
                        <select
                            value={bsDay}
                            onChange={(e) => handleBsDateComponentChange(bsYear, bsMonth, parseInt(e.target.value))}
                            disabled={disabled}
                            className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Toggle and display info */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleCalendar}
                            disabled={disabled}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:text-primary-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Switch to AD calendar"
                        >
                            <ArrowPathIcon className="h-3 w-3" />
                            Switch to AD
                        </button>
                        <span className="text-xs text-gray-500">BS Calendar</span>
                    </div>
                    {bsDate && adDate && (
                        <div className="text-xs text-gray-600">
                            AD: {adDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    )}
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        );
    }

    // AD mode with dropdowns (matching BS format)
    const adMonthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const adYears = Array.from({ length: 131 }, (_, i) => 1930 + i); // 1930-2060
    const daysInAdMonth = new Date(adYear, adMonth, 0).getDate();
    const adDays = Array.from({ length: daysInAdMonth }, (_, i) => i + 1);

    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {/* Year Dropdown */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <select
                        id={id}
                        value={adYear}
                        onChange={(e) => handleAdDateComponentChange(parseInt(e.target.value), adMonth, adDay)}
                        disabled={disabled}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        {adYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Month Dropdown */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                    <select
                        value={adMonth}
                        onChange={(e) => {
                            const newMonth = parseInt(e.target.value);
                            const maxDays = new Date(adYear, newMonth, 0).getDate();
                            const newDay = adDay > maxDays ? maxDays : adDay;
                            handleAdDateComponentChange(adYear, newMonth, newDay);
                        }}
                        disabled={disabled}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        {adMonthNames.map((month, index) => (
                            <option key={index + 1} value={index + 1}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Day Dropdown */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
                    <select
                        value={adDay}
                        onChange={(e) => handleAdDateComponentChange(adYear, adMonth, parseInt(e.target.value))}
                        disabled={disabled}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        {adDays.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Toggle and display info */}
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleCalendar}
                        disabled={disabled}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 hover:text-primary-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Switch to BS calendar"
                    >
                        <ArrowPathIcon className="h-3 w-3" />
                        Switch to BS
                    </button>
                    <span className="text-xs text-gray-500">AD Calendar</span>
                </div>
                {bsDate && adDate && (
                    <div className="text-xs text-gray-600">
                        BS: {formatBsForDisplay(bsDate)}
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default DualDatePicker;
