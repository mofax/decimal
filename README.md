# DecimalX

DecimalX is a high-precision decimal arithmetic library for JavaScript and TypeScript, providing an easy-to-use API for performing arithmetic operations on decimal numbers. 

This package is designed to handle calculations with a large number of decimal places, ensuring accuracy and performance in financial applications, scientific computations, and wherever else precise decimal arithmetic is required.

To get started with DecimalX, install the package using npm:

```bash
npm install decimalx
```

## Usage

```javascript
import { DecimalFactory } from 'decimalx';

// precision is total number of numbers allowed
// scale is the portion of the total that should be right of the decimal point
let Decimal = DecimalFactory({ precision: 20, scale: 2})
let decimalA = new Decimal('10.6');
let decimalB = new Decimal('2.3');

let sum = decimalA.add(decimalB);
let difference = decimalA.subtract(decimalB);
let product = decimalA.mul(decimalB);
let distribution = decimalA.distribute(3);

console.log(sum.valueAsString()); // '12.90'
console.log(difference.valueAsString()); // '8.30'
console.log(product.valueAsString()); // '24.38'
console.log(distribution.map(d => d.valueAsString())); // ['3.50', '3.50', '3.60']
```

The Decimal class also provides the following methods for different representations:
 - 
 - `valueAsBigint()` - Returns the value as a BigInt
 - `valueAsNumber()` - Returns the value as a number
 - `valueAsString()` - Returns the value as a string
 - `definition()` - Returns the precision and scale used for the Decimal
