import { useRef, useEffect } from "react"

export const useShallowMemo = <T extends Record<string, any>>(value: T) => {
    const previousValue = useRef(value);

    useEffect(() => {
        if (!shallowEqual(previousValue.current, value)) {
            previousValue.current = value;
        }
    }, [value])

    return previousValue.current;
}

function shallowEqual<T extends Record<string, any>>(a: T, b: T) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    return aKeys.every(key => a[key] === b[key]);
}