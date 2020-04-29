import { arraysContainSameItems } from './array_utils';

describe('arraysContainSameItems', () => {
    test('numbers', () => {
        expect(arraysContainSameItems([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])).toBe(true)
    })

    test('same array', () => {
        const array = [1, 2, 3, 4, 5]
        expect(arraysContainSameItems(array, array)).toBe(true)
    })

    test('heterogeneous types', () => {
        expect(arraysContainSameItems([1, true, undefined], [1, true, undefined])).toBe(true)
    })

    test('order agnostic', () => {
        expect(arraysContainSameItems([1, 2, 3], [2, 3, 1])).toBe(true)
    })

    test('length agnostic', () => {
        expect(arraysContainSameItems([1, 1, 1, 2, 3], [2, 3, 1])).toBe(true)
    })

    test('objects', () => {
        const a = {};
        const b = {};
        const c = {};
        expect(arraysContainSameItems([a, b, c], [a, b, c])).toBe(true)
    })

    test('uses object equality to compare items', () => {
        expect(arraysContainSameItems([{}, {}], [{}, {}])).toBe(false)
    })

    test('numbers', () => {
        expect(arraysContainSameItems([1, 2, 4], [1, 2, 3])).toBe(false)
    })

    test('commutative', () => {
        const first = [1, 2, 4];
        const second = [1, 2, 3];
        const normal = arraysContainSameItems(first, second);
        const flipped = arraysContainSameItems(second, first);
        const expectedResult = false;
        expect(normal).toBe(expectedResult);
        expect(flipped).toBe(expectedResult);
    })

    test('different lengths', () => {
        expect(arraysContainSameItems([1, 2], [1, 2, 3])).toBe(false)
    })
})