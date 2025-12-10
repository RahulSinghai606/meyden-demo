// Tests for datetime utilities
import { getCurrentUTC, toUTC, getUTCWithOffset, DateOffsets, isExpired, formatToISO, parseISO } from '../datetime';

describe('DateTime Utils', () => {
    describe('getCurrentUTC', () => {
        it('should return a Date object', () => {
            const result = getCurrentUTC();
            expect(result).toBeInstanceOf(Date);
        });

        it('should return current time', () => {
            const before = new Date();
            const result = getCurrentUTC();
            const after = new Date();

            expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('toUTC', () => {
        it('should convert Date object to UTC', () => {
            const date = new Date('2024-01-15T10:30:00Z');
            const result = toUTC(date);
            expect(result).toBeInstanceOf(Date);
        });

        it('should convert string to UTC Date', () => {
            const dateStr = '2024-01-15T10:30:00Z';
            const result = toUTC(dateStr);
            expect(result).toBeInstanceOf(Date);
        });

        it('should convert number (timestamp) to UTC Date', () => {
            const timestamp = Date.now();
            const result = toUTC(timestamp);
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe('getUTCWithOffset', () => {
        it('should add positive offset', () => {
            const before = Date.now();
            const result = getUTCWithOffset(DateOffsets.HOUR);
            const after = Date.now();

            expect(result.getTime()).toBeGreaterThanOrEqual(before + DateOffsets.HOUR);
            expect(result.getTime()).toBeLessThanOrEqual(after + DateOffsets.HOUR);
        });

        it('should handle negative offset', () => {
            const before = Date.now();
            const result = getUTCWithOffset(-DateOffsets.DAY);

            expect(result.getTime()).toBeLessThan(before);
        });
    });

    describe('DateOffsets', () => {
        it('should have correct MINUTE value', () => {
            expect(DateOffsets.MINUTE).toBe(60 * 1000);
        });

        it('should have correct HOUR value', () => {
            expect(DateOffsets.HOUR).toBe(60 * 60 * 1000);
        });

        it('should have correct DAY value', () => {
            expect(DateOffsets.DAY).toBe(24 * 60 * 60 * 1000);
        });

        it('should have correct WEEK value', () => {
            expect(DateOffsets.WEEK).toBe(7 * 24 * 60 * 60 * 1000);
        });
    });

    describe('isExpired', () => {
        it('should return true for past date', () => {
            const pastDate = new Date(Date.now() - DateOffsets.DAY);
            const result = isExpired(pastDate);
            expect(result).toBe(true);
        });

        it('should return false for future date', () => {
            const futureDate = new Date(Date.now() + DateOffsets.DAY);
            const result = isExpired(futureDate);
            expect(result).toBe(false);
        });
    });

    describe('formatToISO', () => {
        it('should format date as ISO string', () => {
            const date = new Date('2024-01-15T10:30:00Z');
            const result = formatToISO(date);
            expect(typeof result).toBe('string');
            expect(result).toContain('2024-01-15');
        });
    });

    describe('parseISO', () => {
        it('should parse ISO date string', () => {
            const dateStr = '2024-01-15T10:30:00Z';
            const result = parseISO(dateStr);
            expect(result).toBeInstanceOf(Date);
            expect(result.getUTCFullYear()).toBe(2024);
        });
    });
});
