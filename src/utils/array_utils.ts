export const last = <T>(array: Array<T>) => array.length > 0 ? array[array.length - 1] : undefined

export const noItemIn = <T>(array: Array<T>, isAnItemThatDoesX: (item: T) => boolean) => 
    array.every(item => !isAnItemThatDoesX(item))

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

export const getRandomItem = <T>(array: Array<T>) => array[Math.floor(Math.random() * array.length)]

export const average = (array: Array<number>) => array.reduce((sum, cur) => sum + cur, 0) / array.length