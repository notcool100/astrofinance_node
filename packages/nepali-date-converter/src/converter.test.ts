import {
    adToBs,
    bsToAd,
    isBsDateValid,
    formatBsDate,
    formatBsDateWithMonth,
    parseBsDate,
    getDaysInBsMonth,
    getMonthName,
    BsDate,
} from '../src/converter';

describe('Nepali Date Converter', () => {
    describe('adToBs', () => {
        it('should convert reference date correctly', () => {
            // BS 2000-01-01 = AD 1943-04-14
            const adDate = new Date(1943, 3, 14); // Month is 0-indexed
            const bsDate = adToBs(adDate);

            expect(bsDate.year).toBe(2000);
            expect(bsDate.month).toBe(1);
            expect(bsDate.day).toBe(1);
        });

        it('should convert known test dates correctly', () => {
            // BS 2081-09-28 = AD 2025-01-13
            const adDate = new Date(2025, 0, 13);
            const bsDate = adToBs(adDate);

            expect(bsDate.year).toBe(2081);
            expect(bsDate.month).toBe(9);
            expect(bsDate.day).toBe(28);
        });

        it('should convert another known date', () => {
            // BS 2080-01-01 = AD 2023-04-14
            const adDate = new Date(2023, 3, 14);
            const bsDate = adToBs(adDate);

            expect(bsDate.year).toBe(2080);
            expect(bsDate.month).toBe(1);
            expect(bsDate.day).toBe(1);
        });

        it('should throw error for dates before supported range', () => {
            const adDate = new Date(1943, 3, 13); // One day before reference
            expect(() => adToBs(adDate)).toThrow();
        });
    });

    describe('bsToAd', () => {
        it('should convert reference date correctly', () => {
            const bsDate: BsDate = { year: 2000, month: 1, day: 1 };
            const adDate = bsToAd(bsDate);

            expect(adDate.getFullYear()).toBe(1943);
            expect(adDate.getMonth()).toBe(3); // April (0-indexed)
            expect(adDate.getDate()).toBe(14);
        });

        it('should convert known test dates correctly', () => {
            const bsDate: BsDate = { year: 2081, month: 9, day: 28 };
            const adDate = bsToAd(bsDate);

            expect(adDate.getFullYear()).toBe(2025);
            expect(adDate.getMonth()).toBe(0); // January (0-indexed)
            expect(adDate.getDate()).toBe(13);
        });

        it('should throw error for invalid BS date', () => {
            const bsDate: BsDate = { year: 2080, month: 1, day: 32 };
            expect(() => bsToAd(bsDate)).toThrow();
        });
    });

    describe('Round trip conversion', () => {
        it('should maintain consistency AD -> BS -> AD', () => {
            const originalAd = new Date(2024, 0, 15); // 2024-01-15
            const bs = adToBs(originalAd);
            const convertedAd = bsToAd(bs);

            expect(convertedAd.getFullYear()).toBe(originalAd.getFullYear());
            expect(convertedAd.getMonth()).toBe(originalAd.getMonth());
            expect(convertedAd.getDate()).toBe(originalAd.getDate());
        });

        it('should maintain consistency BS -> AD -> BS', () => {
            const originalBs: BsDate = { year: 2080, month: 5, day: 15 };
            const ad = bsToAd(originalBs);
            const convertedBs = adToBs(ad);

            expect(convertedBs.year).toBe(originalBs.year);
            expect(convertedBs.month).toBe(originalBs.month);
            expect(convertedBs.day).toBe(originalBs.day);
        });
    });

    describe('isBsDateValid', () => {
        it('should validate correct dates', () => {
            expect(isBsDateValid(2080, 1, 1)).toBe(true);
            expect(isBsDateValid(2080, 12, 30)).toBe(true);
        });

        it('should invalidate out of range years', () => {
            expect(isBsDateValid(1999, 1, 1)).toBe(false);
            expect(isBsDateValid(2101, 1, 1)).toBe(false);
        });

        it('should invalidate invalid months', () => {
            expect(isBsDateValid(2080, 0, 1)).toBe(false);
            expect(isBsDateValid(2080, 13, 1)).toBe(false);
        });

        it('should invalidate invalid days', () => {
            expect(isBsDateValid(2080, 1, 0)).toBe(false);
            expect(isBsDateValid(2080, 1, 32)).toBe(false); // BS 2080 Baisakh has 31 days
        });
    });

    describe('formatBsDate', () => {
        it('should format date in YYYY-MM-DD format', () => {
            const bsDate: BsDate = { year: 2080, month: 9, day: 5 };
            expect(formatBsDate(bsDate)).toBe('2080-09-05');
        });

        it('should format date in custom format', () => {
            const bsDate: BsDate = { year: 2080, month: 9, day: 5 };
            expect(formatBsDate(bsDate, 'YYYY/MM/DD')).toBe('2080/09/05');
        });
    });

    describe('formatBsDateWithMonth', () => {
        it('should format date with English month name', () => {
            const bsDate: BsDate = { year: 2080, month: 1, day: 15 };
            expect(formatBsDateWithMonth(bsDate, 'en')).toBe('15 Baisakh 2080');
        });

        it('should format date with Nepali month name', () => {
            const bsDate: BsDate = { year: 2080, month: 1, day: 15 };
            const result = formatBsDateWithMonth(bsDate, 'ne');
            expect(result).toContain('2080');
            expect(result).toContain('15');
        });
    });

    describe('parseBsDate', () => {
        it('should parse valid date string', () => {
            const result = parseBsDate('2080-09-15');
            expect(result).not.toBeNull();
            expect(result?.year).toBe(2080);
            expect(result?.month).toBe(9);
            expect(result?.day).toBe(15);
        });

        it('should return null for invalid format', () => {
            expect(parseBsDate('2080/09/15')).toBeNull();
            expect(parseBsDate('invalid')).toBeNull();
        });

        it('should return null for invalid date', () => {
            expect(parseBsDate('2080-13-01')).toBeNull();
            expect(parseBsDate('2080-01-32')).toBeNull();
        });
    });

    describe('getDaysInBsMonth', () => {
        it('should return correct days for known months', () => {
            // BS 2080 Baisakh has 31 days
            expect(getDaysInBsMonth(2080, 1)).toBe(31);
            // BS 2080 Chaitra has 30 days
            expect(getDaysInBsMonth(2080, 12)).toBe(30);
        });

        it('should throw error for invalid year', () => {
            expect(() => getDaysInBsMonth(1999, 1)).toThrow();
            expect(() => getDaysInBsMonth(2101, 1)).toThrow();
        });

        it('should throw error for invalid month', () => {
            expect(() => getDaysInBsMonth(2080, 0)).toThrow();
            expect(() => getDaysInBsMonth(2080, 13)).toThrow();
        });
    });

    describe('getMonthName', () => {
        it('should return English month names', () => {
            expect(getMonthName(1, 'en')).toBe('Baisakh');
            expect(getMonthName(12, 'en')).toBe('Chaitra');
        });

        it('should return Nepali month names', () => {
            expect(getMonthName(1, 'ne')).toBe('बैशाख');
            expect(getMonthName(12, 'ne')).toBe('चैत्र');
        });

        it('should throw error for invalid month', () => {
            expect(() => getMonthName(0)).toThrow();
            expect(() => getMonthName(13)).toThrow();
        });
    });
});
