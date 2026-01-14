import React, { useState, useEffect, forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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

    // BS date components
    const [bsYear, setBsYear] = useState<number>(2081);
    const [bsMonth, setBsMonth] = useState<number>(1);
    const [bsDay, setBsDay] = useState<number>(1);

    // Sync dates when props change
    useEffect(() => {
        setAdDate(selectedAd);
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

    // Toggle between AD and BS calendar
    const toggleCalendar = () => {
        setCalendarMode(calendarMode === 'ad' ? 'bs' : 'ad');
    };

    // Format display value
    const getDisplayValue = () => {
        if (!adDate && !bsDate) return '';

        if (showBothDates && adDate && bsDate) {
            const adFormatted = adDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            const bsFormatted = formatBsForDisplay(bsDate);
            return `${adFormatted} (${bsFormatted})`;
        }

        if (calendarMode === 'ad' && adDate) {
            return adDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }

        if (calendarMode === 'bs' && bsDate) {
            return formatBsForDisplay(bsDate);
        }

        return '';
    };

    // Custom input component for AD mode
    const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
        ({ value, onClick, placeholder }, ref) => (
            <div className="relative">
                <input
                    ref={ref}
                    id={id}
                    className={`block w-full pr-20 sm:text-sm rounded-md ${error
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
                    value={value as string}
                    onClick={onClick}
                    placeholder={placeholder}
                    readOnly
                    disabled={disabled}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCalendar();
                        }}
                        disabled={disabled}
                        className="px-2 py-1 text-xs font-medium text-gray-700 hover:text-primary-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Switch to ${calendarMode === 'ad' ? 'BS' : 'AD'} calendar`}
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle calendar</span>
                    </button>
                    <div className="pr-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                </div>
            </div>
        )
    );

    CustomInput.displayName = 'DualDatePickerCustomInput';

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

    // AD mode with react-datepicker
    return (
        <div>
            <ReactDatePicker
                selected={adDate}
                onChange={handleAdDateChange}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText={placeholderText}
                disabled={disabled}
                customInput={<CustomInput />}
                dateFormat="MM/dd/yyyy"
                popperClassName="z-50"
                popperPlacement="bottom-start"
                popperModifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                ]}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />
            {bsDate && (
                <div className="mt-1 text-xs text-gray-600">
                    BS: {formatBsForDisplay(bsDate)}
                </div>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default DualDatePicker;
