import { DecimalFactory } from './index';
import type { Decimal } from './index';
import { describe, beforeEach, it, expect } from 'bun:test';

describe('DecimalX', () => {
    let DecimalX = DecimalFactory({ precision: 20, scale: 6 })
    let decimalInstance: Decimal;

    beforeEach(() => {
        decimalInstance = new DecimalX('123.456');
    });

    describe('valueAsBigint', () => {
        it('should return the correct bigint value', () => {
            expect(decimalInstance.valueAsBigint()).toBe(123456000n);
        });
    });

    describe('valueAsNumber', () => {
        it('should return the correct number value', () => {
            expect(decimalInstance.valueAsNumber()).toBe(123.456);
        });
    });

    describe('valueAsString', () => {
        it('should return the correct string value', () => {
            expect(decimalInstance.valueAsString()).toBe("123.456000");
        });
    });

    describe('add', () => {
        it('should correctly add two DecimalX instances', () => {
            const toAdd = new DecimalX('200.1');
            const toAddAgain = new DecimalX('143.100');

            const result1 = decimalInstance.add(toAdd);
            const result2 = decimalInstance.add(toAdd, toAddAgain);

            expect(toAdd.valueAsBigint()).toBe(200100000n)

            expect(result1.valueAsNumber()).toBe(323.556);
            expect(result1.valueAsBigint()).toBe(123456000n + 200100000n);

            expect(result2.valueAsNumber()).toBe(466.656);
            expect(result2.valueAsBigint()).toBe(123456000n + 200100000n + 143100000n);

        });
    });

    describe('mul', () => {
        it('should correctly multiply two DecimalX instances', () => {
            const result = decimalInstance.mul(new DecimalX('2'));
            expect(result.valueAsBigint()).toBe(246912000n);
        });
    });

    describe('subtract', () => {
        it('should correctly subtract a DecimalX instance', () => {
            const result = decimalInstance.subtract(new DecimalX('23.456'));
            expect(result.valueAsNumber()).toBe(100);
            expect(result.valueAsBigint()).toBe(100000000n);
        });
    });

    describe('distribute', () => {
        it('should distribute the DecimalX value into an array of DecimalX', () => {
            let Dec = DecimalFactory({ precision: 10, scale: 2 });
            let instance = new Dec("11.33");
            const distribution = instance.distribute(2);
            expect(distribution.length).toBe(2);
            expect(distribution[0].valueAsBigint()).toBe(566n);
            expect(distribution[1].valueAsBigint()).toBe(1133n - 566n);

            expect(distribution[0].valueAsNumber()).toBe(5.66);
            expect(distribution[1].valueAsNumber()).toBe(5.67);
        })

        it('should distribute the DecimalX value into an array of DecimalX', () => {
            const distribution = decimalInstance.distribute(3);
            expect(distribution.length).toBe(3);
            expect(distribution[0].valueAsNumber()).toBe(41.152);
            expect(distribution[1].valueAsNumber()).toBe(41.152);
            expect(distribution[2].valueAsNumber()).toBe(41.152);
        })

        it('should distribute the DecimalX value into an array of DecimalX', () => {
            const distribution = decimalInstance.distribute(5);
            expect(distribution.length).toBe(5);
            expect(distribution[0].valueAsNumber()).toBe(24.6912);
            expect(distribution[1].valueAsNumber()).toBe(24.6912);
            expect(distribution[2].valueAsNumber()).toBe(24.6912);
            expect(distribution[3].valueAsNumber()).toBe(24.6912);
            expect(distribution[4].valueAsNumber()).toBe(24.6912);
        })
    });
});
