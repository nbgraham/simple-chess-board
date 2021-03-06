import { BoardUtils } from "../utils/board_utils";

export type Vector = [number, number];
const ROW = 0;
const COL = 1;

export type Cell = {
  rowIndex: number;
  columnIndex: number;
}

export const Cell = {
  equals: (cell?: Cell, otherCell?: Cell) => {
    return cell === otherCell ||
    (!!cell && !!otherCell && cell.rowIndex === otherCell.rowIndex && cell.columnIndex === otherCell.columnIndex);
  },

  hash: (cell?: Cell) => {
    return cell ? `${cell.rowIndex}_${cell.columnIndex}` : ''
  },

  toString: (cell: Cell) => {
    return `${BoardUtils.getLabelForColumn(cell.columnIndex)}${BoardUtils.getLabelForRow(cell.rowIndex)}`
  },

  addVector: (cell: Cell, vector: Vector): Cell => {
    return {
      rowIndex: cell.rowIndex + vector[ROW],
      columnIndex: cell.columnIndex + vector[COL]
    };
  },

  difference: (cell: Cell, otherCell: Cell): Vector => {
    return [cell.rowIndex - otherCell.rowIndex, cell.columnIndex - otherCell.columnIndex];
  },
}

export const Vector = {
  normalize: (vector: Vector) => {
    const largestValue = Math.max(...(vector.map(Math.abs)));
    return largestValue === 0 ? vector :
      vector.map(value => value / largestValue) as Vector
  },
  isPerpendicular: (vector: Vector) => {
    const normalizedVector = Vector.normalize(vector);
    const positiveValuedVector = normalizedVector.map(Math.abs);
    return Math.min(...positiveValuedVector) === 0 && Math.max(...positiveValuedVector) === 1
  },
  isDiagonal: (vector: Vector) => {
    const normalizedVector = Vector.normalize(vector);
    const positiveValuedVector = normalizedVector.map(Math.abs);
    return Math.min(...positiveValuedVector) === 1 && Math.max(...positiveValuedVector) === 1
  }
}