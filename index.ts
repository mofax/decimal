export class DecimalNumber {
    /** The number with the decimal removed. eg. 12.345 => 12345 */
    val: bigint;
    /** Number of Decimal Places. eg. 12.345 => 3 */
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
     * const num = { val: 1234567n, scale: 3n };
     * console.log(formatDecimalNumber(num)); // "1234.567"
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

type DecimalParts = {
    val: readonly [bigint, bigint];
    lengths: readonly [number, number];
};

const abs = (n: bigint) => (n === -0n || n < 0n ? -n : n);

function bigIntToDecimal(origin: bigint, scale: bigint): DecimalParts {
    const tenToTheA = BigInt(10) ** scale;

    // Calculate integer part and decimal part using division and modulus
    const integerPart = origin / tenToTheA; // This will give the integer part
    const decimalPart = origin % tenToTheA; // This will give the decimal part

    return {
        val: [integerPart, decimalPart],
        lengths: [integerPart.toString().length, Number(scale)],
    };
}

/**
 * Converts a number or string representation of a decimal number into a structured format.
 *
 * The function takes an argument that can be either a number or a string. It splits the input
 * into its integer and decimal components, returning them as a tuple. It also provides the
 * lengths of both components as a tuple.
 *
 * @param {number | string} arg - The input value to convert, which should represent a decimal number.
 * @throws {Error} Throws an error if the input is not a valid decimal number (i.e., not containing a decimal point or having NaN values).
 * @returns {{ val: DecimalNumber, lengths: [number, number] }} An object containing:
 *  - `val`: A readonly tuple representing the integer and decimal parts of the number.
 *  - `lengths`: An array containing the lengths of the integer and decimal parts as numbers.
 *
 * @example
 * const result = toDecimalNumber("12.34");
 * console.log(result.val);     // Output: [12, 34]
 * console.log(result.lengths);  // Output: [2, 2]
 *
 * @example
 * const result = toDecimalNumber(5.678);
 * console.log(result.val);     // Output: [5, 678]
 * console.log(result.lengths);  // Output: [1, 3]
 *
 * @example
 * // Throws an error
 * toDecimalNumber("not.a.number");
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
 * Adds two structured decimal numbers together.
 *
 * The function takes two DecimalNumber objects, adds their integer and decimal parts,
 * and returns the result as a new DecimalNumber. It handles carry-over if the sum of
 * the decimal parts exceeds the decimal place limit.
 *
 * @param {DecimalNumber} a - The first decimal number to add.
 * @param {DecimalNumber} b - The second decimal number to add.
 * @returns {DecimalNumber} A new DecimalNumber representing the sum of the two inputs.
 *
 * @example
 * const num1 = toDecimalNumber("12.34");
 * const num2 = toDecimalNumber("5.678");
 * const result = add(num1, num2);
 * console.log(result.val);     // Output: [18, 18]
 * console.log(result.lengths);  // Output: [2, 3]
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
 * Subtracts two structured decimal numbers.
 *
 * The function takes two DecimalNumber objects, subtracts their integer and decimal parts,
 * and returns the result as a new DecimalNumber. It handles borrowing if the decimal part of
 * the first number is smaller than that of the second number.
 *
 * @param {DecimalNumber} a - The first decimal number (minuend).
 * @param {DecimalNumber} b - The second decimal number (subtrahend).
 * @returns {DecimalNumber} A new DecimalNumber representing the result of the subtraction.
 *
 * @example
 * const num1 = toDecimalNumber("12.34");
 * const num2 = toDecimalNumber("5.678");
 * const result = decimalSubtract(num1, num2);
 * console.log(result.val);     // 6662
 * console.log(result.scale);    // 3
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
 * Multiplies two structured decimal numbers.
 *
 * The function takes two DecimalNumber objects, multiplies their values,
 * and adjusts the scale accordingly. It returns the result as a new DecimalNumber.
 *
 * @param {DecimalNumber} a - The first decimal number to multiply.
 * @param {DecimalNumber} b - The second decimal number to multiply.
 * @returns {DecimalNumber} A new DecimalNumber representing the product of the two inputs.
 *
 * @example
 * const num1 = toDecimalNumber("12.34");
 * const num2 = toDecimalNumber("5.678");
 * const result = decimalMultiply(num1, num2);
 * console.log(result.val);     // 70067252
 * console.log(result.scale);   // 6
 */
export function decimalMultiply(a: DecimalNumber, b: DecimalNumber): DecimalNumber {
    const resultValue = a.val * b.val;
    const resultScale = a.scale + b.scale;

    return new DecimalNumber(resultValue, resultScale);
}
