type CellConstructorProps = {
  rowIndex: number
  columnIndex: number
}

export type Vector = [number, number];
const ROW = 0;
const COL = 1;
export class Cell {
  rowIndex: number;
  columnIndex: number;

  constructor(rowIndex: number, columnIndex: number) {
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
  }

  equals(otherCell?: Cell) {
    return !!otherCell && this.rowIndex === otherCell.rowIndex && this.columnIndex === otherCell.columnIndex;
  }

  toString() {
    return `${'abcdefgh'[this.columnIndex]}${8 - this.rowIndex}`
  }

  addVector(vector: Vector) {
    return new Cell(this.rowIndex + vector[ROW], this.columnIndex + vector[COL]);
  }
}