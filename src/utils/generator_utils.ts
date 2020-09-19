export function makeEmptyGenerator<T>() {
    // eslint-disable-next-line
    function* emptyGenerator(): Generator<T> {
        return;
    }
    return emptyGenerator();
};

export function* onlyYieldUniqueHashes<T>(generator: Generator<T>, hashFn: (item: T) => string) {
    const generatedHashes = {} as Record<string, true | undefined>
    for (const generated of generator) {
        const hash = hashFn(generated);
        if (generatedHashes[hash] === undefined) {
            yield generated;
        }
        generatedHashes[hash] = true;
    }
}

export function toArray<T>(generator: Generator<T>) {
    let array = [] as T[];
    for (const generated of generator) {
        array.push(generated);
    }
    return array;
}

export function find<T>(generator: Generator<T>, condition: (item: T) => boolean) {
    for (const generated of generator) {
        if (condition(generated)) {
            return generated;
        }
    }
    return undefined;
}

export function some<T>(generator: Generator<T>, condition: (item: T) => boolean) {
    return find(generator, condition) !== undefined;
}

export function every<T>(generator: Generator<T>, condition: (item: T) => boolean) {
    return !some(generator, item => !condition(item))
}

export function hasItemsAndEvery<T>(generator: Generator<T>, condition: (item: T) => boolean) {
    let hasItems = false;
    for (const generated of generator) {
        hasItems = true;
        if (!condition(generated)) {
            return false;
        }
    }
    return hasItems;
}

export function willGenerateAtLeastOne<T>(generator: Generator<T>) {
    return some(generator, () => true)
}