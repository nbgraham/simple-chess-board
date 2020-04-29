import { assert, ChessBoardAssertionError } from './assert'

test('failed assertion', () => {
    expect(() => assert(false)).toThrow(ChessBoardAssertionError)
})

test('passing assertion', () => {
    expect(() => assert(true)).not.toThrow(ChessBoardAssertionError)
})