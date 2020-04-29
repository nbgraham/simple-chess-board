import { distinctFilter, flattenArray } from './array_utils'

describe('distinct', () => {
    test('all distinct', () => {
        expect([1, 2, 3, 4].filter(distinctFilter())).toEqual([1, 2, 3, 4])
    })

    test('remove one duplicate', () => {
        expect([1, 2, 3, 3].filter(distinctFilter())).toEqual([1, 2, 3])
    })

    test('entire array is duplicate', () => {
        expect([1, 1, 1].filter(distinctFilter())).toEqual([1])
    })

    test('multiple duplicates', () => {
        expect([4, 1, 1, 1, 2, 3, 2, 3, 4].filter(distinctFilter())).toEqual([4, 1, 2, 3])
    })

    test('keeps first instance', () => {
        expect([1, 2, 3, 4, 4, 3, 2, 1].filter(distinctFilter())).toEqual([1, 2, 3, 4])
    })
})

describe('flatten', () => {
    test('flatten lists with one item', () => {
        expect(flattenArray([[1], [2], [3]])).toEqual([1, 2, 3])
    })

    test('flatten lists with one item different lengths', () => {
        expect(flattenArray([[1, 2, 3], [4], [5, 6]])).toEqual([1, 2, 3, 4, 5, 6])
    })
})