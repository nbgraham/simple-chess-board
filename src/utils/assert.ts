export class ChessBoardAssertionError extends Error {
    name = 'ChessBoardAssertionError'
    constructor(message: string, ...relevantValues: any[]) {
        super(message + '\nRelevant Values:\n' + relevantValues.map(v => JSON.stringify(v)).join('\n\n'));
    }
}

export class IllegalMoveError extends ChessBoardAssertionError {
    name = 'IllegalMoveError'
    
    static fromAssertionError(assertionError: ChessBoardAssertionError) {
        return new IllegalMoveError(assertionError.message)
    }
}

export function assert(condition: boolean, message: string = 'Assertion failed', ...relevantValues: any[]) {
    if (!condition) {
        if (typeof Error !== "undefined") {
            throw new ChessBoardAssertionError(message, ...relevantValues);
        }
        throw message; // Fallback
    }
}

export function checkForErrorType<T extends ChessBoardAssertionError>(makeError: (assertionError: ChessBoardAssertionError) => T, asserts: () => void) {
    try {
        asserts()
    } catch (error) {
        if (error instanceof ChessBoardAssertionError) {
            throw makeError(error)
        } else {
            throw error;
        }
    }
}