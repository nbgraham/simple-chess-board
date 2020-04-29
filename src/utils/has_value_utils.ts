export const ifDefined = <S,T>(potentialValue: S | undefined, mapper: (value: S) => T) => {
    const value = potentialValue;
    return value && mapper(value);
}