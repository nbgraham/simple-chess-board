import { range, rangeInclusive, rangeExclusive, betweenInclusive, rangeAscendingExclusive } from "./range_utils"

describe('range is inclusive of start and exclusive of end', () => {
    test('0 to 8', () => {
        expect(range(0, 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })
    test('-2 to 2', () => {
        expect(range(-2, 2)).toEqual([-2, -1, 0, 1])
    })
})

describe('rangeInclusive is inclusive of start and inclusive of end', () => {
    test('0 to 8', () => {
        expect(rangeInclusive(0, 8)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    })
    test('-2 to 2', () => {
        expect(rangeInclusive(-2, 2)).toEqual([-2, -1, 0, 1, 2])
    })
})

describe('rangeExclusive is exclusive of start and exclusive of end', () => {
    test('range exclusive 0 to 8', () => {
        expect(rangeExclusive(0, 8)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
    test('range exclusive -2 to 2', () => {
        expect(rangeExclusive(-2, 2)).toEqual([-1, 0, 1])
    })
})

describe('betweenInclusive implements x <= y <= z', () => {
    test('true: 0 <= 5 <= 10', () => {
        expect(betweenInclusive(0, 5, 10)).toBe(true)
    })
    test('true: 1 <= 1 <= 1', () => {
        expect(betweenInclusive(1, 1, 1)).toBe(true)
    })
    test('true: -5 <= -1 <= 0', () => {
        expect(betweenInclusive(-5, -1, 0)).toBe(true)
    })
    
    test('false: 10 <= 5 <= 0', () => {
        expect(betweenInclusive(10, 5, 0)).toBe(false)
    })
    test('false: 10 <= 5 <= 10', () => {
        expect(betweenInclusive(10, 5, 10)).toBe(false)
    })
})

describe('rangeAscendingExclusive', () => {
    test('0 to 8', () => {
        expect(rangeAscendingExclusive(0, 8)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
    test('-2 to 2', () => {
        expect(rangeAscendingExclusive(-2, 2)).toEqual([-1, 0, 1])
    })
    test('5 to 2', () => {
        expect(rangeAscendingExclusive(5, 2)).toEqual([3, 4])
    })
    test('-1 to 2', () => {
        expect(rangeAscendingExclusive(-1, 2)).toEqual([0, 1])
    })
    test('-5 to -2', () => {
        expect(rangeAscendingExclusive(-5, -2)).toEqual([-4, -3])
    })
})
