import { addDaysToDate } from "./utils"

describe('addDaysToDate', () => {

    it('should add days within the same month', () => {
        expect(addDaysToDate("2025-10-10", 2)).toBe("2025-10-12");
    });

    it('should handle rolling over to the next month', () => {
        expect(addDaysToDate("2025-10-30", 5)).toBe("2025-11-04");
    });

    it('should handle rolling over to the next year', () => {
        expect(addDaysToDate("2025-12-30", 5)).toBe("2026-01-04");
    });

    it('should handle adding 0 days', () => {
        expect(addDaysToDate("2025-10-10", 0)).toBe("2025-10-10");
    });

    it('should correctly subtract days (negative numbers)', () => {
        expect(addDaysToDate("2025-10-12", -2)).toBe("2025-10-10");
    });

    it('should handle subtracting and rolling back to a previous month', () => {
        expect(addDaysToDate("2025-11-04", -5)).toBe("2025-10-30");
    });

    it('should handle subtracting and rolling back to a previous year', () => {
        expect(addDaysToDate("2026-01-04", -5)).toBe("2025-12-30");
    });

    it('should correctly handle a leap year', () => {
        // 2024 is a leap year
        expect(addDaysToDate("2024-02-28", 1)).toBe("2024-02-29");
        expect(addDaysToDate("2024-02-28", 2)).toBe("2024-03-01");
    });

    it('should correctly handle a non-leap year', () => {
        // 2025 is not a leap year
        expect(addDaysToDate("2025-02-28", 1)).toBe("2025-03-01");
    });

});