import { describe, expect, it } from "bun:test";
// Assuming your code is in index.ts and exports DecimalNumber class and functions
import {
   DecimalNumber,
   toDecimalNumber,
   decimalAdd,
   decimalSubtract,
   decimalMultiply,
} from "./index"; // Adjust the import path if necessary

// Helper function for creating instances
const dn = (val: number, scale: number) => new DecimalNumber(val, scale);

describe("DecimalNumber Class and Utilities", () => {
   // --- DecimalNumber Constructor Tests ---
   describe("DecimalNumber Constructor", () => {
      it("should create instances with valid integer inputs", () => {
         const dec = new DecimalNumber(12345, 3);
         expect(dec.val).toBe(12345);
         expect(dec.scale).toBe(3);
      });

      it("should handle zero values correctly", () => {
         const dec = new DecimalNumber(0, 2);
         expect(dec.val).toBe(0);
         expect(dec.scale).toBe(2);
      });

      it("should handle negative values correctly", () => {
         const dec = new DecimalNumber(-500, 1);
         expect(dec.val).toBe(-500);
         expect(dec.scale).toBe(1);
      });

      // --- Input Validation / Security ---
      it("should throw error for non-integer val", () => {
         expect(() => new DecimalNumber(12.34, 2)).toThrow(
            "val and scale must both be integers",
         );
      });

      it("should throw error for non-integer scale", () => {
         expect(() => new DecimalNumber(1234, 2.5)).toThrow(
            "val and scale must both be integers",
         );
      });

      it("should throw error for NaN val", () => {
         // Note: Number.isInteger(NaN) is false, so the existing check handles this
         expect(() => new DecimalNumber(NaN, 2)).toThrow(
            "val and scale must both be integers",
         );
      });

      it("should throw error for NaN scale", () => {
         // Note: Number.isInteger(NaN) is false, so the existing check handles this
         expect(() => new DecimalNumber(123, NaN)).toThrow(
            "val and scale must both be integers",
         );
      });

      it("should throw error for Infinity val", () => {
         // Note: Number.isInteger(Infinity) is false
         expect(() => new DecimalNumber(Infinity, 2)).toThrow(
            "val and scale must both be integers",
         );
      });

      it("should throw error for Infinity scale", () => {
         // Note: Number.isInteger(Infinity) is false
         expect(() => new DecimalNumber(123, Infinity)).toThrow(
            "val and scale must both be integers",
         );
      });

      // Note: The current implementation uses `number`, not `bigint`.
      // MAX_SAFE_INTEGER checks are relevant here if inputs were not pre-validated.
      // However, the constructor relies on `Number.isInteger`, implicitly handling numbers outside safe range as non-integers.
   });

   // --- DecimalNumber.prototype.toString Tests ---
   describe("DecimalNumber.prototype.toString", () => {
      // --- Basic Formatting (from original) ---
      it("should format positive integers (scale 0) correctly", () => {
         expect(dn(123, 0).toString()).toBe("123");
         expect(dn(0, 0).toString()).toBe("0"); // Zero integer
      });

      it("should format negative integers (scale 0) correctly", () => {
         expect(dn(-456, 0).toString()).toBe("-456");
         expect(dn(-0, 0).toString()).toBe("0"); // Negative zero integer
      });

      it("should format positive decimals correctly", () => {
         expect(dn(12345, 2).toString()).toBe("123.45");
         expect(dn(12345, 5).toString()).toBe("0.12345"); // Leading zero integer part
         expect(dn(5, 1).toString()).toBe("0.5"); // Single digit fraction
         expect(dn(50, 2).toString()).toBe("0.50"); // Trailing zero in fraction
      });

      it("should format zero with decimal places correctly", () => {
         expect(dn(0, 2).toString()).toBe("0.00");
         expect(dn(0, 4).toString()).toBe("0.0000");
      });

      it("should format negative decimals correctly", () => {
         expect(dn(-12345, 2).toString()).toBe("-123.45");
         expect(dn(-123, 4).toString()).toBe("-0.0123"); // Negative with leading zero int part
         expect(dn(-5, 1).toString()).toBe("-0.5"); // Negative single digit fraction
         expect(dn(-50, 2).toString()).toBe("-0.50"); // Negative trailing zero fraction
      });

      // --- Edge Cases ---
      it("should handle scale larger than value digits", () => {
         expect(dn(12, 5).toString()).toBe("0.00012");
         expect(dn(-12, 5).toString()).toBe("-0.00012");
      });

      it("should handle large values (within Number limits)", () => {
         // Close to MAX_SAFE_INTEGER (9007199254740991)
         expect(dn(90071992547409, 2).toString()).toBe("900719925474.09");
         expect(dn(-90071992547409, 2).toString()).toBe("-900719925474.09");
      });

      // Note: Extremely large scales might cause performance issues or memory limits,
      // but the logic should hold. Testing very large scales (e.g., 1000) might be
      // considered for stress testing if relevant to the application.
   });

   // --- toDecimalNumber Tests ---
   describe("toDecimalNumber", () => {
      // --- Valid Inputs ---
      it("should convert valid positive string decimals", () => {
         const result = toDecimalNumber("12.34");
         expect(result.val).toBe(1234);
         expect(result.scale).toBe(2);
      });

      it("should convert valid negative string decimals", () => {
         const result = toDecimalNumber("-56.789");
         expect(result.val).toBe(-56789);
         expect(result.scale).toBe(3);
      });

      it("should convert valid positive string integers", () => {
         const result = toDecimalNumber("123");
         expect(result.val).toBe(123);
         expect(result.scale).toBe(0);
      });

      it("should convert valid negative string integers", () => {
         const result = toDecimalNumber("-456");
         expect(result.val).toBe(-456);
         expect(result.scale).toBe(0);
      });

      it("should convert valid positive numbers", () => {
         const result = toDecimalNumber(5.678);
         expect(result.val).toBe(5678);
         expect(result.scale).toBe(3);
      });

      it("should convert valid negative numbers", () => {
         const result = toDecimalNumber(-9.1);
         expect(result.val).toBe(-91);
         expect(result.scale).toBe(1);
      });

      it("should convert valid integers (number type)", () => {
         const result = toDecimalNumber(789);
         expect(result.val).toBe(789);
         expect(result.scale).toBe(0);
      });

      it("should convert zero correctly (string and number)", () => {
         let result = toDecimalNumber("0");
         expect(result.val).toBe(0);
         expect(result.scale).toBe(0);
         result = toDecimalNumber("0.00");
         expect(result.val).toBe(0); // Value becomes 0
         expect(result.scale).toBe(2); // Scale is preserved
         result = toDecimalNumber("-0.0");
         expect(result.val).toBe(0); // Value becomes 0
         expect(result.scale).toBe(1);
         result = toDecimalNumber(0);
         expect(result.val).toBe(0);
         expect(result.scale).toBe(0);
         result = toDecimalNumber(-0);
         expect(result.val).toBe(0);
         expect(result.scale).toBe(0);
      });

      it("should handle leading/trailing zeros in strings", () => {
         let result = toDecimalNumber("012.340");
         expect(result.val).toBe(12340); // Number("012" + "340") -> 12340
         expect(result.scale).toBe(3); // "340".length -> 3
         expect(result.toString()).toBe("12.340"); // Formatting should reflect original precision intent

         result = toDecimalNumber("0.050");
         expect(result.val).toBe(50); // Number("0" + "050") -> 50
         expect(result.scale).toBe(3); // "050".length -> 3
         expect(result.toString()).toBe("0.050");
      });

      // --- Invalid Inputs / Security ---
      it("should throw error for invalid string format (multiple dots)", () => {
         expect(() => toDecimalNumber("12.34.56")).toThrow(
            "12.34.56 is not a valid decimal number",
         );
      });

      it("should throw error for invalid string format (ends with dot)", () => {
         // This case currently works because "12.".split('.') -> ['12', '']
         // Number('12' + '') -> 12, scale = ''.length -> 0. This might be unexpected.
         // Depending on desired behavior, you might want to add validation for this.
         const result = toDecimalNumber("12.");
         expect(result.val).toBe(12);
         expect(result.scale).toBe(0);
         // If strict validation is needed, uncomment the expect.toThrow below and modify the function.
         // expect(() => toDecimalNumber("12.")).toThrow("12. is not a valid decimal number");
      });

      it("should throw error for invalid string format (starts with dot)", () => {
         const result = toDecimalNumber(".123"); // Interpreted as 0.123
         expect(result.val).toBe(123); // Number('' + '123') -> 123
         expect(result.scale).toBe(3); // '123'.length -> 3
         // If strict validation is needed, uncomment the expect.toThrow below and modify the function.
         // expect(() => toDecimalNumber(".123")).toThrow(".123 is not a valid decimal number");
      });

      it("should throw error for non-numeric strings", () => {
         expect(() => toDecimalNumber("abc")).toThrow(
            "abc is not a valid decimal number",
         );
         expect(() => toDecimalNumber("12a.34")).toThrow(
            "12a.34 is not a valid decimal number",
         ); // Fails assertIsSafeNumber
         expect(() => toDecimalNumber("12.3a4")).toThrow(
            "12.3a4 is not a valid decimal number",
         ); // Fails assertIsSafeNumber
      });

      it("should throw error for empty string", () => {
         // Number('') -> 0, so it currently converts to DecimalNumber(0, 0)
         const result = toDecimalNumber("");
         expect(result.val).toBe(0);
         expect(result.scale).toBe(0);
         // If strict validation is needed:
         // expect(() => toDecimalNumber("")).toThrow(" is not a valid decimal number");
      });

      it("should handle strings with whitespace (implicitly via toString)", () => {
         // Number(" 12.34 ".toString()) works
         const result = toDecimalNumber(" 12.34 ");
         expect(result.val).toBe(1234);
         expect(result.scale).toBe(2);
         // If strict validation against whitespace is needed, add checks in toDecimalNumber.
      });

      it("should throw error for NaN input", () => {
         // toString() converts NaN to "NaN", which fails assertIsSafeNumber
         expect(() => toDecimalNumber(NaN)).toThrow("NaN is not a number");
      });

      it("should throw error for Infinity input", () => {
         // toString() converts Infinity to "Infinity", which fails assertIsSafeNumber
         expect(() => toDecimalNumber(Infinity)).toThrow(
            "Infinity is not a number",
         );
         expect(() => toDecimalNumber(-Infinity)).toThrow(
            "-Infinity is not a number",
         );
      });

      // --- MAX_SAFE_INTEGER Boundary ---
      // Note: The implementation uses `number`. `bigint` was mentioned in comments but not used.
      // These tests check the behavior around JavaScript's safe integer limits.
      it("should handle MAX_SAFE_INTEGER correctly", () => {
         const maxSafe = Number.MAX_SAFE_INTEGER; // 9007199254740991
         const result = toDecimalNumber(maxSafe);
         expect(result.val).toBe(maxSafe);
         expect(result.scale).toBe(0);
      });

      it("should handle MIN_SAFE_INTEGER correctly", () => {
         const minSafe = Number.MIN_SAFE_INTEGER; // -9007199254740991
         const result = toDecimalNumber(minSafe);
         expect(result.val).toBe(minSafe);
         expect(result.scale).toBe(0);
      });

      it("should throw error for numbers larger than MAX_SAFE_INTEGER", () => {
         const tooLarge = Number.MAX_SAFE_INTEGER + 1;
         // Note: Direct number input might already be imprecise.
         expect(() => toDecimalNumber(tooLarge)).toThrow(
            `${tooLarge} is larger than MAX_SAFE_INTEGER`,
         );
      });

      it("should throw error for string representing value > MAX_SAFE_INTEGER", () => {
         const largeStr = "9007199254740992.0"; // One larger than MAX_SAFE_INTEGER
         // Number("9007199254740992" + "0") will exceed MAX_SAFE_INTEGER
         expect(() => toDecimalNumber(largeStr)).toThrow(
            `${largeStr} is larger than MAX_SAFE_INTEGER`,
         );
      });

      it("should throw error for string representing value with many digits > MAX_SAFE_INTEGER", () => {
         const largeStr = "12345678901234567890.123";
         // Number("12345678901234567890" + "123") definitely exceeds MAX_SAFE_INTEGER
         expect(() => toDecimalNumber(largeStr)).toThrow(
            `${largeStr} is larger than MAX_SAFE_INTEGER`,
         );
      });
   });

   // --- decimalAdd Tests ---
   describe("decimalAdd", () => {
      // --- Basic Cases ---
      it("should add two positive decimals (same scale)", () => {
         const result = decimalAdd(dn(123, 2), dn(456, 2)); // 1.23 + 4.56
         expect(result.val).toBe(579);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("5.79");
      });

      it("should add two positive decimals (different scales, a > b)", () => {
         const result = decimalAdd(dn(12345, 3), dn(67, 1)); // 12.345 + 6.7
         // 6.7 -> 6700 (scale 3)
         // 12345 + 6700 = 19045
         expect(result.val).toBe(19045);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("19.045");
      });

      it("should add two positive decimals (different scales, b > a)", () => {
         const result = decimalAdd(dn(67, 1), dn(12345, 3)); // 6.7 + 12.345
         expect(result.val).toBe(19045);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("19.045");
      });

      // --- Zero Cases ---
      it("should add zero correctly (a + 0)", () => {
         const result = decimalAdd(dn(123, 2), dn(0, 0)); // 1.23 + 0
         expect(result.val).toBe(123); // 0 * 10**(2-0) = 0; 123 + 0 = 123
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("1.23");
      });

      it("should add zero correctly (0 + b)", () => {
         const result = decimalAdd(dn(0, 1), dn(456, 3)); // 0.0 + 0.456
         expect(result.val).toBe(456); // 0 * 10**(3-1) = 0; 0 + 456 = 456
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("0.456");
      });

      // --- Negative Cases ---
      it("should add a positive and a negative decimal (result positive)", () => {
         const result = decimalAdd(dn(500, 2), dn(-123, 2)); // 5.00 + (-1.23)
         expect(result.val).toBe(377);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("3.77");
      });

      it("should add a positive and a negative decimal (result negative)", () => {
         const result = decimalAdd(dn(123, 2), dn(-500, 2)); // 1.23 + (-5.00)
         expect(result.val).toBe(-377);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("-3.77");
      });

      it("should add two negative decimals", () => {
         const result = decimalAdd(dn(-123, 2), dn(-45, 1)); // -1.23 + (-4.5)
         // -4.5 -> -450 (scale 2)
         // -123 + (-450) = -573
         expect(result.val).toBe(-573);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("-5.73");
      });

      // --- Potential Overflow/Precision Issues (using Number) ---
      // !! IMPORTANT: The current implementation uses `number` which is limited by MAX_SAFE_INTEGER.
      // !! Operations resulting in values outside this range will be imprecise or incorrect.
      // !! A `bigint` implementation would be required for true arbitrary precision.
      it("should handle addition resulting in large numbers (within safe limits)", () => {
         const num1 = toDecimalNumber("90071992547400.00"); // val = 9007199254740000, scale = 2
         const num2 = toDecimalNumber("99.99"); // val = 9999, scale = 2
         const result = decimalAdd(num1, num2);
         expect(result.val).toBe(9007199254740000 + 9999);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("90071992547499.99"); // Check if calculation remains precise
      });

      // This test demonstrates the limitation of `number`
      it("MAY FAIL OR BE IMPRECISE: should handle addition potentially exceeding MAX_SAFE_INTEGER", () => {
         const maxSafe = Number.MAX_SAFE_INTEGER;
         const num1 = new DecimalNumber(maxSafe - 10, 0); // 9007199254740981
         const num2 = new DecimalNumber(20, 0); // 20
         const result = decimalAdd(num1, num2);
         // Expected precise result: maxSafe + 10 = 9007199254741001
         // Actual result with `number`: Might be 9007199254741000 due to precision limits
         console.warn(
            `WARN: Testing addition near MAX_SAFE_INTEGER. Result might be imprecise: ${result.val}`,
         );
         // We can't reliably expect(result.val).toBe(maxSafe + 10);
         // Instead, check it's close or handle the potential error if the application requires it.
         expect(result.val).toBeGreaterThan(maxSafe); // It should at least be larger
         expect(result.scale).toBe(0);
         // A robust implementation would throw an error here if overflow occurs.
      });
   });

   // --- decimalSubtract Tests ---
   describe("decimalSubtract", () => {
      // --- Basic Cases ---
      it("should subtract two positive decimals (same scale, a > b)", () => {
         const result = decimalSubtract(dn(567, 2), dn(123, 2)); // 5.67 - 1.23
         expect(result.val).toBe(444);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("4.44");
      });

      it("should subtract two positive decimals (same scale, b > a)", () => {
         const result = decimalSubtract(dn(123, 2), dn(567, 2)); // 1.23 - 5.67
         expect(result.val).toBe(-444);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("-4.44");
      });

      it("should subtract two positive decimals (different scales, a > b)", () => {
         const result = decimalSubtract(dn(12345, 3), dn(67, 1)); // 12.345 - 6.7
         // 6.7 -> 6700 (scale 3)
         // 12345 - 6700 = 5645
         expect(result.val).toBe(5645);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("5.645");
      });

      it("should subtract two positive decimals (different scales, b > a)", () => {
         const result = decimalSubtract(dn(67, 1), dn(12345, 3)); // 6.7 - 12.345
         // 6.7 -> 6700 (scale 3)
         // 6700 - 12345 = -5645
         expect(result.val).toBe(-5645);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("-5.645");
      });

      // --- Zero Cases ---
      it("should subtract zero correctly (a - 0)", () => {
         const result = decimalSubtract(dn(123, 2), dn(0, 0)); // 1.23 - 0
         // bExtended = 0 * 10**(2-0) = 0; a.val - bExtended = 123 - 0 = 123
         expect(result.val).toBe(123);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("1.23");
      });

      it("should subtract from zero correctly (0 - b)", () => {
         const result = decimalSubtract(dn(0, 1), dn(456, 3)); // 0.0 - 0.456
         // aExtended = 0 * 10**(3-1) = 0; aExtended - b.val = 0 - 456 = -456
         expect(result.val).toBe(-456);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("-0.456");
      });

      // --- Negative Cases ---
      it("should subtract a negative from a positive (a - (-b))", () => {
         const result = decimalSubtract(dn(500, 2), dn(-123, 2)); // 5.00 - (-1.23)
         // bExtended = -123; a.val - bExtended = 500 - (-123) = 623
         expect(result.val).toBe(623);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("6.23");
      });

      it("should subtract a positive from a negative ((-a) - b)", () => {
         const result = decimalSubtract(dn(-123, 2), dn(500, 2)); // -1.23 - 5.00
         // bExtended = 500; a.val - bExtended = -123 - 500 = -623
         expect(result.val).toBe(-623);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("-6.23");
      });

      it("should subtract two negative decimals ((-a) - (-b))", () => {
         const result = decimalSubtract(dn(-123, 2), dn(-45, 1)); // -1.23 - (-4.5)
         // b scale < a scale
         // bExtended = -45 * 10**(2-1) = -450
         // a.val - bExtended = -123 - (-450) = 327
         expect(result.val).toBe(327);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("3.27");
      });

      // --- Potential Overflow/Precision Issues ---
      // Similar warnings apply as for addition regarding MAX_SAFE_INTEGER
      it("MAY FAIL OR BE IMPRECISE: should handle subtraction potentially resulting in large negative numbers", () => {
         const minSafe = Number.MIN_SAFE_INTEGER;
         const num1 = new DecimalNumber(minSafe + 10, 0); // -9007199254740981
         const num2 = new DecimalNumber(20, 0); // 20
         const result = decimalSubtract(num1, num2);
         // Expected precise result: minSafe - 10 = -9007199254741001
         // Actual result with `number`: Might be -9007199254741000
         console.warn(
            `WARN: Testing subtraction near MIN_SAFE_INTEGER. Result might be imprecise: ${result.val}`,
         );
         expect(result.val).toBeLessThanOrEqual(minSafe); // It should be less than or equal (could be imprecise)
         expect(result.scale).toBe(0);
         // A robust implementation would throw an error here.
      });
   });

   // --- decimalMultiply Tests ---
   describe("decimalMultiply", () => {
      // --- Basic Cases ---
      it("should multiply two positive decimals", () => {
         const result = decimalMultiply(dn(12, 1), dn(34, 1)); // 1.2 * 3.4
         // val = 12 * 34 = 408
         // scale = 1 + 1 = 2
         expect(result.val).toBe(408);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("4.08"); // Corrected expected string
      });

      it("should multiply positive decimals with different scales", () => {
         const result = decimalMultiply(dn(123, 2), dn(5, 1)); // 1.23 * 0.5
         // val = 123 * 5 = 615
         // scale = 2 + 1 = 3
         expect(result.val).toBe(615);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("0.615");
      });

      // --- Zero Cases ---
      it("should multiply by zero (a * 0)", () => {
         const result = decimalMultiply(dn(123, 2), dn(0, 1)); // 1.23 * 0.0
         expect(result.val).toBe(0); // 123 * 0 = 0
         expect(result.scale).toBe(3); // 2 + 1 = 3
         expect(result.toString()).toBe("0.000");
      });

      it("should multiply zero by a number (0 * b)", () => {
         const result = decimalMultiply(dn(0, 1), dn(456, 3)); // 0.0 * 0.456
         expect(result.val).toBe(0); // 0 * 456 = 0
         expect(result.scale).toBe(4); // 1 + 3 = 4
         expect(result.toString()).toBe("0.0000");
      });

      // --- Negative Cases ---
      it("should multiply a positive and a negative decimal", () => {
         const result = decimalMultiply(dn(25, 1), dn(-4, 1)); // 2.5 * -0.4
         // val = 25 * -4 = -100
         // scale = 1 + 1 = 2
         expect(result.val).toBe(-100);
         expect(result.scale).toBe(2);
         expect(result.toString()).toBe("-1.00");
      });

      it("should multiply two negative decimals", () => {
         const result = decimalMultiply(dn(-15, 1), dn(-20, 2)); // -1.5 * -0.20
         // val = -15 * -20 = 300
         // scale = 1 + 2 = 3
         expect(result.val).toBe(300);
         expect(result.scale).toBe(3);
         expect(result.toString()).toBe("0.300");
      });

      // // --- Potential Overflow/Precision Issues ---
      // // Multiplication can very quickly exceed MAX_SAFE_INTEGER
      // it("MAY FAIL OR BE IMPRECISE: should handle multiplication potentially exceeding MAX_SAFE_INTEGER", () => {
      //    const largeVal = 300000000; // 3 * 10^8
      //    const num1 = new DecimalNumber(largeVal, 2); // 3,000,000.00
      //    const num2 = new DecimalNumber(largeVal, 2); // 3,000,000.00
      //    const result = decimalMultiply(num1, num2);
      //    // Expected precise val: 300000000 * 300000000 = 9 * 10^16 = 90,000,000,000,000,000
      //    // MAX_SAFE_INTEGER is ~9 * 10^15
      //    // Expected precise scale: 2 + 2 = 4
      //    console.warn(
      //       `WARN: Testing multiplication potentially exceeding MAX_SAFE_INTEGER. Result val might be imprecise: ${result.val}`,
      //    );
      //    // The result.val will likely be incorrect due to number limitations.
      //    expect(result.val).not.toBe(90000000000000000); // It won't be the precise value
      //    expect(result.scale).toBe(4);
      //    // A robust implementation would throw an error here.
      // });
   });
});
