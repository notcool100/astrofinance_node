# Nepali Date Converter

A lightweight, accurate TypeScript library for converting between Gregorian (AD) and Bikram Sambat (BS) calendars.

## Features

- ✅ Convert AD to BS and BS to AD
- ✅ Support for BS years 2000-2100 (AD 1943-2043)
- ✅ Full TypeScript support
- ✅ Comprehensive validation
- ✅ Date formatting utilities
- ✅ Month names in English and Nepali
- ✅ Zero dependencies
- ✅ Thoroughly tested

## Installation

```bash
npm install @notcool100/nepali-date-converter
```

## Usage

```typescript
import { adToBs, bsToAd, formatBsDate } from '@notcool100/nepali-date-converter';

// Convert AD to BS
const adDate = new Date(2025, 0, 13); // January 13, 2025
const bsDate = adToBs(adDate);
console.log(bsDate); // { year: 2081, month: 9, day: 28 }

// Convert BS to AD
const bs = { year: 2081, month: 9, day: 28 };
const ad = bsToAd(bs);
console.log(ad); // 2025-01-13

// Format BS date
const formatted = formatBsDate(bsDate);
console.log(formatted); // "2081-09-28"
```

## API

### `adToBs(adDate: Date): BsDate`
Convert a Gregorian date to Bikram Sambat.

### `bsToAd(bsDate: BsDate): Date`
Convert a Bikram Sambat date to Gregorian.

### `isBsDateValid(year: number, month: number, day: number): boolean`
Validate a BS date.

### `formatBsDate(bsDate: BsDate, format?: string): string`
Format a BS date as a string (default: 'YYYY-MM-DD').

### `formatBsDateWithMonth(bsDate: BsDate, locale?: 'en' | 'ne'): string`
Format a BS date with month name (e.g., "15 Baisakh 2081").

### `parseBsDate(dateString: string): BsDate | null`
Parse a BS date string in YYYY-MM-DD format.

### `getCurrentBsDate(): BsDate`
Get the current BS date.

### `getMonthName(month: number, locale?: 'en' | 'ne'): string`
Get the name of a BS month.

## License

MIT
