import { describe, expect, it } from "bun:test";
import { toDecimalNumber, decimalAdd, decimalSubtract, decimalMultiply } from "./index";

describe("Decimal Number Utilities", () => {
    // Tests for toDecimalNumber
    describe("toDecimalNumber", () => {
        it("shoul handle values less than 1", () => {
            const result = toDecimalNumber("0.5");
            expect(result.val).toEqual(BigInt(5));
            expect(result.scale).toEqual(BigInt(1));
        })
        it("should convert a valid string decimal number", () => {
            const result = toDecimalNumber("12.34");
            expect(result.val).toEqual(BigInt(1234));
            expect(result.scale).toEqual(BigInt(2));
        });

        it("should convert a valid number decimal", () => {
            const result = toDecimalNumber(5.678);
            expect(result.val).toEqual(BigInt(5678));
            expect(result.scale).toEqual(BigInt(3));
        });

        it("should throw an error for invalid decimal input", () => {
            expect(() => toDecimalNumber("not.a.number")).toThrow(Error);
            expect(() => toDecimalNumber("123.abc")).toThrow(Error);
        });

        it("should throw an error for integers without decimal", () => {
            expect(() => toDecimalNumber(123)).toThrow(Error);
        });
    });

    // Tests for decimalAdd
    describe("decimalAdd", () => {
        it("should add two DecimalNumbers correctly - 1", () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("5.678");
            const result = decimalAdd(num1, num2);
            console.log(result.val);
            expect(result.val).toBe(BigInt(18018));
            expect(result.scale).toBe(BigInt(3));
        });

        it("should add two DecimalNumbers correctly - 2", () => {
            const num1 = toDecimalNumber("6.7894");
            const num2 = toDecimalNumber("5.51");
            const result = decimalAdd(num1, num2);
            console.log(result.val);
            expect(result.val).toBe(BigInt(122994));
            expect(result.scale).toBe(BigInt(4));
        });

        it("should handle carry-over when adding decimal parts", () => {
            const num1 = toDecimalNumber("10.99");
            const num2 = toDecimalNumber("0.02");
            const result = decimalAdd(num1, num2);
            console.log(result);
            expect(result.val).toBe(BigInt(1101));
            expect(result.scale).toBe(BigInt(2));
        });

        it("should handle adding with differing decimal lengths", () => {
            const num1 = toDecimalNumber("1.1");
            const num2 = toDecimalNumber("0.123");
            const result = decimalAdd(num1, num2);
            expect(result.val).toEqual(BigInt(1223));
            expect(result.scale).toEqual(BigInt(3));
        });

        it("should handle addition resulting in a whole number", () => {
            const num1 = toDecimalNumber("0.5");
            const num2 = toDecimalNumber("0.5");
            const result = decimalAdd(num1, num2);
            console.log(result);
            expect(result.val).toBe(BigInt(10));
            expect(result.scale).toBe(BigInt(1));
        });
    });

    describe('decimalSubtract', () => {
    
        it('basic subtraction without borrowing', () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("5.67");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(667n); 
            expect(result.scale).toBe(2n);
        });
    
        it('subtraction with borrowing in decimal part', () => {
            const num1 = toDecimalNumber("10.50");
            const num2 = toDecimalNumber("5.678");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(4822n); 
            expect(result.scale).toBe(3n);
        });
    
        it('subtraction resulting in negative value', () => {
            const num1 = toDecimalNumber("5.678");
            const num2 = toDecimalNumber("10.50");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(-4822n);
            expect(result.scale).toBe(3n);
        });
    
        it('subtraction with equal values', () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("12.34");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(0n); 
            expect(result.scale).toBe(2n);
        });
    
        it('subtraction where decimal parts are equal but integer parts differ', () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("11.34");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(100n); 
            expect(result.scale).toBe(2n);
        });
    
        it('subtraction with larger scale', () => {
            const num1 = toDecimalNumber("1.12345");
            const num2 = toDecimalNumber("1.12");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(345n); 
            expect(result.scale).toBe(5n);
        });
    
        it('subtraction with zero', () => {
            const num1 = toDecimalNumber("0.00");
            const num2 = toDecimalNumber("1.00");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(-100n); 
            expect(result.scale).toBe(2n);
        });
    
        it('subtraction of large numbers', () => {
            const num1 = toDecimalNumber("1000000.12345");
            const num2 = toDecimalNumber("999999.123");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(100045n); 
            expect(result.scale).toBe(5n);
        });
    
        it('subtraction with one "zero" in the decimal part', () => {
            const num1 = toDecimalNumber("10.0");
            const num2 = toDecimalNumber("5.0");
            const result = decimalSubtract(num1, num2);
            expect(result.val).toBe(50n); 
            expect(result.scale).toBe(1n);
        });
    });

    describe("decimalMultiply", () => {
        it("should multiply two positive integers", () => {
            const num1 = toDecimalNumber("5.00");
            const num2 = toDecimalNumber("3.00");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(150000n);
            expect(result.scale).toBe(4n);
        });

        it("should multiply two positive decimals", () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("5.678");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(7006652n);
            expect(result.scale).toBe(5n);
        });

        it("should handle multiplication by zero", () => {
            const num1 = toDecimalNumber("12.34");
            const num2 = toDecimalNumber("0.00");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(0n);
            expect(result.scale).toBe(4n);
        });

        it("should handle multiplication of negative numbers", () => {
            const num1 = toDecimalNumber("-12.34");
            const num2 = toDecimalNumber("5.678");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(-7006652n);
            expect(result.scale).toBe(5n);
        });

        it("should handle multiplication of two negative numbers", () => {
            const num1 = toDecimalNumber("-12.34");
            const num2 = toDecimalNumber("-5.678");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(7006652n);
            expect(result.scale).toBe(5n);
        });

        it("should handle multiplication with different scales", () => {
            const num1 = toDecimalNumber("1.000");
            const num2 = toDecimalNumber("20.0");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(200000n);
            expect(result.scale).toBe(4n);
        });

        it("should handle large numbers", () => {
            const num1 = toDecimalNumber("1234567.890123456789");
            const num2 = toDecimalNumber("9876543.210987654321");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(12193263113702179522374638011112635269n);
            expect(result.scale).toBe(24n);
        });

        it("should handle very small numbers", () => {
            const num1 = toDecimalNumber("0.0000000001");
            const num2 = toDecimalNumber("0.0000000002");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(2n);
            expect(result.scale).toBe(20n);
        });

        it("should maintain precision for repeating decimals", () => {
            const num1 = toDecimalNumber("0.333333333");
            const num2 = toDecimalNumber("3.000000000");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(999999999000000000n);
            expect(result.scale).toBe(num1.scale + num2.scale);
        });

        it("should handle edge case with maximum safe integer", () => {
            const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);
            const num1 = toDecimalNumber(`${maxSafeInteger}.0`);
            const num2 = toDecimalNumber("2.0");
            const result = decimalMultiply(num1, num2);
            expect(result.val).toBe(maxSafeInteger * 2n * 100n);
            expect(result.scale).toBe(2n);
        });
    });
});
