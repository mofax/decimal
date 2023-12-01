export interface Decimal {
    valueAsBigint(): bigint;
    valueAsNumber(): Number;
    valueAsString(): String;
    add(...arg: Decimal[]): Decimal;
    mul(...arg: Decimal[]): Decimal;
    subtract(arg: Decimal): Decimal;
    distribute(arg: number): Decimal[];
}

interface DecimalDef {
    precision: number;
    scale: number;
}

export interface NumberDecimal {
    integer: bigint;
    decimal: bigint;
}

export function parseString(value: string, def: DecimalDef): bigint {
    const error = new Error("Provided string is not valid as a float");
    const split = value.split(".");
    if (split.length === 0 || split.length > 2) {
        throw error;
    }

    const integerPart = () => {
        const partString = split.at(0);

        if (!partString || partString.length > (def.precision - def.scale)) {
            throw new Error(`Expected integer part of between 0 to ${def.precision - def.scale} numbers`)
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
        if (partString.length > def.scale) {
            throw new Error(`Only ${def.scale} decimal places allowed`);
        }
        if (partString.length < def.scale) {
            partString = partString.padEnd(def.scale, "0");
        }
        let num = Number(partString);
        if (Number.isNaN(num)) {
            throw new Error("Could not extract decimal part from the string");
        }

        return num;
    };

    return BigInt(`${integerPart()}${decimalPart()}`);
}

export function DecimalFactory(arg: DecimalDef) {
    let precision = BigInt(arg.precision);
    let scale = BigInt(arg.scale);

    return class DecimalX implements Decimal {
        #bigIntPart: bigint;

        constructor(source: string | bigint) {
            let sourceType = typeof source;
            switch (sourceType) {
                case "string": {
                    this.#bigIntPart = parseString(source as string, {
                        precision: arg.precision,
                        scale: arg.scale,
                    });
                    break;
                }
                case "bigint": {
                    this.#bigIntPart = source as bigint;
                    break;
                }
                default: {
                    throw new Error("Value of unsupported type was provided to Decimal");
                }
            }
        }
        add(...args: Decimal[]) {
            let accumulator = this.#bigIntPart;
            for (let arg of args) {
                accumulator = accumulator + arg.valueAsBigint();
            }
            return new DecimalX(accumulator);
        }
        subtract(arg: Decimal) {
            return new DecimalX(this.#bigIntPart - arg.valueAsBigint());
        }
        mul(...args: Decimal[]) {
            let accumulator = this.#bigIntPart;
            for (let arg of args) {
                accumulator = accumulator * arg.valueAsBigint();
            }
            return new DecimalX(accumulator);
        }
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
        valueAsNumber(): Number {
            // const powerOfTen = 10n ** scale;
            // const integerPart = this.#bigIntPart / powerOfTen;
            // const decimalPart = this.#bigIntPart % powerOfTen;
            // return Number(`${integerPart}.${decimalPart}`);
            return Number(this.valueAsString());
        }
        valueAsString(): string {
            const powerOfTen = 10n ** scale;
            const integerPart = this.#bigIntPart / powerOfTen;
            const decimalPart = this.#bigIntPart % powerOfTen;
            return `${integerPart}.${decimalPart}`;
        }
        definition() {
            return {
                precision,
                scale
            }
        }
    };
}
