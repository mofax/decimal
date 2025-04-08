import { Bigmath } from "./bigmath";

/**
 * Represents a decimal number with a specific scale (number of decimal places).
 *
 * @param {bigint} val - The whole number before the scale is applied. For example, for 12.345, `val` would be 12345.
 * @param {bigint} scale - The number of decimal places. For example, for 12.345, `scale` would be 3.
 */
export class DecimalNumber {
   val: bigint;
   scale: number;
   constructor(val: bigint | number, scale: number) {
      if (typeof val === "number" && !Number.isInteger(val)) {
         throw new Error(`val must be an integer`);
      }
      if (Number.isInteger(scale)) {
         this.scale = scale;
         this.val = BigInt(val);
      } else {
         throw new Error(`scale must be an integer`);
      }
   }
   /**
    * Formats a DecimalNumber into a string representation.
    *
    * @example
    * ```ts
    * const num = { val: 1234567n, scale: 3n };
    * console.log(formatDecimalNumber(num)); // "1234.567"
    * ```
    */
   toString(): string {
      const valStr = Bigmath.abs(this.val).toString();
      const scale = this.scale;
      const isNegative = this.val < 0;

      if (scale === 0) return isNegative ? `-${valStr}` : valStr; // No decimal point needed

      const padLength = Math.max(scale - valStr.length, 0);
      const paddedVal = "0".repeat(padLength) + valStr;
      const intPart = paddedVal.slice(0, -scale) || "0";
      const fracPart = paddedVal.slice(-scale);

      return `${isNegative ? "-" : ""}${intPart}.${fracPart}`;
   }
}

function assertIsSafeNumber(value: number, source: number | string): number {
   if (Number.isNaN(value)) {
      throw new Error(`${source} is not a number`);
   }
   if (!Number.isFinite(value)) {
      throw new Error(`${source} is not a number`);
   }
   if (value > Number.MAX_SAFE_INTEGER) {
      throw new Error(`${source} is larger than MAX_SAFE_INTEGER`);
   }
   return value;
}

/**
 * Converts a number or string to a DecimalNumber instance.
 *
 * @param {number | string} arg - The number or string to convert to a decimal number.
 * @returns {DecimalNumber} A DecimalNumber instance created from the input.
 * @throws Will throw an error if the input is not a valid decimal number.
 *
 * @example
 * ```ts
 * const decimal = toDecimalNumber("1234.567");
 * console.log(decimal.val); // 1234567n
 * console.log(decimal.scale); // 3n
 * ```
 */
export function toDecimalNumber(arg: number | string): DecimalNumber {
   const num = arg.toString().trim();
   const split = num.split(".");
   let value: number;
   let scale: number;
   if (split.length === 1) {
      value = Number(split[0]);
      scale = 0;
      assertIsSafeNumber(value, arg);
      return new DecimalNumber(value, scale);
   } else if (split.length === 2) {
      value = Number(split[0] + split[1]);
      scale = Number(split[1].length);
      assertIsSafeNumber(value, arg);
      assertIsSafeNumber(scale, arg);
      return new DecimalNumber(value, scale);
   } else {
      throw new Error(`${arg} is not a valid decimal number`);
   }
}

/**
 * Adds two DecimalNumber instances and returns the result.
 *
 * @param {DecimalNumber} a - The first decimal number.
 * @param {DecimalNumber} b - The second decimal number.
 * @returns {DecimalNumber} The result of adding the two decimal numbers.
 *
 * @example
 * ```ts
 * const num1 = new DecimalNumber(123n, 2n);
 * const num2 = new DecimalNumber(456n, 2n);
 * const sum = decimalAdd(num1, num2);
 * console.log(sum.toString()); // "5.79"
 * ```
 */
export function decimalAdd(a: DecimalNumber, b: DecimalNumber): DecimalNumber {
   const maxDecimal = a.scale > b.scale ? a : b;
   const smallDecimal = a.scale > b.scale ? b : a;
   const largeDecimalLength = maxDecimal.scale;
   const smallDecimalLength = BigInt(smallDecimal.scale);
   const smallValExtended =
      smallDecimal.val * 10n ** (BigInt(largeDecimalLength) - smallDecimalLength);

   return new DecimalNumber(
      maxDecimal.val + smallValExtended,
      largeDecimalLength,
   );
}

/**
 * Subtracts the second DecimalNumber from the first and returns the result.
 *
 * @param {DecimalNumber} a - The decimal number to subtract from.
 * @param {DecimalNumber} b - The decimal number to subtract.
 * @returns {DecimalNumber} The result of the subtraction.
 *
 * @example
 * ```ts
 * const num1 = new DecimalNumber(567n, 2n);
 * const num2 = new DecimalNumber(123n, 2n);
 * const difference = decimalSubtract(num1, num2);
 * console.log(difference.toString()); // "4.44"
 * ```
 */
export function decimalSubtract(
   a: DecimalNumber,
   b: DecimalNumber,
): DecimalNumber {
   const maxDecimal = a.scale > b.scale ? a : b;
   const largeDecimalLength = maxDecimal.scale;

   if (a.scale === largeDecimalLength) {
      const bExtended = b.val * 10n ** (BigInt(largeDecimalLength) - BigInt(b.scale));
      const hold = {
         val: a.val - bExtended,
         scale: largeDecimalLength,
      };
      return new DecimalNumber(hold.val, hold.scale);
   } else {
      const aExtended = a.val * 10n ** (BigInt(largeDecimalLength) - BigInt(a.scale));
      const hold = {
         val: aExtended - b.val,
         scale: largeDecimalLength,
      };
      return new DecimalNumber(hold.val, hold.scale);
   }
}

/**
 * Multiplies two DecimalNumber instances and returns the result.
 *
 * @param {DecimalNumber} a - The first decimal number.
 * @param {DecimalNumber} b - The second decimal number.
 * @returns {DecimalNumber} The result of multiplying the two decimal numbers.
 *
 * @example
 * ```ts
 * const num1 = new DecimalNumber(12n, 1n);
 * const num2 = new DecimalNumber(34n, 1n);
 * const product = decimalMultiply(num1, num2);
 * console.log(product.toString()); // "40.8"
 * ```
 */
export function decimalMultiply(
   a: DecimalNumber,
   b: DecimalNumber,
): DecimalNumber {
   const resultValue = a.val * b.val;
   const resultScale = a.scale + b.scale;

   return new DecimalNumber(resultValue, resultScale);
}
