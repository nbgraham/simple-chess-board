import { c } from "./cell_shorthand"

test('cell shorthand column e', () => {
    expect(c('e7')).toEqual( {rowIndex: 1, columnIndex: 4})
    expect(c('e5')).toEqual( {rowIndex: 3, columnIndex: 4})
})


test('cell shorthand column change row and column', () => {
    expect(c('d8')).toEqual( {rowIndex: 0, columnIndex: 3})
    expect(c('h4')).toEqual( {rowIndex: 4, columnIndex: 7})
})