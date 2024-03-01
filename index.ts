export interface Decimal {
    valueAsBigint(): bigint;
    valueAsNumber(): Number;
    valueAsString(): String;
    add(...arg: Decimal[]): Decimal;
    mul(...arg: Decimal[]): Decimal;
    subtract(arg: Decimal): Decimal;
    distribute(arg: number): Decimal[];
}

/**
 * Represents the definition of a decimal number.  
 * `precision` - The total number of digits in the number, including both the integer and the fractional parts.  
 * `scale` - The number of digits to the right of the decimal point.
 */
interface DecimalDefinition {
    precision: number;
    scale: number;
}

interface DecimalDefinition {
    precision: number;
    scale: number;
}

export interface NumberDecimal {
    integer: bigint;
    decimal: bigint;
}

/**
 * Coverts a string float into a bigint, based on the provided DecimalDef.
 * This removes the decimal point and returns everything as one big integer
 * 
 * 
 * @param value - The string to parse.
 * @param definition - The DecimalDefinition to use for parsing.
 * @returns The parsed bigint.
 * @throws If the provided string is not valid as a float.
 * @throws If the integer part of the string is not within the expected range.
 * @throws If the decimal part of the string is not within the expected range.
 * @throws If the decimal part of the string could not be extracted.
 */
export function parseString(value: string, definition: DecimalDefinition): bigint {
    const error = new Error("Provided string is not valid as a float");
    const split = value.split(".");

    // We can only have one dot (.)
    if (split.length === 0 || split.length > 2) {
        throw error;
    }

    const integerPart = () => {
        const partString = split.at(0);

        if (!partString || partString.length > (definition.precision - definition.scale)) {
            throw new Error(`Expected integer part of between 0 to ${definition.precision - definition.scale} numbers`)
        }

        const part = Number(partString);

        if (Number.isNaN(part)) {
            throw new Error(`Could not parse ${partString} as an integer`);
        }

        return part;
    };

    const decimalPart = () => {
        let partString = split.at(1);
        if (!partString || partString.length === 0) {
            return "";
        }
        if (partString.length > definition.scale) {
            throw new Error(`Only ${definition.scale} decimal places allowed`);
        }
        if (partString.length < definition.scale) {
            partString = partString.padEnd(definition.scale, "0");
        }
        let num = Number(partString);
        if (Number.isNaN(num)) {
            throw new Error("Could not extract decimal part from the string");
        }

        return num;
    };

    return BigInt(`${integerPart()}${decimalPart()}`);
}

/**
 * This is factory function that returns a class definition that implements the Decimal interface.
 * The idea is to be able to do accurate mathematical operations on floats
 * 
 * @param arg - The definition of the decimal number.
 * @returns A new class that implements the Decimal interface.
 */
export function DecimalFactory(arg: DecimalDefinition) {
    let precision = BigInt(arg.precision);
    let scale = BigInt(arg.scale);

    /**
     * Represents a high-precision decimal number.
     * The precision and scale of the number are defined in the DecimalDefinition.
     * The number is stored as a BigInt to ensure accuracy.
     */
    return class DecimalX implements Decimal {
        #bigIntPart: bigint;

        constructor(source: string | bigint) {
            switch (typeof source) {
                // If the source is a string, parse it and assign the result to #bigIntPart
                case "string": {
                    this.#bigIntPart = parseString(source as string, {
                        precision: arg.precision,
                        scale: arg.scale,
                    });
                    break;
                }
                // If the source is a bigint, assign it to #bigIntPart
                case "bigint": {
                    this.#bigIntPart = source as bigint;
                    break;
                }
                // If the source is neither a string nor a bigint, throw an error
                default: {
                    throw new Error("Value of unsupported type was provided to Decimal");
                }
            }
        }
        /**
         * Sums one or more Decimals with the current value.
         * 
         * @param args - The Decimal instances to add.
         * @returns A new Decimal instance representing the sum.
         */
        add(...args: Decimal[]) {
            let accumulator = this.#bigIntPart;
            for (let arg of args) {
                accumulator = accumulator + arg.valueAsBigint();
            }
            return new DecimalX(accumulator);
        }
        /**
         * Subtract decimals
         * 
         * @param arg - The Decimal instance to subtract.
         * @returns A new Decimal instance representing the difference.
         */
        subtract(arg: Decimal) {
            return new DecimalX(this.#bigIntPart - arg.valueAsBigint());
        }
        /**
         * Multiplies one or more Decimals with the current value.
         * 
         * @param args - The Decimal instances to multiply.
         * @returns A new Decimal instance representing the product.
         */
        mul(...args: Decimal[]) {
            let accumulator = this.#bigIntPart;
            for (let arg of args) {
                accumulator = accumulator * arg.valueAsBigint();
            }
            return new DecimalX(accumulator);
        }
        /**
         * Distributes the current value into a specified number of parts.
         * This is essentially a division function, that also returns remainders.
         * 
         * @param arg - The number of parts to distribute the value into.
         * @returns An array of Decimal instances representing the distributed parts.
         */
        distribute(arg: number): Decimal[] {
            let d = this.#bigIntPart / BigInt(arg);
            let r = this.#bigIntPart % BigInt(arg);

            let pool = new Array<Decimal>(arg);
            for (let count = 0; count < arg; count++) {
                pool[count] = new DecimalX(d);
            }

            pool[pool.length - 1] = new DecimalX(d + r);

            return pool;
        }

        valueAsBigint() {
            return this.#bigIntPart;
        }
        /**
         * Returns the value as a number.
         * 
         * @warning This operation could lose precision due to MAX_SAFE_INTEGER limit in javascript.
         * @returns The value as a number.
         */
        valueAsNumber(): Number {
            return Number(this.valueAsString());
        }
        valueAsString(): string {
            const powerOfTen = 10n ** scale;
            const integerPart = this.#bigIntPart / powerOfTen;
            const decimalPart = this.#bigIntPart % powerOfTen;
            return `${integerPart}.${decimalPart}`;
        }
        /**
         * Returns the definition of the decimal number.
         * 
         * @returns The precision and scale used for the Decimal.
         */
        definition() {
            return {
                precision,
                scale
            }
        }
    };
}
