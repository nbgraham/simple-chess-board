
export const arraysContainSameItems = <T>(arrayA: Array<T>, arrayB: Array<T>) =>
    arrayA === arrayB || (isSubset(arrayA, arrayB) && isSubset(arrayB, arrayA));

export const isSubset = <T>(arrayA: Array<T>, potentialSubset: Array<T>) =>
    arrayA === potentialSubset || potentialSubset.every(requiredItem => arrayA.includes(requiredItem));

interface Comparable<T> {
    equals: (other: T | Comparable<T>) => boolean;
}
export const distinctFilter = <T>(comparator: (a: T, b: T) => boolean = defaultComparator) =>
    (currentItem: T, index: number, list: T[]) =>
        list.findIndex(item => comparator(item, currentItem)) === index;
const defaultComparator = <T>(a: T, b: T) =>
    isComparable(a) && isComparable(b) ? a.equals(b) :
        a === b;
const isComparable = (a: any): a is Comparable<any> => typeof a.equals === 'function';

export const flattenArray = <T>(array: T[][]) => array.reduce(
    (accumulatedArray, curArray) => [...accumulatedArray, ...curArray],
    [] as T[]);