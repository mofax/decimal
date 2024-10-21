/**
 * Represents a decimal number with a specific scale (number of decimal places).
 *
 * @param {bigint} val - The whole number before the scale is applied. For example, for 12.345, `val` would be 12345.
 * @param {bigint} scale - The number of decimal places. For example, for 12.345, `scale` would be 3.
 */
export class DecimalNumber {
    val: bigint;
    scale: bigint;
    constructor(val: bigint, scale: bigint) {
        this.scale = scale;
        this.val = val;
    }
    /**
     * Formats a DecimalNumber into a string representation.
     *
     * @param {DecimalNumber} num - The decimal number to format.
     * @returns {string} A string representation of the decimal number.
     *
     * @example
     * ```ts
     * const num = { val: 1234567n, scale: 3n };
     * console.log(formatDecimalNumber(num)); // "1234.567"
     * ```
     */
    toString(): string {
        const val = this.val;
        const scale = this.scale;
        const isNegative = val < 0n;
        const absVal = abs(val);

        const strVal = absVal.toString().padStart(Number(scale) + 1, "0");
        const integerPart = strVal.slice(0, -Number(scale)) || "0";
        const decimalPart = strVal.slice(-Number(scale));

        const formattedNumber = `${integerPart}.${decimalPart}`;
        return isNegative ? `-${formattedNumber}` : formattedNumber;
    }
}

const abs = (n: bigint) => (n === -0n || n < 0n ? -n : n);

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
    const num = arg.toString();
    const split = num.split(".");
    if (split.length !== 2) {
        throw new Error(`${arg} is not a valid decimal number`);
    }
    return new DecimalNumber(BigInt(`${split[0]}${split[1]}`), BigInt(split[1].length) )
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
    const smallDecimalLength = smallDecimal.scale;
    const smallValExtended = smallDecimal.val * 10n ** (largeDecimalLength - smallDecimalLength);

    return new DecimalNumber(maxDecimal.val + smallValExtended, largeDecimalLength);
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
export function decimalSubtract(a: DecimalNumber, b: DecimalNumber): DecimalNumber {
    const maxDecimal = a.scale > b.scale ? a : b;
    const largeDecimalLength = maxDecimal.scale;

    if (a.scale === largeDecimalLength) {
        const bExtended = b.val * 10n ** (largeDecimalLength - b.scale);
        const hold = {
            val: a.val - bExtended,
            scale: largeDecimalLength,
        };
        return new DecimalNumber(hold.val, hold.scale);
    } else {
        const aExtended = a.val * 10n ** (largeDecimalLength - a.scale);
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
export function decimalMultiply(a: DecimalNumber, b: DecimalNumber): DecimalNumber {
    const resultValue = a.val * b.val;
    const resultScale = a.scale + b.scale;

    return new DecimalNumber(resultValue, resultScale);
}
