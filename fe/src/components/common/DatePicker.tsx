import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DatePickerProps {
  id?: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  className?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  disabled?: boolean;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText = 'Select date',
  className = '',
  showTimeSelect = false,
  dateFormat = 'MM/dd/yyyy',
  disabled = false,
  error,
}) => {
  // Custom input component
  // Custom input component with display name
  const CustomInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ value, onClick, placeholder }, ref) => (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={`block w-full pr-10 sm:text-sm rounded-md ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
          value={value as string}
          onClick={onClick}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>
    )
  );
  
  // Add display name
  CustomInput.displayName = 'DatePickerCustomInput';

  return (
    <div>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholderText}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        disabled={disabled}
        customInput={<CustomInput />}
        popperClassName="z-50" // Ensure the dropdown appears above other elements
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        showMonthDropdown // 👈 Add this
        showYearDropdown  // 👈 And this
  dropdownMode="select" 
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DatePicker;