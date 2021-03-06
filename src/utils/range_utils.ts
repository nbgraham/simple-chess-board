/**
 * 
 * @param start Inclusive
 * @param end Exclusive
 */
export const range = (start: number, end: number) =>
    Array.from({ length: end - start }, (_, i) => i + start);

export const rangeInclusive = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

export const rangeExclusive = (start: number, end: number) =>
    Array.from({ length: end - start - 1 }, (_, i) => i + start + 1);

export const rangeAscendingExclusive = (startOrEndA: number, startOrEndB: number) => {
    const min = startOrEndA < startOrEndB ? startOrEndA : startOrEndB;
    const max = min === startOrEndA ? startOrEndB : startOrEndA;
    return rangeExclusive(min, max);
}

export const betweenInclusive = (low: number, test: number, high: number) =>
    low <= test && test <= high;
    