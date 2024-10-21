# DecimalX

**DecimalX** is a library for handling decimal arithmetic operations using arbitrary precision (`bigint`). It offers a reliable way to manage decimal values without floating-point errors, making it ideal for financial or high-precision calculations.

## Features

- **Precision Handling**: Accurately represents and manipulates decimal numbers.
- **BigInt Support**: Utilizes JavaScript’s `BigInt` for high precision.
- **Arithmetic Operations**: Supports addition, subtraction, and multiplication of `DecimalNumber` objects.
- **Flexible Input**: Converts numbers or string representations of decimal numbers into structured `DecimalNumber` format.

## Installation

Install the DecimalX library via npm:

```bash
npm install decimalx
```

## DecimalNumber Class

The `DecimalNumber` class is the core of the DecimalX library.
```ts
const num = new DecimalNumber(1234567n, 3n); // Represents 1234.567
console.log(num.toString()); // "1234.567"
```

## Functions

### toDecimalNumber

Converts a number or string representation of a decimal number into a structured format.

```ts
import { toDecimalNumber } from 'decimalx';

const result = toDecimalNumber("12.34");
console.log(result.toString()); // "12.34"

const num = toDecimalNumber(5.678);
console.log(num.toString()); // "5.678"
```

### decimalAdd

Adds two structured decimal numbers together.

```ts
import { decimalAdd } from 'decimalx';

const num1 = toDecimalNumber("12.34");
const num2 = toDecimalNumber("5.678");
const result = decimalAdd(num1, num2);
console.log(result.toString()); // "18.018"
```

### decimalSubtract

Subtracts two structured decimal numbers.

```ts
import { decimalSubtract } from 'decimalx';

const num1 = toDecimalNumber("12.34");
const num2 = toDecimalNumber("5.678");
const result = decimalSubtract(num1, num2);
console.log(result.toString()); // "6.342"
```

### decimalMultiply

Multiplies two structured decimal numbers.

```ts
import { decimalMultiply } from 'decimalx';

const num1 = toDecimalNumber("12.34");
const num2 = toDecimalNumber("5.678");
const result = decimalMultiply(num1, num2);
console.log(result.toString()); // "70067252.0"
```

## Contributing

Contributions are welcome! If you find a bug or have a suggestion, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
