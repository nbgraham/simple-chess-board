
export const distinctFilter = <T>(comparator: (a: T, b: T) => boolean = defaultComparator) =>
    (currentItem: T, index: number, list: T[]) =>
        list.findIndex(item => comparator(item, currentItem)) === index;
const defaultComparator = <T>(a: T, b: T) =>
    isComparable(a) && isComparable(b) ? a.equals(b) :
        a === b;

interface Comparable<T> {
    equals: (other: T | Comparable<T>) => boolean;
}
const isComparable = <T>(a: T | Comparable<T>): a is Comparable<T> =>
    a instanceof Object && 'equals' in a && typeof a.equals === 'function';

export const flattenArray = <T>(array: T[][]) => array.reduce(
    (accumulatedArray, curArray) => [...accumulatedArray, ...curArray],
    [] as T[]);